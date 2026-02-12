import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private readonly logger = new Logger(BotService.name);
  
  // 👑 ID АДМИНА - ЗАМЕНИ НА СВОЙ TELEGRAM ID!
  private readonly ADMIN_ID = 1314191617; // ⚠️ ВСТАВЬ СВОЙ ID!

  constructor(private prisma: PrismaService) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('❌ BOT_TOKEN не настроен в .env');
    }
    this.bot = new Telegraf(botToken);
  }

  // ==========================================
  // 📢 ОТПРАВКА УВЕДОМЛЕНИЙ АДМИНУ
  // ==========================================
  private async notifyAdmin(message: string, data?: any) {
    try {
      const text = data 
        ? `🔔 ${message}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
        : `🔔 ${message}`;
      
      await this.bot.telegram.sendMessage(this.ADMIN_ID, text, {
        parse_mode: 'Markdown'
      });
    } catch (error) {
      this.logger.error(`❌ Не удалось отправить уведомление админу: ${error.message}`);
    }
  }

  // ==========================================
  // 🚀 ЗАПУСК БОТА
  // ==========================================
  async onModuleInit() {
    try {
      this.logger.log('🚀 Бот запускается...');

      // Проверяем токен
      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`✅ Бот авторизован: @${botInfo.username} (ID: ${botInfo.id})`);

      // Сбрасываем вебхуки
      await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
      this.logger.log('🔄 Webhook сброшен');

      // ==========================================
      // 👤 КОМАНДА /start - РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
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
                balance: 0,
              },
            });
            
            // 📢 УВЕДОМЛЕНИЕ АДМИНУ О НОВОМ ПОЛЬЗОВАТЕЛЕ!
            await this.notifyAdmin(
              `🎉 Новый пользователь!\nID: ${telegramId}\nИмя: ${firstName} ${lastName}\nUsername: @${username}`,
              { id: user.id, telegramId: user.telegramId.toString(), balance: user.balance }
            );
            
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
      // 👑 АДМИНСКИЕ КОМАНДЫ
      // ==========================================
      
      // 📊 Статистика
      this.bot.command('admin_stats', async (ctx) => {
        if (ctx.from.id !== this.ADMIN_ID) {
          await ctx.reply('⛔ У тебя нет прав администратора');
          return;
        }

        try {
          const totalUsers = await this.prisma.user.count();
          const totalDevices = await this.prisma.device.count();
          const activeDevices = await this.prisma.device.count({ where: { isActive: true } });
          const totalBalance = await this.prisma.user.aggregate({ _sum: { balance: true } });
          const todayTransactions = await this.prisma.transaction.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          });

          const stats = `📊 **СТАТИСТИКА БОТА**\n\n` +
            `👥 Пользователей: ${totalUsers}\n` +
            `📱 Устройств всего: ${totalDevices}\n` +
            `✅ Активных устройств: ${activeDevices}\n` +
            `💰 Общий баланс: ${totalBalance._sum.balance || 0} ₽\n` +
            `📈 Транзакций сегодня: ${todayTransactions}`;

          await ctx.reply(stats, { parse_mode: 'Markdown' });
          
          // 📢 УВЕДОМЛЕНИЕ О ЗАПРОСЕ СТАТИСТИКИ
          await this.notifyAdmin(`📊 Админ запросил статистику`);
          
        } catch (error) {
          const err = error as Error;
          this.logger.error(`❌ Ошибка /admin_stats: ${err.message}`);
          await ctx.reply('⚠️ Ошибка при получении статистики');
        }
      });

      // 💰 Начислить баланс пользователю
      this.bot.command('admin_add', async (ctx) => {
        if (ctx.from.id !== this.ADMIN_ID) {
          await ctx.reply('⛔ У тебя нет прав администратора');
          return;
        }

        try {
          const args = ctx.message.text.split(' ');
          if (args.length < 3) {
            await ctx.reply('❌ Формат: /admin_add <telegram_id> <сумма>');
            return;
          }

          const telegramId = parseInt(args[1]);
          const amount = parseInt(args[2]);

          if (isNaN(telegramId) || isNaN(amount)) {
            await ctx.reply('❌ ID и сумма должны быть числами');
            return;
          }

          const user = await this.prisma.user.findUnique({
            where: { telegramId: BigInt(telegramId) },
          });

          if (!user) {
            await ctx.reply('❌ Пользователь не найден');
            return;
          }

          await this.prisma.user.update({
            where: { telegramId: BigInt(telegramId) },
            data: { balance: { increment: amount } },
          });

          await ctx.reply(`✅ Баланс пользователя ${telegramId} увеличен на ${amount} ₽`);
          
          // Уведомление пользователю
          await this.bot.telegram.sendMessage(
            telegramId,
            `💰 Вам начислено ${amount} ₽!\nПроверь баланс командой /balance`
          );

          // 📢 УВЕДОМЛЕНИЕ АДМИНУ
          await this.notifyAdmin(
            `💰 Админ начислил ${amount} ₽ пользователю ${telegramId}`,
            { telegramId, amount, adminId: ctx.from.id }
          );

        } catch (error) {
          const err = error as Error;
          this.logger.error(`❌ Ошибка /admin_add: ${err.message}`);
          await ctx.reply('⚠️ Ошибка при начислении баланса');
        }
      });

      // 👥 Список пользователей
      this.bot.command('admin_users', async (ctx) => {
        if (ctx.from.id !== this.ADMIN_ID) {
          await ctx.reply('⛔ У тебя нет прав администратора');
          return;
        }

        try {
          const users = await this.prisma.user.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
          });

          let message = '👥 **Последние 10 пользователей:**\n\n';
          users.forEach((user, index) => {
            message += `${index + 1}. ID: ${user.telegramId}\n`;
            message += `   Имя: ${user.firstName} ${user.lastName}\n`;
            message += `   Username: @${user.username || 'нет'}\n`;
            message += `   Баланс: ${user.balance} ₽\n`;
            message += `   Дата: ${user.createdAt.toLocaleDateString()}\n\n`;
          });

          await ctx.reply(message, { parse_mode: 'Markdown' });
          
          // 📢 УВЕДОМЛЕНИЕ АДМИНУ
          await this.notifyAdmin(`👥 Админ запросил список пользователей`);

        } catch (error) {
          const err = error as Error;
          this.logger.error(`❌ Ошибка /admin_users: ${err.message}`);
          await ctx.reply('⚠️ Ошибка при получении списка пользователей');
        }
      });

      // ==========================================
      // 📱 ОТСЛЕЖИВАНИЕ СОБЫТИЙ В MINI APP
      // ==========================================
      
      // // Эндпоинт для логов из Mini App
      // this.bot.telegram.setWebhook(`${process.env.BACKEND_URL}/bot-webhook`);
      
      // ==========================================
      // 👤 ОБЫЧНЫЕ КОМАНДЫ
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

      this.bot.command('help', async (ctx) => {
        const isAdmin = ctx.from.id === this.ADMIN_ID;
        
        let helpText = 
          `📚 **Доступные команды:**\n\n` +
          `/start - Начать работу\n` +
          `/balance - Проверить баланс\n` +
          `/app - Открыть Mini App\n` +
          `/help - Показать это сообщение\n`;
        
        if (isAdmin) {
          helpText += 
            `\n👑 **Админ-команды:**\n` +
            `/admin_stats - Статистика бота\n` +
            `/admin_users - Список пользователей\n` +
            `/admin_add <id> <сумма> - Начислить баланс\n`;
        }

        await ctx.reply(helpText, { parse_mode: 'Markdown' });
      });

      // ==========================================
      // ЗАПУСК БОТА
      // ==========================================
      await this.bot.launch({
        dropPendingUpdates: true,
      });
      
      this.logger.log('✅ Бот успешно запущен!');
      await this.notifyAdmin('🚀 Бот успешно запущен!');

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
    await this.notifyAdmin('🛑 Бот остановлен');
    this.logger.log('✅ Бот остановлен');
  }
}