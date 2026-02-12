import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 👇 ВКЛЮЧАЕМ CORS - ЭТО РЕШИТ ПРОБЛЕМУ!
  app.enableCors({
  origin: [
    'https://vpnvpn-backend.onrender.com', // 👈 ТВОЙ URL!
    'https://t.me',
    'https://telegram.org'
  ],
  credentials: true,
});
  
  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 Backend running on: http://localhost:${process.env.PORT || 3001}`);
}
bootstrap();