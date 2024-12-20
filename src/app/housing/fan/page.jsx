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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const link = [
  { title: "Menu", icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing" },
  { title: "Kipas Pendingin", icon: <IconPropeller className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/fan" },
  { title: "Lampu", icon: <IconBulb className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/lamp" },
  { title: "Pakan Otomatis", icon: <IconFilter className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/hopper" },
  { title: "Kipas Exhaust", icon: <IconWind className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/air" },
  { title: "Lampu Pemanas", icon: <IconTemperatureSun className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/profile" },
  { title: "Mode Otomatis", icon: <IconSettingsSpark className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/light" },
  { title: "Changelog", icon: <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/changelog" },
  { title: "Profil", icon: <IconUserScan className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/profile" },
];

const Fan = () => {
  const [device, setDevice] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  useEffect(() => {
    // Fetch device control data
    const fetchControlData = async () => {
      const { data, error } = await supabase.from('control').select('*');
      
      if (error) {
        toast.error(`Error fetching control data: ${error.message}`);
      } else {
        if (data && data.length > 0) {
          const control = data[0];  // Assuming only one device
          const lastInactiveDate = new Date(control.timestamp);  // Assuming timestamp is being used to track inactivity
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

          setDevice({
            id: control.id, 
            name: `Relay1 (Control ID: ${control.id})`,
            active: control.relay1,
            inactiveSince: control.timestamp ? inactiveSince : 'N/A',
            relay1: control.relay1,
            icon: <IconPropeller className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          });
        }
      }
    };

    // Fetch temperature and humidity data
    const fetchSensorData = async () => {
      const { data, error } = await supabase.from('temp').select('*').order('timestamp', { ascending: false }).limit(1);
      
      if (error) {
        toast.error(`Error fetching sensor data: ${error.message}`);
      } else {
        const latestData = data[0];
        setTemperature(latestData.current_temperature);
        setHumidity(latestData.humidity);
      }
    };

    fetchControlData();
    fetchSensorData();
  }, []);

  const toggleDevice = async () => {
    if (!device) return;

    const newStatus = !device.active;

    const { error } = await supabase
      .from('control')
      .update({ relay1: newStatus, timestamp: newStatus ? null : new Date() })
      .eq('id', device.id);  

    if (error) {
      toast.error(`Error updating relay status: ${error.message}`);
    } else {
      setDevice((prevDevice) => ({
        ...prevDevice,
        active: newStatus
      }));
      toast.success('Relay status updated');
    }
  };

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen")}>
      <main className="flex-1 p-4 md:p-10 bg-white dark:bg-neutral-900 flex flex-col">
        <h1 className="text-4xl relative pb-6 z-20 md:text-md lg:text-md font-bold text-center text-black dark:text-white font-sans tracking-tight">
          Kipas Pendingin{" "}
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
          </div>
        </h1>

        <Toaster position="top-right" />

        {/* Statik Device */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
  {/* Elemen pertama, col-span-2 */}
  {device && (
    <div className="col-span-2 flex justify-center items-center relative h-24 bg-blue-200 rounded-lg">
      <div
        className={cn(
          "w-full h-full p-4 rounded-lg flex flex-col items-center border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none",
          device.active ? "bg-gradient-to-br from-gray-100 to-gray-50" : "bg-gray-50"
        )}
      >
        <div className="w-full flex justify-between mb-2 items-center">
          <Switch
            id="device-switch-0"
            checked={device.active}
            onCheckedChange={toggleDevice}
          />
        </div>
        <div className="flex flex-col items-center flex-grow mb-4">
          {device.icon}
        </div>
      </div>
    </div>
  )}

  {/* Elemen kedua */}
  <div className="row-start-2 col-start-1 flex justify-center items-center relative h-24 bg-gray-50 rounded-lg">
    <div
      className={cn(
        "w-full h-full p-4 rounded-lg flex flex-col items-center border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none"
      )}
    >
      <span>Suhu: {temperature ? `${temperature}°C` : "Loading..."}</span>
    </div>
    {/* Tombol X */}
  </div>

  {/* Elemen ketiga */}
  <div className="row-start-2 col-start-2 flex justify-center items-center relative h-24 bg-gray- rounded-lg">
    <div
      className={cn(
        "w-full h-full p-4 rounded-lg flex flex-col items-center border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none"
      )}
    >
      <span>Kelembapan: {humidity ? `${humidity}%` : "Loading..."}</span>
    </div>
    {/* Tombol X */}
    
  </div>
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

export default Fan;
