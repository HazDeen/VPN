import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🚨 ВРЕМЕННО - РАЗРЕШАЕМ ВСЁ!
  app.enableCors({
    origin: '*',  // 👈 ПРОПУСКАЕМ ВСЕ ДОМЕНЫ
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`✅ Server running on port ${port}`);
  console.log(`🔥 CORS полностью открыт! (origin: *)`);
}
bootstrap();