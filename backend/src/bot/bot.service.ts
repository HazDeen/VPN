import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private readonly logger = new Logger(BotService.name);
  private isShuttingDown = false;

  constructor(private prisma: PrismaService) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('❌ BOT_TOKEN не настроен в .env');
    }
    this.bot = new Telegraf(botToken);
  }

  async onModuleInit() {
    // Запускаем бота без ожидания
    this.startBot();
  }

  private async startBot() {
    try {
      this.logger.log('🚀 Бот запускается...');

      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`✅ Бот авторизован: @${botInfo.username}`);

      await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
      this.logger.log('🔄 Webhook сброшен');

      this.registerCommands();

      await this.bot.launch({
        dropPendingUpdates: true,
      });
      
      this.logger.log('✅ Бот успешно запущен и слушает команды!');
      
    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Ошибка запуска бота: ${err.message}`);
    }
  }

  private registerCommands() {
    this.bot.command('start', async (ctx) => {
      try {
        const telegramId = ctx.from.id;
        const firstName = ctx.from.first_name || '';
        const lastName = ctx.from.last_name || '';
        const username = ctx.from.username || '';

        this.logger.log(`📥 /start от @${username} (${telegramId})`);

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
          },
        });

        this.logger.log(`✅ Пользователь ${user.id} создан/обновлён, баланс: ${user.balance}`);

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

    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        `📚 Доступные команды:\n\n` +
        `/start - Начать работу\n` +
        `/balance - Проверить баланс\n` +
        `/help - Показать это сообщение`
      );
    });

    this.bot.on('text', async (ctx) => {
      if (ctx.message.text.startsWith('/')) return;
      await ctx.reply('Используй /help для списка команд');
    });
  }

  async onModuleDestroy() {
    this.isShuttingDown = true;
    this.logger.log('🛑 Останавливаем бота...');
    
    try {
      await this.bot.stop();
      this.logger.log('✅ Бот остановлен');
    } catch (error) {
      this.logger.error(`❌ Ошибка при остановке бота: ${error.message}`);
    }
  }
}