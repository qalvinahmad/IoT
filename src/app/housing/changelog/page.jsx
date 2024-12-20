"use client"; 

import { FloatingDock } from "@/components/ui/floating-dock";
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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Definisikan mapping device dengan nama yang lebih deskriptif
const deviceMapping = {
  relay1: "Kipas Pendingin",
  relay2: "Exhaust",
  relay3: "Lampu",
  relay4: "Pemanas",
  servo: "Pakan",
};

const link = [
  {
    title: "Menu",
    icon: (
      <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing",
  },
  {
    title: "Kipas Pendingin",
    icon: (
      <IconPropeller className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/fan",
  },
  {
    title: "Lampu",
    icon: (
      <IconBulb className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/lamp",
  },
  {
    title: "Pakan Otomatis",
    icon: (
      <IconFilter className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/hopper",
  },
  {
    title: "Kipas Exhaust",
    icon: (
      <IconWind className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/air",
  },
  {
    title: "Lampu Pemanas",
    icon: (
      <IconTemperatureSun className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/temp",
  },
  {
    title: "Mode Otomatis",
    icon: (
      <IconSettingsSpark className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/light",
  },
  {
    title: "Changelog",
    icon: (
      <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/changelog",
  },
  {
    title: "Profil",
    icon: (
      <IconUserScan className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/housing/profile",
  },
];


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Changelog = () => {
  const [activityLog, setActivityLog] = useState([]);

  // Fetch activity logs from Supabase
  useEffect(() => {
    const fetchActivityLogs = async () => {
      // Fetch activity logs (ensure RLS is configured on login_logs table)
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching activity logs:', error.message);
        toast.error('Failed to fetch activity logs');
      } else {
        // Format log entries before setting the state
        const formattedLogs = data.map((log) => ({
          device: deviceMapping[log.device] || log.device, // If the device code is not in the mapping, use the original
          status: log.status ? "Activated" : "Deactivated",
          timestamp: new Date(log.timestamp).toLocaleString()
        }));
        setActivityLog(formattedLogs);
      }
    };

    fetchActivityLogs();
  }, []);

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen")}>
      <main className="flex-1 p-6 md:p-10 bg-white dark:bg-neutral-900 flex flex-col overflow-y-auto">
        <h1 className="text-4xl relative pb-14 z-20 md:text-md lg:text-md font-bold text-center text-black dark:text-white font-sans tracking-tight">
          Change Log{" "}
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
          </div>
        </h1>

        {/* Activity Log Section */}
        <div className="mt-6 p-4 justify-center items-center bg-white rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none">
          <h3 className="text-xl font-semibold mb-2">Log Aktivitas</h3>
          
          {/* Tabel Aktivitas */}
          <table className="min-w-full table-auto text-sm text-left text-neutral-800 dark:text-neutral-300">
            <thead className="bg-gray-100 dark:bg-neutral-700">
              <tr>
                <th className="px-4 py-2 font-semibold">Device</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.length > 0 ? (
                activityLog.map((log, index) => (
                  <tr key={index} className="border-b dark:border-neutral-600">
                    <td className="px-4 py-2">{log.device}</td>
                    <td className="px-4 py-2">{log.status}</td>
                    <td className="px-4 py-2">{log.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-center text-neutral-500">Tidak ada aktivitas.</td>
                </tr>
              )}
            </tbody>
          </table>
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

export default Changelog;
