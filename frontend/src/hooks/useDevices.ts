import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Device, DeviceType } from '../types/device';

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await api.devices.getAll();
      
      const typedDevices = data.map((d: any) => ({
        ...d,
        type: d.type as DeviceType
      }));
      
      setDevices(typedDevices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async (name: string, customName: string, type: DeviceType) => {
    try {
      await api.devices.add({ name, customName, type });
      await fetchDevices();
    } catch (error) {
      console.error('Failed to add device:', error);
      throw error;
    }
  };


    const replaceDevice = async (deviceId: number) => {
    try {
        await api.devices.replace(deviceId);
        await fetchDevices(); // Обновляем список
    } catch (error) {
        console.error('Failed to replace device:', error);
        throw error;
    }
    };

    const deleteDevice = async (deviceId: number) => {
    try {
        await api.devices.delete(deviceId);
        await fetchDevices(); // Обновляем список
    } catch (error) {
        console.error('Failed to delete device:', error);
        throw error;
    }
    };

    const updateDeviceName = async (deviceId: number, customName: string) => {
    try {
        await api.devices.updateName(deviceId, customName);
        await fetchDevices(); // Обновляем список
    } catch (error) {
        console.error('Failed to update device name:', error);
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
    replaceDevice,  
    deleteDevice,   
    updateDeviceName
  };
};