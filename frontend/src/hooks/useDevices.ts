import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Device, DeviceType } from '../types/device';
import { toast } from 'sonner';

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      console.log('📱 Fetching devices...');
      
      const data = await api.devices.getAll();
      console.log('✅ Devices response:', data);
      
      const typedDevices = data.map((d: any) => ({
        id: d.id,
        name: d.name || '',
        model: d.model || '',
        type: d.type as DeviceType,
        date: d.date || '',
        isActive: d.isActive || false,
        configLink: d.configLink || '',
        daysLeft: d.daysLeft || 0
      }));
      
      setDevices(typedDevices);
    } catch (error) {
      console.error('❌ Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async (name: string, customName: string, type: DeviceType) => {
    try {
      console.log('➕ Adding device:', { name, customName, type });
      
      const response = await api.devices.add({ 
        name, 
        customName: customName || name, 
        type 
      });
      
      console.log('✅ Device added response:', response);
      await fetchDevices();
      return response;
    } catch (error: any) {
      console.error('❌ Failed to add device:', error);
      toast.error(error.message || 'Не удалось добавить устройство');
      throw error;
    }
  };

  const deleteDevice = async (deviceId: number) => {
    try {
      console.log('🗑️ Deleting device:', deviceId);
      await api.devices.delete(deviceId);
      await fetchDevices();
      toast.success('Устройство удалено');
    } catch (error) {
      console.error('❌ Failed to delete device:', error);
      throw error;
    }
  };

  const replaceDevice = async (deviceId: number) => {
    try {
      console.log('🔄 Replacing device:', deviceId);
      toast.info('Функция замены временно недоступна');
      // TODO: добавить API вызов
      // await api.devices.replace(deviceId);
      await fetchDevices();
    } catch (error) {
      console.error('❌ Failed to replace device:', error);
      throw error;
    }
  };

  const updateDeviceName = async (deviceId: number, customName: string) => {
    try {
      console.log('✏️ Updating device name:', { deviceId, customName });
      
      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, name: customName } : d
      ));
      
      toast.success('Название обновлено');
      // TODO: добавить API вызов
      // await api.devices.updateName(deviceId, customName);
      await fetchDevices();
    } catch (error) {
      console.error('❌ Failed to update device name:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    loading,
    fetchDevices,
    addDevice,
    deleteDevice,
    replaceDevice,
    updateDeviceName,
  };
};