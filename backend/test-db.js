const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Проверка подключения
    await prisma.$connect();
    console.log('✅ Подключение к БД успешно!');
    
    // Создать тестового пользователя
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(1314191617) },
      update: { balance: 1500 },
      create: {
        telegramId: BigInt(1314191617),
        firstName: 'hazdeen',
        username: 'hazdeen',
        balance: 1500,
      },
    });
    console.log('✅ Пользователь создан/обновлен:', user.id);
    
    // Проверить баланс
    console.log('💰 Баланс:', user.balance);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();