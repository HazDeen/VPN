import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private readonly logger = new Logger(BotService.name);

  constructor(private prisma: PrismaService) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('❌ BOT_TOKEN не настроен в .env');
    }
    this.bot = new Telegraf(botToken);
  }

  async onModuleInit() {
    try {
      this.logger.log('🚀 Бот запускается...');

      // Проверяем токен
      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`✅ Бот авторизован: @${botInfo.username} (ID: ${botInfo.id})`);

      // Сбрасываем вебхуки и удаляем все ожидающие обновления
      await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
      this.logger.log('🔄 Webhook сброшен');

      // ==========================================
      // КОМАНДА /start - РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
      // ==========================================
      this.bot.command('start', async (ctx) => {
        try {
          const telegramId = ctx.from.id;
          const firstName = ctx.from.first_name || '';
          const lastName = ctx.from.last_name || '';
          const username = ctx.from.username || '';

          this.logger.log(`📥 /start от @${username} (${telegramId})`);

          // Ищем пользователя в БД
          let user = await this.prisma.user.findUnique({
            where: { telegramId: BigInt(telegramId) },
          });

          if (!user) {
            // Создаём нового пользователя
            user = await this.prisma.user.create({
              data: {
                telegramId: BigInt(telegramId),
                firstName,
                lastName,
                username,
                balance: 0, // Стартовый баланс 0
              },
            });
            this.logger.log(`✅ Новый пользователь создан: ${telegramId}`);
            
            await ctx.reply(
              `🎉 Добро пожаловать, ${firstName}!\n\n` +
              `💰 Твой баланс: ${user.balance} ₽\n` +
              `🚀 Открой Mini App, чтобы начать пользоваться VPN!`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '🌐 Открыть VPN', web_app: { url: process.env.FRONTEND_URL || 'https://vpn-frontend.netlify.app' } }]
                  ]
                }
              }
            );
          } else {
            // Обновляем данные существующего пользователя
            user = await this.prisma.user.update({
              where: { telegramId: BigInt(telegramId) },
              data: {
                firstName,
                lastName,
                username,
              },
            });
            
            this.logger.log(`👤 Пользователь уже есть: ${telegramId}, баланс: ${user.balance} ₽`);
            
            await ctx.reply(
              `👋 С возвращением, ${firstName}!\n\n` +
              `💰 Твой баланс: ${user.balance} ₽\n` +
              `🚀 Открыть Mini App:`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '🌐 Открыть VPN', web_app: { url: process.env.FRONTEND_URL || 'https://vpn-frontend.netlify.app' } }]
                  ]
                }
              }
            );
          }
        } catch (error) {
          const err = error as Error;
          this.logger.error(`❌ Ошибка /start: ${err.message}`);
          await ctx.reply('⚠️ Произошла ошибка. Попробуй позже.');
        }
      });

      // ==========================================
      // КОМАНДА /balance - ПРОВЕРКА БАЛАНСА
      // ==========================================
      this.bot.command('balance', async (ctx) => {
        try {
          const telegramId = ctx.from.id;
          
          const user = await this.prisma.user.findUnique({
            where: { telegramId: BigInt(telegramId) },
          });

          if (!user) {
            await ctx.reply('❌ Ты ещё не зарегистрирован. Напиши /start');
            return;
          }

          // Получаем количество активных устройств
          const activeDevices = await this.prisma.device.count({
            where: {
              userId: user.id,
              isActive: true,
            },
          });

          const daysLeft = activeDevices > 0 
            ? Math.floor(user.balance / (activeDevices * 10)) 
            : 30;

          await ctx.reply(
            `💰 Твой баланс: ${user.balance} ₽\n` +
            `📱 Активных устройств: ${activeDevices}\n` +
            `⏳ Хватит на ~${daysLeft > 30 ? 30 : daysLeft} дней`
          );
        } catch (error) {
          const err = error as Error;
          this.logger.error(`❌ Ошибка /balance: ${err.message}`);
          await ctx.reply('⚠️ Не удалось получить баланс');
        }
      });

      // ==========================================
      // КОМАНДА /app - ССЫЛКА НА MINI APP
      // ==========================================
      this.bot.command('app', async (ctx) => {
        try {
          const telegramId = ctx.from.id;
          const user = await this.prisma.user.findUnique({
            where: { telegramId: BigInt(telegramId) },
          });

          if (!user) {
            await ctx.reply('❌ Сначала напиши /start для регистрации');
            return;
          }

          const frontendUrl = process.env.FRONTEND_URL || 'https://vpn-frontend.netlify.app';
          
          await ctx.reply('🚀 Открыть Mini App:', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🌐 Открыть VPN', web_app: { url: frontendUrl } }],
              ],
            },
          });
        } catch (error) {
          const err = error as Error;
          this.logger.error(`❌ Ошибка /app: ${err.message}`);
        }
      });

      // ==========================================
      // КОМАНДА /help - ПОМОЩЬ
      // ==========================================
      this.bot.command('help', async (ctx) => {
        await ctx.reply(
          `📚 Доступные команды:\n\n` +
          `/start - Начать работу\n` +
          `/balance - Проверить баланс\n` +
          `/app - Открыть Mini App\n` +
          `/help - Показать это сообщение`
        );
      });

      // ==========================================
      // ОБРАБОТЧИК ТЕКСТОВЫХ СООБЩЕНИЙ
      // ==========================================
      this.bot.on('text', async (ctx) => {
        // Игнорируем команды (они уже обработаны выше)
        if (ctx.message.text.startsWith('/')) return;
        
        await ctx.reply('Используй команду /help чтобы увидеть список команд');
      });

      // ==========================================
      // ЗАПУСК БОТА
      // ==========================================
      await this.bot.launch({
        dropPendingUpdates: true,
      });
      
      this.logger.log('✅ Бот успешно запущен и слушает команды!');
      
    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Критическая ошибка запуска бота: ${err.message}`);
    }
  }

  // ==========================================
  // ОСТАНОВКА БОТА
  // ==========================================
  async onModuleDestroy() {
    this.logger.log('🛑 Останавливаем бота...');
    await this.bot.stop();
    this.logger.log('✅ Бот остановлен');
  }
}