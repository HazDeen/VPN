export type DeviceType = 'iPhone' | 'Android' | 'Mac' | 'PC' | 'Other';

export interface Device {
  id: number;
  name: string;
  model: string;
  type: DeviceType;
  date: string;
  isActive: boolean;
  configLink: string;
  daysLeft: number;
}

export interface CreateDeviceDto {
  name: string;
  customName?: string;
  type: DeviceType;
}