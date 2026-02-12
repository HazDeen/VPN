import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Создаем тестового пользователя
  const user = await prisma.user.upsert({
    where: { telegramId: 123456789 },
    update: {},
    create: {
      telegramId: 123456789,
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      balance: 1000, // 1000 ₽ на балансе
    },
  });

  console.log(`✅ Created user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

  // Создаем тестовое устройство
  const device = await prisma.device.create({
    data: {
      userId: user.id,
      name: 'iPhone 13',
      customName: 'Моя мобилка',
      type: 'iPhone',
      configLink: 'https://hvpn.io/test123456',
      isActive: true,
    },
  });

  console.log(`✅ Created device: ${device.customName} (${device.configLink})`);

  // Создаем подписку для устройства
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  await prisma.subscription.create({
    data: {
      deviceId: device.id,
      userId: user.id,
      price: 300,
      nextBillingDate: nextBilling,
      isActive: true,
    },
  });

  console.log(`✅ Created subscription for device`);

  // Создаем тестовые транзакции
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        amount: 1000,
        type: 'topup',
        description: 'Пополнение счёта',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 дней назад
      },
      {
        userId: user.id,
        deviceId: device.id,
        amount: -300,
        type: 'subscription',
        description: `Подписка на устройство ${device.customName}`,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 день назад
      },
    ],
  });

  console.log(`✅ Created transactions`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });