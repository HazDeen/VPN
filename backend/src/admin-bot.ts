import { Telegraf } from 'telegraf';
import { PrismaClient } from '@prisma/client';

const bot = new Telegraf(process.env.BOT_TOKEN);
const prisma = new PrismaClient();

// Только для админа (укажи свой Telegram ID)
const ADMIN_ID = 123456789; // 👈 ТВОЙ ID

bot.command('balance', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  
  const args = ctx.message.text.split(' ');
  const telegramId = parseInt(args[1]);
  const amount = parseFloat(args[2]);
  
  await prisma.user.update({
    where: { telegramId },
    data: { balance: { increment: amount } }
  });
  
  ctx.reply(`✅ Баланс обновлён на +${amount}`);
});

bot.launch();