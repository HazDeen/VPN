import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 👇 ВКЛЮЧАЕМ CORS - ЭТО РЕШИТ ПРОБЛЕМУ!
  app.enableCors({
    origin: 'http://localhost:5173', // Твой фронтенд
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 Backend running on: http://localhost:${process.env.PORT || 3001}`);
}
bootstrap();