// src/xui/xui-api.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

@Injectable()
export class XuiApiService implements OnModuleInit {
  private readonly logger = new Logger(XuiApiService.name);
  private api: AxiosInstance;
  private isLoggedIn = false;
  
  private readonly panelUrl = process.env.XUI_PANEL_URL || 'http://localhost:54321';
  private readonly username = process.env.XUI_USERNAME || 'api_user';
  private readonly password = process.env.XUI_PASSWORD || 'password';

  async onModuleInit() {
    await this.login();
  }

  private async login() {
    try {
      this.logger.log(`🔐 Логинимся в панель 3x-ui: ${this.panelUrl}`);

      this.api = axios.create({
        baseURL: this.panelUrl,
        withCredentials: true,
        httpsAgent: new https.Agent({  
          rejectUnauthorized: false
        })
      });

      const response = await this.api.post('/login', {
        username: this.username,
        password: this.password
      });

      if (response.headers['set-cookie']) {
        this.api.defaults.headers.Cookie = response.headers['set-cookie'].join('; ');
        this.isLoggedIn = true;
        this.logger.log('✅ Успешный вход в 3x-ui панель');
      } else {
        throw new Error('Не удалось получить куки авторизации');
      }

    } catch (error) {
      this.logger.error('❌ Ошибка входа в 3x-ui:', error.message);
      throw error;
    }
  }

  // 👇 Генерация UUID v4
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async createClient(createClientDto: CreateClientDto) {
    try {
      if (!this.isLoggedIn) {
        await this.login();
      }

      const { 
        inboundId = 1, 
        tgUid,
        email,
        flow = 'xtls-rprx-vision',
        totalGb,
        expiryTime
      } = createClientDto;

      const fullEmail = `${tgUid}-${email}`;
      const uuid = this.generateUUID();

      const clientConfig = {
        id: inboundId,
        settings: JSON.stringify({
          clients: [{
            email: fullEmail,
            flow: flow,
            id: uuid,
            ...(totalGb ? { totalGB: totalGb * 1024 * 1024 * 1024 } : {}),
            ...(expiryTime ? { expiryTime: this.parseExpiryTime(expiryTime) } : {})
          }]
        })
      };

      this.logger.log(`📝 Отправка в 3x-ui:`, JSON.stringify(clientConfig, null, 2));

      try {
        const response = await this.api.post('/xui/API/inbounds/addClient', clientConfig);
        
        this.logger.log(`📥 Статус ответа: ${response.status}`);
        this.logger.log(`📥 Ответ от 3x-ui:`, response.data);

        if (response.data?.success) {
          return {
            success: true,
            email: fullEmail,
            uuid,
            flow
          };
        } else {
          const errorMsg = response.data?.msg || response.data?.message || 'Неизвестная ошибка 3x-ui';
          this.logger.error(`❌ 3x-ui вернул ошибку: ${errorMsg}`);
          throw new Error(errorMsg);
        }
      } catch (apiError) {
        this.logger.error(`❌ API ошибка:`, apiError.response?.data || apiError.message);
        throw apiError;
      }
    } catch (error) {
      this.logger.error(`❌ Ошибка создания клиента:`, error.response?.data || error.message);
      throw error;
    }
  }

  private parseExpiryTime(expiryTime: number | Date | string): number {
    if (!expiryTime) return 0;
    if (typeof expiryTime === 'number') return expiryTime;
    if (expiryTime instanceof Date) return expiryTime.getTime();
    return new Date(expiryTime).getTime();
  }

  async getSubscriptionLink(email: string): Promise<string> {
    try {
      const response = await this.api.post('/xui/API/inbounds/list');
      
      for (const inbound of response.data.obj) {
        if (inbound.clientStats) {
          for (const client of inbound.clientStats) {
            if (client.email === email && client.subId) {
              const subPort = process.env.SUB_PORT || 443;
              const subPath = process.env.SUB_PATH || '/sub/';
              return `${this.panelUrl.replace(/:\d+/, '')}:${subPort}${subPath}${client.subId}`;
            }
          }
        }
      }
      
      return `${this.panelUrl}/sub/${email}`;
    } catch (error) {
      this.logger.error('Ошибка получения ссылки на подписку:', error);
      return '';
    }
  }

  async deleteClient(email: string) {
    try {
      const response = await this.api.post('/xui/API/inbounds/delClient', {
        email: email
      });
      return response.data;
    } catch (error) {
      this.logger.error('Ошибка удаления клиента:', error);
      throw error;
    }
  }
}

export interface CreateClientDto {
  inboundId?: number;
  tgUid: string | number;        // 👈 Telegram UID из БД
  email: string;                  // 👈 Произвольный email (client1user, 5jk4ldy0, и т.д.)
  flow?: string;
  totalGb?: number;
  expiryTime?: number | Date | string;
}