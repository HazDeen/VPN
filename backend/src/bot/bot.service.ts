import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private readonly logger = new Logger(BotService.name);
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  constructor(private prisma: PrismaService) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('❌ BOT_TOKEN не настроен в .env');
    }
    this.bot = new Telegraf(botToken);
  }

  async onModuleInit() {
    await this.startBot();
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
      
      this.logger.log('✅ Бот успешно запущен!');
      this.retryCount = 0;

    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Ошибка запуска бота: ${err.message}`);

      if (err.message.includes('409') || err.message.includes('Conflict')) {
        this.retryCount++;
        
        if (this.retryCount <= this.MAX_RETRIES) {
          const delay = this.retryCount * 5000;
          this.logger.log(`🔄 Попытка ${this.retryCount}/${this.MAX_RETRIES} через ${delay/1000} секунд...`);
          
          setTimeout(() => this.startBot(), delay);
        } else {
          this.logger.error('❌ Превышено максимальное количество попыток');
        }
      }
    }
  }

  private registerCommands() {
    // КОМАНДА /start - СОЗДАЁТ ПОЛЬЗОВАТЕЛЯ И ТОКЕН
    this.bot.command('start', async (ctx) => {
      try {
        const telegramId = ctx.from.id;
        const firstName = ctx.from.first_name || '';
        const lastName = ctx.from.last_name || '';
        const username = ctx.from.username || '';

        this.logger.log(`📥 /start от @${username} (${telegramId})`);

        // Генерируем токен
        const authToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);

        // СОЗДАЁМ ИЛИ ОБНОВЛЯЕМ ПОЛЬЗОВАТЕЛЯ
        const user = await this.prisma.user.upsert({
          where: { telegramId: BigInt(telegramId) },
          update: {
            firstName,
            lastName,
            username,
            authToken,
            tokenExpires,
          },
          create: {
            telegramId: BigInt(telegramId),
            firstName,
            lastName,
            username,
            authToken,
            tokenExpires,
            balance: 0,
          },
        });

        this.logger.log(`✅ Пользователь ${user.id} создан/обновлён, токен действителен до ${tokenExpires}`);

        const loginUrl = `https://hazdeen.github.io/VPN/#/login?token=${authToken}`;

        await ctx.reply(
          `🎉 Добро пожаловать, ${firstName}!\n\n` +
          `💰 Твой баланс: ${user.balance} ₽\n` +
          `🔑 Твоя персональная ссылка для входа (действительна 24 часа):\n${loginUrl}\n\n` +
          `🚀 Перейди по ней, чтобы открыть Mini App`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ 
                  text: '🔑 Войти в аккаунт', 
                  url: loginUrl 
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

    // КОМАНДА /balance - ПРОВЕРКА БАЛАНСА
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

    // КОМАНДА /help - СПРАВКА
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        `📚 Доступные команды:\n\n` +
        `/start - Начать работу и получить ссылку\n` +
        `/balance - Проверить баланс\n` +
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