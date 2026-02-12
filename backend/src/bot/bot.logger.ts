import { createLogger } from '../logger/logger.service';

// Создаем логгер для бота
export const botLogger = createLogger('🤖 BOT');

// Функция для форматирования входящих данных
export function formatIncoming(ctx: any): any {
  return {
    from: {
      id: ctx.from?.id,
      username: ctx.from?.username,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name,
    },
    chat: {
      id: ctx.chat?.id,
      type: ctx.chat?.type,
    },
    command: ctx.message?.text,
    timestamp: new Date().toISOString(),
  };
}

// Функция для форматирования исходящих данных
export function formatOutgoing(data: any): any {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    ...data,
  };
}