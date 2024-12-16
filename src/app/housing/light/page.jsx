"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createClient } from '@supabase/supabase-js';
import {
  IconBulb,
  IconExchange,
  IconFilter,
  IconHome,
  IconPropeller,
  IconSettingsSpark,
  IconTemperatureSun,
  IconUserScan,
  IconWind
} from "@tabler/icons-react";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

const LottieComponent = dynamic(() => import('../LottieComponent'), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const links = [
  { title: "Menu", icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing" },
  { title: "Kipas Pendingin", icon: <IconPropeller className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/fan" },
  { title: "Lampu", icon: <IconBulb className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/lamp" },
  { title: "Pakan Otomatis", icon: <IconFilter className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/hopper" },
  { title: "Kipas Exhaust", icon: <IconWind className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/air" },
  { title: "Lampu Pemanas", icon: <IconTemperatureSun className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/temp" },
  {
    title: "Mode Otomatis",
    icon: (
      <IconSettingsSpark className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/light",
  },
  { title: "Changelog", icon: <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/changelog" },
  { title: "Profil", icon: <IconUserScan className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/profile" },
];

const Light = () => {
  const [lightData, setLightData] = useState({
    currentIntensity: 0,
    lowestIntensity: 0,
    lowestIntensityTime: '',
    highestIntensity: 0,
    highestIntensityTime: '',
    lastUpdated: ''
  });

  const [devices, setDevices] = useState([
    { name: "Mode Otomatis", active: false, icon: <IconSettingsSpark className="h-12 w-12" /> },
  ]);

  const getAnimationData = (deviceName) => {
    switch (deviceName) {
      case 'lamp':
        return '/lottie/lamp.json';
      default:
        return null;
    }
  };

  const toggleDevice = async (index) => {
    const updatedDevice = devices[index];
    const newStatus = !updatedDevice.active;

    const { error } = await supabase
      .from('control')  
      .update({ mode: newStatus, timestamp: newStatus ? null : new Date() })
      .eq('id', 1);  

    if (error) {
      toast.error('Error updating relay status');
    } else {
      setDevices((prevDevices) => 
        prevDevices.map((device, i) => 
          i === index ? { ...device, active: newStatus } : device
        )
      );
      toast('Mode Otomatis status updated');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('control')
        .select('*')
        .eq('id', 1)
        .single(); 

      if (error) {
        toast.error('Gagal mengambil data: ' + error.message);
      } else if (data) {
        setLightData({
          currentIntensity: data.current_intensity,
          lowestIntensity: data.lowest_intensity,
          lowestIntensityTime: new Date(data.lowest_intensity_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          highestIntensity: data.highest_intensity,
          highestIntensityTime: new Date(data.highest_intensity_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lastUpdated: new Date(data.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen")}>
      <main className="flex-1 p-4 md:p-10 bg-white dark:bg-neutral-900 flex flex-col">
        <h1 className="text-4xl text-center font-bold text-black dark:text-white tracking-tight relative pb-6 z-20">
          Mode Otomatis{" "}
          <div className="relative inline-block mx-auto w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
          </div>
        </h1>

        <Toaster position="top-right" />

        <div className="flex justify-center items-center space-x-4 col-span-1">
          {devices.map((device, index) => {
            const animationPath = getAnimationData(device.name); 
            return (
              <div
                key={device.name}
                className={cn(
                  "w-64 h-64 p-4 rounded-lg flex flex-col items-center border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none",
                  device.active ? "bg-gradient-to-br from-gray-100 to-gray-50" : "bg-gray-50"
                )}
              >
                <div className="w-full flex justify-between mb-2 items-center">
                  <Switch
                    id={`device-switch-${index}`}
                    checked={device.active}
                    onCheckedChange={() => toggleDevice(index)}
                  />
                </div>
                <div className="flex flex-col items-center flex-grow mb-4">
                  {device.icon}
                  {device.active && animationPath && (
                    <div className="w-16 h-16">
                      <LottieComponent animationPath={animationPath} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <p>{device.name}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <hr className="my-4 border-t-1 border-neutral-300 dark:border-neutral-600" />

        {/* Row untuk Intensitas Terendah dan Tertinggi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Intensitas Terendah */}
          <div className="col-span-1 bg-white p-6 rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center justify-center h-56">
            <h2 className="text-lg font-bold mb-4">Kipas Menyala :</h2>
            <p className="text-gray-500">Suhu mencapai lebih dari 30°C</p>
            <p className="text-gray-500">Kelembapan mencapai lebih dari 80%</p>
          </div>

          {/* Card Intensitas Tertinggi */}
          <div className="col-span-1 bg-white p-6 rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center justify-center h-56">
            <h2 className="text-lg font-bold mb-4">Otomasisasi Lampu</h2>
            <p className="text-gray-500">Lampu akan menyala pada Waktu pukul 17:00</p>
            <p className="text-gray-500">Menonaktifkan lampu pada Waktu pukul 6:00</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
          <FloatingDock
            mobileClassName="translate-y-20" // only for demo, remove for production
            items={links}
          />
        </div>
      </main>
    </div>
  );
};

export default Light;
