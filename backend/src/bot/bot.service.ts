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

      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`✅ Бот авторизован: @${botInfo.username}`);

      await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
      this.logger.log('🔄 Webhook сброшен');

      this.registerCommands();

      // Запускаем бота без await, чтобы не блокировать сервер
      this.bot.launch({
        dropPendingUpdates: true,
      }).then(() => {
        this.logger.log('✅ Бот успешно запущен!');
      }).catch((error) => {
        this.logger.error(`❌ Ошибка запуска бота: ${error.message}`);
      });
      
    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Критическая ошибка: ${err.message}`);
    }
  }

  private registerCommands() {
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

        // СОЗДАЁМ ИЛИ ОБНОВЛЯЕМ ПОЛЬЗОВАТЕЛЯ
        const user = await this.prisma.user.upsert({
          where: { telegramId: BigInt(telegramId) },
          update: {
            firstName,
            lastName,
            username,
          },
          create: {
            telegramId: BigInt(telegramId),
            firstName,
            lastName,
            username,
            balance: 0,
            isAdmin: false,
          },
        });

        this.logger.log(`✅ Пользователь ${user.id} создан/обновлён`);

        // Отправляем приветствие
        await ctx.reply(
          `🎉 Добро пожаловать, ${firstName}!\n\n` +
          `💰 Твой баланс: ${user.balance} ₽\n` +
          `🚀 Открыть Mini App: https://hazdeen.github.io/VPN/`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ 
                  text: '🌐 Открыть VPN', 
                  web_app: { 
                    url: 'https://hazdeen.github.io/VPN/' 
                  } 
                }]
              ]
            }
          }
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(`❌ Ошибка /start: ${err.message}`);
        await ctx.reply('⚠️ Произошла ошибка. Попробуй позже.');
      }
    });

    // ==========================================
    // КОМАНДА /admin - ССЫЛКА НА АДМИН-ПАНЕЛЬ
    // ==========================================
    this.bot.command('admin', async (ctx) => {
      try {
        const telegramId = ctx.from.id;
        
        const user = await this.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramId) },
        });

        if (!user) {
          await ctx.reply('❌ Ты ещё не зарегистрирован. Напиши /start');
          return;
        }

        if (!user.isAdmin) {
          await ctx.reply('⛔ У тебя нет прав администратора');
          return;
        }

        const adminUrl = 'https://hazdeen.github.io/VPN/#/admin';
        
        await ctx.reply(
          `🔑 Админ-панель\n\n` +
          `Перейди по ссылке для управления пользователями:`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ 
                  text: '⚙️ Открыть админ-панель', 
                  url: adminUrl 
                }]
              ]
            }
          }
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(`❌ Ошибка /admin: ${err.message}`);
      }
    });

    // ==========================================
    // КОМАНДА /balance - ПРОВЕРКА БАЛАНСА (ОПЦИОНАЛЬНО)
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

        const activeDevices = await this.prisma.device.count({
          where: {
            userId: user.id,
            isActive: true,
          },
        });

        const dailyRate = activeDevices * 10;
        const daysLeft = dailyRate > 0 ? Math.floor(Number(user.balance) / dailyRate) : 30;

        await ctx.reply(
          `💰 Твой баланс: ${user.balance} ₽\n` +
          `📱 Активных устройств: ${activeDevices}\n` +
          `⏳ Хватит на ~${daysLeft > 30 ? 30 : daysLeft} дней`
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(`❌ Ошибка /balance: ${err.message}`);
      }
    });

    // ==========================================
    // КОМАНДА /help - СПРАВКА
    // ==========================================
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        `📚 Доступные команды:\n\n` +
        `/start - Начать работу\n` +
        `/balance - Проверить баланс\n` +
        `/admin - Админ-панель (только для админов)\n` +
        `/help - Показать это сообщение`
      );
    });

    // Обработчик текстовых сообщений
    this.bot.on('text', async (ctx) => {
      if (ctx.message.text.startsWith('/')) return;
      await ctx.reply('Используй /help для списка команд');
    });
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Останавливаем бота...');
    try {
      await this.bot.stop();
      this.logger.log('✅ Бот остановлен');
    } catch (error) {
      this.logger.error(`❌ Ошибка при остановке бота: ${error.message}`);
    }
  }
}