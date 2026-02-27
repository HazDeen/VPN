// src/xui/xui-api.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import * as cookie from 'cookie';

@Injectable()
export class XuiApiService implements OnModuleInit {
  private readonly logger = new Logger(XuiApiService.name);
  private api: AxiosInstance;
  private cookieJar: string[] = [];
  private isLoggedIn = false;
  
  // Конфигурация - вынести в .env
  private readonly panelUrl = process.env.XUI_PANEL_URL || 'http://localhost:54321';
  private readonly username = process.env.XUI_USERNAME || 'api_user';
  private readonly password = process.env.XUI_PASSWORD || 'password';
  private readonly totpSecret = process.env.XUI_TOTP_SECRET; // если нужен 2FA

  async onModuleInit() {
    await this.login();
  }

  private async login() {
    try {
      this.logger.log(`🔐 Логинимся в панель 3x-ui: ${this.panelUrl}`);

      // Создаем HTTP клиент с поддержкой куки
      this.api = axios.create({
        baseURL: this.panelUrl,
        withCredentials: true,
        httpsAgent: new https.Agent({  
          rejectUnauthorized: false // для самоподписанных сертификатов
        })
      });

      // Данные для входа
      const loginData: any = {
        username: this.username,
        password: this.password
      };

      // Отправляем запрос на вход
      const response = await this.api.post('/login', loginData);

      // Сохраняем куки сессии
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        this.cookieJar = setCookie;
        this.api.defaults.headers.Cookie = setCookie.join('; ');
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

  /**
   * Создать нового клиента
   */
  async createClient(createClientDto: CreateClientDto) {
    try {
      if (!this.isLoggedIn) {
        await this.login();
      }

      const { 
        inboundId = 1, 
        email, 
        uuid, 
        telegramId = 0,
        flow = 'xtls-rprx-vision',
        totalGb = 0,
        expiryTime = 0,
        enable = true,
        comment = ''
      } = createClientDto;

      // Формируем данные клиента
      const clientConfig = {
        id: inboundId,
        settings: JSON.stringify({
          clients: [{
            id: uuid,
            email: email,
            limitIp: 1,
            totalGB: totalGb * 1024 * 1024 * 1024, // GB в байты
            expiryTime: expiryTime && (typeof expiryTime === 'number' ? expiryTime : new Date(expiryTime).getTime()) > 0 
  ? (typeof expiryTime === 'number' ? expiryTime : new Date(expiryTime).getTime()) 
  : 0,
            enable: enable,
            tgId: telegramId,
            subId: `${email}_${Date.now()}`,
            flow: flow,
            comment: comment
          }]
        })
      };

      this.logger.log(`📝 Создание клиента: ${email}`);

      // Отправляем запрос на добавление клиента
      const response = await this.api.post('/xui/API/inbounds/addClient', clientConfig);

      if (response.data.success) {
        this.logger.log(`✅ Клиент ${email} успешно создан`);
        
        // Получаем ссылку на подписку
        const subLink = await this.getSubscriptionLink(email);
        
        return {
          success: true,
          email,
          uuid,
          subscriptionUrl: subLink,
          expiryTime
        };
      } else {
        throw new Error(response.data.msg || 'Ошибка создания клиента');
      }

    } catch (error) {
      this.logger.error(`❌ Ошибка создания клиента:`, error.message);
      throw error;
    }
  }

  /**
   * Получить ссылку на подписку
   */
  async getSubscriptionLink(email: string): Promise<string> {
    try {
      // Получаем список всех inbound
      const response = await this.api.post('/xui/API/inbounds/list');
      
      // Ищем клиента по email
      for (const inbound of response.data.obj) {
        if (inbound.clientStats) {
          for (const client of inbound.clientStats) {
            if (client.email === email && client.subId) {
              // Формируем ссылку подписки
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

  /**
   * Удалить клиента
   */
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

  /**
   * Обновить клиента
   */
  async updateClient(email: string, updateData: Partial<CreateClientDto>) {
    try {
      const response = await this.api.post('/xui/API/inbounds/updateClient', {
        email,
        ...updateData
      });
      return response.data;
    } catch (error) {
      this.logger.error('Ошибка обновления клиента:', error);
      throw error;
    }
  }

  /**
   * Получить список inbound
   */
  async getInbounds() {
    try {
      const response = await this.api.post('/xui/API/inbounds/list');
      return response.data.obj;
    } catch (error) {
      this.logger.error('Ошибка получения списка inbound:', error);
      throw error;
    }
  }
}

// DTO для создания клиента
export interface CreateClientDto {
  inboundId?: number;
  email: string;
  uuid: string;
  telegramId?: number;
  flow?: string;
  totalGb?: number;
  expiryTime?: number | Date;
  enable?: boolean;
  comment?: string;
}