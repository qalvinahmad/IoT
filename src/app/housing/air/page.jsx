"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
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
import { Toaster } from 'sonner';

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

const determineTrendType = (currentStatus, previousStatus) => {
  if (currentStatus === previousStatus) {
    return 'stable';
  } else if ((currentStatus === 'Good' && previousStatus === 'Bad') || 
             (currentStatus === 'Moderate' && previousStatus === 'Bad')) {
    return 'improving';
  } else {
    return 'deteriorating';
  }
};

const Air = () => {
  const [deviceData, setDeviceData] = useState(null);
  const [trendType, setTrendType] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [lastBadQuality, setLastBadQuality] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [previousStatus, setPreviousStatus] = useState('');

  useEffect(() => {
    const fetchDeviceData = async () => {
      const { data, error } = await supabase
        .from('air')
        .select('id, quality_status, last_bad_quality, last_updated, is_active')
        .eq('id', 1)
        .single();

      if (error) {
        console.error("Error fetching device data:", error);
      } else {
        setDeviceData(data);
        setCurrentStatus(data.quality_status);
        setLastBadQuality(data.last_bad_quality);
        setLastUpdated(data.last_updated);
        setPreviousStatus(data.quality_status); // Initialize with current for trend calculation
      }
    };

    fetchDeviceData();
  }, []);

  useEffect(() => {
    if (currentStatus && previousStatus) {
      const trend = determineTrendType(currentStatus, previousStatus);
      setTrendType(trend);
      
      const updateAirQuality = async () => {
        const { data, error } = await supabase
          .from('air')
          .update({
            quality_status: currentStatus,
            last_updated: new Date(),
            trend_type: trend
          })
          .eq('id', 1);

        if (error) {
          console.error("Error updating air quality:", error);
        } else {
          console.log("Air quality updated:", data);
          setPreviousStatus(currentStatus); // Update previous status after successful update
        }
      };

      updateAirQuality();
    }
  }, [currentStatus, previousStatus]);

  const formatDate = (date) => {
    if (!date) return '';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    const formattedDate = new Intl.DateTimeFormat('id-ID', options).format(new Date(date));
    const [day, month, year] = formattedDate.split(', ')[0].split('/');
    const [time] = formattedDate.split(', ')[1].split(':');
    return `${time.replace(':', '.').slice(0, 5)}, ${day}-${month}-${year}`;
  };

  let trendDescription;
  switch (trendType) {
    case 'improving':
      trendDescription = "Air quality has been improving over the last week.";
      break;
    case 'stable':
      trendDescription = "Air quality has remained stable over the last week.";
      break;
    case 'deteriorating':
      trendDescription = "Air quality has been deteriorating over the last week.";
      break;
    default:
      trendDescription = "Trend data is unavailable.";
  }

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen")}>
      <main className="flex-1 p-4 md:p-10 bg-white dark:bg-neutral-900 flex flex-col">
        <h1 className="text-4xl text-center font-bold text-black dark:text-white tracking-tight relative pb-6 z-20">
          Temperatur{" "}
          <div className="relative inline-block mx-auto w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
          </div>
        </h1>

        <Toaster position="top-right"/>

        {/* Air Quality Card */}
        <div className="col-span-1 bg-white p-6 rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center justify-center mb-4">
          <h2 className="text-lg font-bold mb-4">Air Quality</h2>
          <p className="text-2xl font-semibold mb-2">{currentStatus}</p>
          <p className="text-gray-500 mb-2">Status</p>
          <p className="text-black text-lg">{deviceData?.is_active ? "Active" : "Inactive"}</p>
        </div>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center">
            <h3 className="text-lg font-bold mb-2">Last Updated</h3>
            <p className="text-xl">{formatDate(lastUpdated)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center">
            <h3 className="text-lg font-bold mb-2">Last Bad Air Quality</h3>
            <p className="text-xl">{formatDate(lastBadQuality)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center">
            <h3 className="text-lg font-bold mb-2">Trend</h3>
            <p className="text-xl">{trendDescription}</p>
          </div>
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

export default Air;
