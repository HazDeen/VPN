export class CreateDeviceDto {
  name: string;        // Модель: "iPhone 13"
  customName?: string; // "Моя мобилка"
  type: string;        // iPhone, Android, Mac, PC, Other
}