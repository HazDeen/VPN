import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

BigInt.prototype.toJSON = function() {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
  origin: [
    'https://hazdeen.github.io',
    'https://vpn-frontend-5kn.pages.dev',  // Cloudflare
    'https://vpn-frontend.netlify.app',
    'https://web.telegram.org',
    'https://telegram.org',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*'],
});

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`✅ Server running on port ${port}`);
  console.log(`🔥 CORS полностью открыт для всех доменов!`);

  const signals = ['SIGTERM', 'SIGINT'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\n🛑 Получен сигнал ${signal}, закрываем приложение...`);
      await app.close();
      process.exit(0);
    });
  }
}
bootstrap();