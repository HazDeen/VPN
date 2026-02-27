// src/xui/xui-api.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

@Injectable()
export class XuiApiService implements OnModuleInit {
  private readonly logger = new Logger(XuiApiService.name);
  private api: AxiosInstance;
  private isLoggedIn = false;
  
  // Конфигурация из .env
  private readonly panelUrl = process.env.XUI_PANEL_URL || 'http://171.22.16.17:2053';
  private readonly username = process.env.XUI_USERNAME || 'api_user';
  private readonly password = process.env.XUI_PASSWORD || 'your_password';

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

  // 👇 Парсинг expiryTime в timestamp
  private parseExpiryTime(expiryTime: number | Date | string): number {
    if (!expiryTime) return 0;
    if (typeof expiryTime === 'number') return expiryTime;
    if (expiryTime instanceof Date) return expiryTime.getTime();
    return new Date(expiryTime).getTime();
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
        totalGb = 0,
        expiryTime,
        comment = ''
      } = createClientDto;

      const fullEmail = `${tgUid}-${email}`;
      const uuid = this.generateUUID();
      const subId = this.generateSubId(); // генерация как в панели

      // Формируем объект клиента ТОЧНО КАК В ПАНЕЛИ
      const clientObj = {
        id: uuid,
        flow: flow,
        email: fullEmail,
        limitIp: 0,
        totalGB: totalGb,
        expiryTime: expiryTime ? this.parseExpiryTime(expiryTime) : 0,
        enable: true,
        tgId: "",
        subId: subId,
        comment: comment,
        reset: 0
      };

      // Создаем settings объект
      const settingsObj = {
        clients: [clientObj]
      };

      // Кодируем settings в URL-encoded строку
      const settingsJson = JSON.stringify(settingsObj);
      
      // Формируем тело запроса как в панели
      const formBody = new URLSearchParams({
        id: inboundId.toString(),
        settings: settingsJson
      }).toString();

      this.logger.log(`📝 Отправка в 3x-ui (form):`, formBody);

      // Отправляем запрос с правильным Content-Type
      const response = await this.api.post('/panel/inbound/addClient', 
        formBody,  // тело как строка
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }
      );
      
      this.logger.log(`📥 Статус ответа: ${response.status}`);
      this.logger.log(`📥 Данные ответа:`, response.data);

      // Проверяем успех (в этой версии может быть по-другому)
      if (response.status === 200) {
        this.logger.log(`✅ Клиент ${fullEmail} успешно создан`);
        
        const subscriptionUrl = await this.getSubscriptionLink(fullEmail);
        
        return {
          success: true,
          email: fullEmail,
          uuid,
          flow,
          subscriptionUrl
        };
      } else {
        throw new Error('Ошибка создания клиента');
      }

    } catch (error) {
      this.logger.error(`❌ Ошибка создания клиента:`, error.response?.data || error.message);
      throw error;
    }
  }

  // Добавь метод генерации subId
  private generateSubId(length: number = 16): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getSubscriptionLink(email: string): Promise<string> {
    try {
      if (!this.isLoggedIn) {
        await this.login();
      }

      const response = await this.api.post('/xui/API/inbounds/list');
      
      if (!response.data?.success) {
        return '';
      }

      // Ищем клиента по email
      for (const inbound of response.data.obj) {
        if (inbound.clientStats) {
          for (const client of inbound.clientStats) {
            if (client.email === email && client.subId) {
              // Формируем ссылку подписки
              const subPort = process.env.SUB_PORT || 443;
              const subPath = process.env.SUB_PATH || '/sub/';
              const baseUrl = this.panelUrl.replace(/:\d+$/, ''); // убираем порт
              return `${baseUrl}:${subPort}${subPath}${client.subId}`;
            }
          }
        }
      }
      
      return '';
    } catch (error) {
      this.logger.error('❌ Ошибка получения ссылки на подписку:', error);
      return '';
    }
  }

  async getInbounds() {
    try {
      if (!this.isLoggedIn) {
        await this.login();
      }

      this.logger.log('📥 Запрос списка inbound');
      
      const response = await this.api.post('/xui/API/inbounds/list');
      
      this.logger.log(`📥 Статус: ${response.status}`);
      this.logger.log(`📥 Ответ:`, response.data);

      if (response.data?.success) {
        return response.data.obj;
      } else {
        throw new Error(response.data?.msg || 'Ошибка получения списка inbound');
      }
    } catch (error) {
      this.logger.error('❌ Ошибка получения inbound:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteClient(email: string) {
    try {
      if (!this.isLoggedIn) {
        await this.login();
      }

      const response = await this.api.post('/xui/API/inbounds/delClient', {
        email: email
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Ошибка удаления клиента:', error);
      throw error;
    }
  }
}

export interface CreateClientDto {
  inboundId?: number;
  tgUid: string | number;
  email: string;
  flow?: string;
  totalGb?: number;
  expiryTime?: number | Date | string;
  comment?: string;
}