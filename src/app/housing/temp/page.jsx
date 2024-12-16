"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import NumberTicker from "@/components/ui/number-ticker";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
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
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner'; // Importing toast for error handling

const links = [
  { title: "Menu", icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing" },
  { title: "Kipas Pendingin", icon: <IconPropeller className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/fan" },
  { title: "Lampu", icon: <IconBulb className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/lamp" },
  { title: "Pakan Otomatis", icon: <IconFilter className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/hopper" },
  { title: "Kipas Exhaust", icon: <IconWind className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/air" },
  { title: "Lampu Pemanas", icon: <IconTemperatureSun className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/temp" },
  { title: "Mode Otomatis", icon: <IconSettingsSpark className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/light" },
  { title: "Changelog", icon: <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/changelog" },
  { title: "Profil", icon: <IconUserScan className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/housing/profile" },
];

const Temp = () => {
  const [currentTemperature, setCurrentTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [devices, setDevices] = useState([]);

  // Fetch the most recent sensor data from Supabase
  const fetchSensorData = async () => {
    try {
      const { data, error } = await supabase
        .from('temp')
        .select('current_temperature, humidity, timestamp')
        .order('timestamp', { ascending: false })
        .limit(1); // Get the most recent entry

      if (error) {
        toast.error('Error fetching sensor data');
        return;
      }

      if (data && data.length > 0) {
        const latestData = data[0];
        setCurrentTemperature(latestData.current_temperature);
        setHumidity(latestData.humidity);
        setLastUpdated(new Date(latestData.timestamp).toLocaleString());
      }
    } catch (error) {
      toast.error('Error fetching sensor data');
    }
  };

  // Fetch lamps and control data
  useEffect(() => {
    const fetchLamps = async () => {
      const { data, error } = await supabase
        .from('control')
        .select('relay4');
      
      if (error) {
        toast.error('Error fetching control data');
      } else {
        const formattedDevices = data.map(control => {
          const lastInactiveDate = new Date(control.timestamp);
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
            id: control.id,
            name: `Lampu Penghangat 1`,
            active: control.relay4,
            icon: <IconBulb className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
          };
        });
        setDevices(formattedDevices);
      }
    };

    fetchLamps();
  }, []);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(() => {
      fetchSensorData();
    }, 10000); // Refresh data every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to toggle device state
  const toggleDevice = (index) => {
    const updatedDevices = [...devices];
    updatedDevices[index].active = !updatedDevices[index].active;
    setDevices(updatedDevices);

    // Optionally update the device state in the database or API
    const device = updatedDevices[index];
    const { id, active } = device;
    supabase
      .from('control')
      .update({ relay4: active }) // Assuming relay4 is the control field
      .match({ id })
      .then(() => {
        toast.success(`Device ${device.name} is now ${active ? 'active' : 'inactive'}`);
      })
      .catch(() => toast.error('Error updating device state'));
  };

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen")}>
      <main className="flex-1 p-4 md:p-10 bg-white dark:bg-neutral-900 flex flex-col">
        <h1 className="text-4xl text-center font-bold text-black dark:text-white tracking-tight relative pb-6 z-20">
          Lampu Penghangat{" "}
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

        {/* Cards for Temperature and Humidity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Temperature Card */}
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">Suhu Saat Ini</h2>
            <p className="text-2xl font-semibold">
              <NumberTicker value={currentTemperature} />
              °C
            </p>
            <p className="text-gray-500 mt-2">Terakhir diperbarui: {lastUpdated}</p>
          </div>

          {/* Humidity Card */}
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">Kelembapan Saat Ini</h2>
            <p className="text-2xl font-semibold">
              <NumberTicker value={humidity} />
              %
            </p>
            <p className="text-gray-500 mt-2">Terakhir diperbarui: {lastUpdated}</p>
          </div>
        </div>

        {/* Devices */}
        <div className="flex justify-center items-center space-x-4">
          {devices.map((device, index) => (
            <div
              key={device.id}
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
              </div>
              <div className="flex flex-col items-center text-center">
                <p>{device.name}</p>
                <p className="text-gray-500">
                  {device.active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
          <FloatingDock
            mobileClassName="translate-y-20" 
            items={links}
          />
        </div>
      </main>
    </div>
  );
};

export default Temp;
