import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(BotService.name);

  constructor(private prisma: PrismaService) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('BOT_TOKEN не настроен в .env');
    }
    this.bot = new Telegraf(botToken);
  }

  async onModuleInit() {
    this.logger.log('🚀 Бот запускается...');

    // ✅ ОБРАБОТКА КОМАНДЫ /start
    this.bot.command('start', async (ctx) => {
      try {
        const telegramId = ctx.from.id;
        const firstName = ctx.from.first_name || '';
        const lastName = ctx.from.last_name || '';
        const username = ctx.from.username || '';

        this.logger.log(`📥 /start от @${username} (${telegramId})`);

        // Ищем или создаём пользователя
        let user = await this.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramId) },
        });

        if (!user) {
          user = await this.prisma.user.create({
            data: {
              telegramId: BigInt(telegramId),
              firstName,
              lastName,
              username,
              balance: 0,
            },
          });
          this.logger.log(`✅ Новый пользователь создан: ${telegramId}`);
          await ctx.reply(
            `🎉 Добро пожаловать, ${firstName}!\n\n💰 Твой баланс: 0 ₽\n🚀 Открой Mini App, чтобы начать пользоваться VPN!`,
          );
        } else {
          this.logger.log(`👤 Пользователь уже есть: ${telegramId}`);
          await ctx.reply(
            `👋 С возвращением, ${firstName}!\n\n💰 Твой баланс: ${user.balance} ₽\n🚀 Открыть Mini App: /app`,
          );
        }
      } catch (error) {
        const err = error as Error;
        this.logger.error(`❌ Ошибка /start: ${err.message}`);
        await ctx.reply('⚠️ Произошла ошибка. Попробуй позже.');
      }
    });

    // ✅ КОМАНДА /balance - проверить баланс
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

        await ctx.reply(`💰 Твой баланс: ${user.balance} ₽`);
      } catch (error) {
        const err = error as Error;
        this.logger.error(`❌ Ошибка /balance: ${err.message}`);
      }
    });

    // ✅ КОМАНДА /app - ссылка на Mini App
    this.bot.command('app', async (ctx) => {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'https://vpn-front.netlify.app';
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

    // Запускаем бота
    this.bot.launch();
    this.logger.log('✅ Бот успешно запущен!');
  }
}