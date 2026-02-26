// src/xui/xui.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class XuiService {
  private readonly logger = new Logger(XuiService.name);

  async addClient(inboundId: number, email: string, totalGb: number, expiryDays: number, ipLimit = 1) {
    // 🧪 ЗАГЛУШКА для отладки
    this.logger.log(`✅ Тестовый вызов API с данными:`, { email, totalGb, expiryDays });

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1500));

    const testSubLink = `https://test-vpn-server.com/sub/?id=${email}_test_${Date.now()}`;

    return {
      success: true,
      data: {
        email: email,
        subscriptionUrl: testSubLink,
        expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        traffic: totalGb
      }
    };
  }
}