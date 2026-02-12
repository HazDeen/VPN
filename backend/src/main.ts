import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'https://vpn-frontend.pages.dev', // Cloudflare
      'https://vpn-front.netlify.app/', // Netlify
      'https://vpn-frontend.vercel.app', // Vercel
      'https://t.me',
      'https://telegram.org',
    ],
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅ Server running on port ${port}`);
  console.log(`📍 http://localhost:${port}`);
  console.log(`🌍 Railway URL: https://vpn-production-702c.up.railway.app`);
}
bootstrap();