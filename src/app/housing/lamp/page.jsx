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

const link = [
  { title: "Menu", icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing" },
  { title: "Kipas Pendingin", icon: <IconPropeller className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/fan" },
  { title: "Lampu", icon: <IconBulb className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/lamp" },
  { title: "Pakan Otomatis", icon: <IconFilter className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/hopper" },
  { title: "Kipas Exhaust", icon: <IconWind className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/air" },
  { title: "Lampu Pemanas", icon: <IconTemperatureSun className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/lamp" },
  { title: "Mode Otomatis", icon: <IconSettingsSpark className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/light" },
  { title: "Changelog", icon: <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/changelog" },
  { title: "Profil", icon: <IconUserScan className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/profile" },
];

const Lamp = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchLamps = async () => {
      const { data, error } = await supabase
        .from('control')  // Mengambil data dari tabel 'control' untuk relay2
        .select('*');
      
      if (error) {
        toast.error('Error fetching control data');
      } else {
        const formattedDevices = data.map(control => {
          const lastInactiveDate = new Date(control.timestamp); // Menggunakan 'timestamp' untuk inactive
          const now = new Date();

          let inactiveSince;
          if (
            lastInactiveDate.getFullYear() === now.getFullYear() &&
            lastInactiveDate.getMonth() === now.getMonth() &&
            lastInactiveDate.getDate() === now.getDate()
          ) {
            inactiveSince = lastInactiveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else {
            inactiveSince = lastInactiveDate.toLocaleDateString();
          }

          return {
            name: `Lampu Penerangan 1`, // Nama relay untuk lampu
            active: control.relay2, // Menggunakan relay2 sebagai status
            icon: <IconBulb className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          };
        });
        setDevices(formattedDevices);
      }
    };

    fetchLamps();
  }, []);

  const toggleDevice = async (index) => {
    const updatedDevice = devices[index];
    const newStatus = !updatedDevice.active;

    const { error } = await supabase
      .from('control')  // Update pada tabel 'control'
      .update({ relay2: newStatus, timestamp: newStatus ? null : new Date() }) // Mengupdate relay2 dan timestamp
      .eq('id', 1);  // Sesuaikan ID jika perlu

    if (error) {
      toast.error('Error updating relay status');
    } else {
      setDevices((prevDevices) => 
        prevDevices.map((device, i) => 
          i === index ? { ...device, active: newStatus } : device
        )
      );
      toast('Lampu penerangan 1 status updated');
    }
  };

  const getAnimationData = (deviceName) => {
    switch (deviceName) {
      case 'lamp':
        return '/lottie/lamp.json';
      default:
        return null;
    }
  };

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen")}>
      <main className="flex-1 p-4 md:p-10 bg-white dark:bg-neutral-900 flex flex-col">
        <h1 className="text-4xl relative pb-6 z-20 md:text-md lg:text-md font-bold text-center text-black dark:text-white font-sans tracking-tight">
          Lampu{" "}
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
          </div>
        </h1>

        <Toaster position="top-right"/>

        <div className="flex justify-center items-center space-x-4">
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

        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
          <FloatingDock
            mobileClassName="translate-y-20"
            items={link}
          />
        </div>
      </main>
    </div>
  );
};

export default Lamp;
