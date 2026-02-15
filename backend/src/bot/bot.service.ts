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
      this.logger.log(`✅ Бот авторизован: @${botInfo.username}`);

      // Сбрасываем вебхуки
      await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
      this.logger.log('🔄 Webhook сброшен');

      // ==========================================
      // КОМАНДА /start - СОЗДАЁТ ПОЛЬЗОВАТЕЛЯ!
      // ==========================================
      this.bot.command('start', async (ctx) => {
        try {
          const telegramId = ctx.from.id;
          const firstName = ctx.from.first_name || '';
          const lastName = ctx.from.last_name || '';
          const username = ctx.from.username || '';

          this.logger.log(`📥 /start от @${username} (${telegramId})`);

          // СОЗДАЁМ ИЛИ ОБНОВЛЯЕМ ПОЛЬЗОВАТЕЛЯ В БД
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
              balance: 0, // Стартовый баланс 0
            },
          });

          this.logger.log(`✅ Пользователь ${user.id} создан/обновлён, баланс: ${user.balance}`);

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
      // ЗАПУСК БОТА
      // ==========================================
      await this.bot.launch({
        dropPendingUpdates: true,
      });
      
      this.logger.log('✅ Бот успешно запущен!');
      
    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Критическая ошибка: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Останавливаем бота...');
    await this.bot.stop();
    this.logger.log('✅ Бот остановлен');
  }
}