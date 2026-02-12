import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { botLogger, formatIncoming, formatOutgoing } from './bot.logger';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private readonly logger: LoggerService;
  private readonly ADMIN_ID = 1314191617; // ✅ ТВОЙ ID ИЗ ЛОГОВ!

  constructor(private prisma: PrismaService) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('❌ BOT_TOKEN не настроен в .env');
    }
    this.bot = new Telegraf(botToken);
    this.logger = botLogger;
  }

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
        const startTime = Date.now();
        const incoming = formatIncoming(ctx);
        
        try {
          this.logger.log(`📥 Входящая команда: ${JSON.stringify(incoming)}`);

          const telegramId = ctx.from.id;
          const firstName = ctx.from.first_name || '';
          const lastName = ctx.from.last_name || '';
          const username = ctx.from.username || '';

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
            
            this.logger.log(`✅ Новый пользователь создан: ${JSON.stringify(formatOutgoing({ 
              id: user.id, 
              telegramId: user.telegramId.toString(),
              balance: user.balance 
            }))}`);

            // УВЕДОМЛЕНИЕ АДМИНУ
            await this.logger.notifyAdmin(
              this.bot,
              this.ADMIN_ID,
              '🎉 Новый пользователь!',
              {
                id: user.id,
                telegramId: user.telegramId.toString(),
                firstName,
                lastName,
                username,
                balance: user.balance
              }
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
            
            this.logger.log(`👤 Пользователь авторизован: ${JSON.stringify(formatOutgoing({ 
              id: user.id, 
              balance: user.balance 
            }))}`);
            
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

          const responseTime = Date.now() - startTime;
          this.logger.log(`✅ Команда /start выполнена за ${responseTime}ms`);

        } catch (error) {
          this.logger.error(`❌ Ошибка /start: ${error.message}`);
          this.logger.error(`❌ Stack: ${error.stack}`);
          
          await this.logger.notifyAdmin(
            this.bot,
            this.ADMIN_ID,
            '❌ Ошибка в /start',
            {
              error: error.message,
              stack: error.stack,
              incoming: incoming
            }
          );
          
          await ctx.reply('⚠️ Произошла ошибка. Попробуй позже.');
        }
      });

      // ==========================================
      // 👑 АДМИНСКАЯ КОМАНДА /logs
      // ==========================================
      this.bot.command('logs', async (ctx) => {
        if (ctx.from.id !== this.ADMIN_ID) {
          await ctx.reply('⛔ У тебя нет прав администратора');
          return;
        }

        try {
          const fs = require('fs');
          const path = require('path');
          const logsPath = path.join(process.cwd(), 'logs', 'console.log');
          
          if (fs.existsSync(logsPath)) {
            const logs = fs.readFileSync(logsPath, 'utf8');
            const lastLines = logs.split('\n').slice(-20).join('\n');
            
            // Разбиваем на части, если сообщение слишком длинное
            const chunks = lastLines.match(/(.|[\r\n]){1,4000}/g) || [];
            
            await ctx.reply(`📋 **Последние логи:**\n\`\`\`\n${chunks[0]}\n\`\`\``, 
              { parse_mode: 'Markdown' });
            
            for (let i = 1; i < chunks.length; i++) {
              await ctx.reply(`\`\`\`\n${chunks[i]}\n\`\`\``, { parse_mode: 'Markdown' });
            }
          } else {
            await ctx.reply('❌ Логи не найдены');
          }
        } catch (error) {
          this.logger.error(`❌ Ошибка /logs: ${error.message}`);
          await ctx.reply('⚠️ Ошибка при получении логов');
        }
      });

      // ==========================================
      // ... ОСТАЛЬНЫЕ КОМАНДЫ
      // ==========================================
      
      // Запускаем бота
      await this.bot.launch({
        dropPendingUpdates: true,
      });
      
      this.logger.log('✅ Бот успешно запущен!');
      
      await this.logger.notifyAdmin(
        this.bot,
        this.ADMIN_ID,
        '🚀 Бот успешно запущен!',
        { timestamp: new Date().toISOString() }
      );

    } catch (error) {
      this.logger.error(`❌ Критическая ошибка запуска бота: ${error.message}`);
      this.logger.error(`❌ Stack: ${error.stack}`);
    }
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Останавливаем бота...');
    await this.bot.stop();
    
    await this.logger.notifyAdmin(
      this.bot,
      this.ADMIN_ID,
      '🛑 Бот остановлен',
      { timestamp: new Date().toISOString() }
    );
    
    this.logger.log('✅ Бот остановлен');
  }
}