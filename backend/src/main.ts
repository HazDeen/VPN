import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ РАЗРЕШАЕМ ВСЕ TELEGRAM ДОМЕНЫ
  app.enableCors({
    origin: [
      'https://vpn-frontend.netlify.app',
      'https://vpn-frontend.pages.dev',
      'https://vpn-frontend.vercel.app',
      'https://web.telegram.org',       
      'https://telegram.org',
      'https://t.me',
      'https://oauth.telegram.org',
      'http://localhost:5173',
      'http://localhost:3000',
      'https://*.telegram.org',         
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`✅ Server running on port ${port}`);
  console.log(`📍 http://localhost:${port}`);
  console.log(`🌍 Railway URL: ${process.env.RAILWAY_STATIC_URL || 'https://vpn-production-702c.up.railway.app'}`);
}
bootstrap();