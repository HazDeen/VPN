import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ РАЗРЕШАЕМ ВСЕ ТВОИ ФРОНТЕНД URL
  app.enableCors({
    origin: [
      'https://vpn-front.netlify.app',      // 👈 ТВОЙ ТЕКУЩИЙ URL!
      'https://vpn-frontend.netlify.app',   // 👈 СТАРЫЙ URL
      'https://vpn-frontend.pages.dev',
      'https://vpn-frontend.vercel.app',
      'https://web.telegram.org',
      'https://telegram.org',
      'https://t.me',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`✅ Server running on port ${port}`);
  console.log(`📍 CORS enabled for: https://vpn-front.netlify.app`);
}
bootstrap();