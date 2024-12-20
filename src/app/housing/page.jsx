"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import GradualSpacing from "@/components/ui/gradual-spacing";
import NumberTicker from "@/components/ui/number-ticker";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createClient } from '@supabase/supabase-js';
import {
  IconBulb,
  IconExchange,
  IconFilter,
  IconHome,
  IconPoint,
  IconPropeller,
  IconSettingsSpark,
  IconTemperatureSun,
  IconUserScan,
  IconWind
} from "@tabler/icons-react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

const LottieComponent = dynamic(() => import('./LottieComponent'), { ssr: false });


const getAnimationData = (deviceName) => {
  switch (deviceName) {
    case 'Kipas Pendingin':
      return '/lottie/fan.json';
    case 'Pakan':
      return '/lottie/hopper.json';
    case 'Lampu Penerangan':
      return '/lottie/lamp.json';
    case 'Lampu Pemanas':
      return '/lottie/heater.json';
    case 'Pakan':
      return '/lottie/feed.json';
    case 'Lampu Penerangan':
      return '/lottie/light.json';
    default:
      return null;
  }
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

const Housing = () => {
  const router = useRouter();
  const [current_temperature, setCurrentTemperature] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [systemStatus, setSystemStatus] = useState('loading');
  const [lastOnline, setLastOnline] = useState("");
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Initialize devices state from Supabase
  const initializeDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('control')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data) {
        const initialDevices = [
          {
            name: "Kipas Pendingin",
            relay: "relay1",
            icon: <IconPropeller className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
            active: data.relay1
          },
          {
            name: "Lampu Penerangan",
            relay: "relay3",
            icon: <IconBulb className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
            active: data.relay3
          },
          {
            name: "Pakan",
            relay: "servo_status",
            icon: <IconFilter className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
            active: data.servo_status
          },
          {
            name: "Lampu Pemanas",
            relay: "relay4",
            icon: <IconTemperatureSun className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
            active: data.relay4
          },
          {
            name: "Kipas Exhaust",
            relay: "relay2",
            icon: <IconWind className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
            active: data.relay2
          },
          {
            name: "Mode Otomatis",
            relay: "mode",
            icon: <IconSettingsSpark className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
            active: data.mode
          }
        ];
        setDevices(initialDevices);
      }
    } catch (error) {
      console.error('Error initializing devices:', error);
      toast.error('Failed to load device states');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSensorData = async () => {
    try {
      // Ambil data terbaru dari Supabase berdasarkan timestamp
      const { data, error } = await supabase
        .from('temp')  // Ganti dengan nama tabel yang sesuai
        .select('current_temperature, timestamp')  // Ambil kolom yang relevan
        .order('timestamp', { ascending: false })  // Urutkan berdasarkan timestamp terbaru
        .limit(1);  // Ambil hanya 1 baris data terbaru
  
      if (error) {
        console.error('Error fetching sensor data:', error.message);
        return;
      }
  
      if (data && data.length > 0) {
        const latestData = data[0];
        // Pastikan current_temperature tidak null atau undefined
        setCurrentTemperature(latestData.current_temperature !== null && latestData.current_temperature !== undefined 
          ? latestData.current_temperature 
          : null);
  
        // Menyimpan waktu pembaruan (timestamp) dalam format waktu lokal
        setLastUpdated(new Date(latestData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        console.warn('No sensor data found.');
        setCurrentTemperature(null); // Jika tidak ada data, set ke null
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error.message);
    }
  };
  
  
  useEffect(() => {
    fetchSensorData(); // Pastikan data terambil setiap kali komponen dimuat ulang
    const interval = setInterval(() => {
        fetchSensorData();
    }, 10000);
  
    return () => clearInterval(interval); // Hapus interval saat komponen dibongkar
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    initializeDevices();

    // Subscribe to changes
    const channel = supabase
      .channel('control_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'control',
          filter: 'id=eq.1'
        },
        (payload) => {
          setDevices(currentDevices => 
            currentDevices.map(device => ({
              ...device,
              active: payload.new[device.relay]
            }))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleDevice = async (index) => {
    const device = devices[index];
    const newStatus = !device.active;

    try {
      // Optimistic update
      setDevices(currentDevices =>
        currentDevices.map((d, i) =>
          i === index ? { ...d, active: newStatus } : d
        )
      );

      const { error } = await supabase
        .from('control')
        .update({ [device.relay]: newStatus })
        .eq('id', 1);

      if (error) throw error;
      
      toast.success(`${device.name} ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      // Revert on error
      setDevices(currentDevices =>
        currentDevices.map((d, i) =>
          i === index ? { ...d, active: !newStatus } : d
        )
      );
      toast.error(`Failed to update ${device.name}`);
      console.error('Error toggling device:', error);
    }
  };

  const hoppertoggleDevice = async (index) => {
    const device = devices[index];
    
    try {
      // Activate servo
      await supabase
        .from('control')
        .update({ servo_status: true })
        .eq('id', 1);

      setDevices(currentDevices =>
        currentDevices.map((d, i) =>
          i === index ? { ...d, active: true } : d
        )
      );

      toast.success('Servo telah terbuka dalam 2 detik, pastikan pakan keluar secukupnya!');

      // Auto-close after 2 seconds
      setTimeout(async () => {
        await supabase
          .from('control')
          .update({ servo_status: false })
          .eq('id', 1);

        setDevices(currentDevices =>
          currentDevices.map((d, i) =>
            i === index ? { ...d, active: false } : d
          )
        );
      }, 5000); // Durasi 5 detik
    } catch (error) {
      console.error('Error operating hopper:', error);
      toast.error('Failed to operate servo');
    }
  };
  

  const [temperature, setTemperature] = useState(0);

  useEffect(() => {
    const logUserAction = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        const { error: logError } = await supabase
          .from('login_logs')
          .insert([
            {
              user_id: user.id,
              action: 'access_housing',
              timestamp: new Date().toISOString(),
            },
          ]);

        if (logError) {
          console.error('Error logging user access:', logError);
        }
      } else {
        router.push('/');
      }
    };

    logUserAction();
  }, [router]);

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen")}>
      <main className="flex-1 p-4 md:p-10 bg-white dark:bg-neutral-900 flex flex-col">
        <h1 className="flex items-center justify-center text-4xl relative pb-6 z-20 md:text-md lg:text-md font-bold text-black dark:text-white">
          <GradualSpacing
            className="font-display text-md font-bold -tracking-widest text-black dark:text-white md:text-4xl md:leading-[5rem]"
            text="Kandang Kucing Berbasis"
          />
          <div className="relative inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))] ml-4">
            <div className="absolute left-0 top-[1px] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
          </div>
        </h1>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Konsumsi energi per ruangan */}
          <div className="col-span-2 bg-white p-5 rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-lg">
                <h3 className="font-semibold text-xl mb-2">Sensor</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <IconPoint className="mr-2" />
                    Kualitas Udara
                  </li>
                  <li className="flex items-center">
                    <IconPoint className="mr-2" />
                    Sensor Suhu
                  </li>
                  <li className="flex items-center">
                    <IconPoint className="mr-2" />
                    Sensor Kelembaban
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-lg">
                <h3 className="font-semibold text-xl mb-2">Perangkat</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <IconPoint className="mr-2" />
                    Kipas pendingin
                  </li>
                  <li className="flex items-center">
                    <IconPoint className="mr-2" />
                    Kipas Exhaust
                  </li>
                  <li className="flex items-center">
                    <IconPoint className="mr-2" />
                    Lampu Penerangan
                  </li>
                  <li className="flex items-center">
                    <IconPoint className="mr-2" />
                    Lampu Pemanas
                  </li>
                  <li className="flex items-center">
                    <IconPoint className="mr-2" />
                    Pakan
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-white p-8 rounded-lg border border-neutral-200 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl dark:bg-neutral-800 dark:border-neutral-700 dark:hover:shadow-xl flex flex-col items-center justify-center shadow-lg">
  {/* Header */}
  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
    Status Sistem IoT
  </h2>

{/* Status teks utama */}
<p className="text-lg font-medium text-center text-gray-700">
  {`Terakhir online: ${lastUpdated}`}
</p>


</div>


          <div className="col-span-1 bg-white p-6 rounded-lg border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none flex flex-col items-center justify-center">
  <h2 className="text-lg font-bold mb-4">Suhu Saat Ini</h2>
  
  {/* Menampilkan suhu dengan dua angka desimal */}
  <p className="text-3xl font-semibold">
              {current_temperature !== null ? <NumberTicker value={current_temperature.toFixed(2)} /> : "?"}
              °C
            </p>

  {/* Memberikan indikasi status suhu: Normal, Tinggi, atau Rendah */}
  <p
    className={cn(
      "text-gray-500 mt-2",
      current_temperature > 30 ? "text-red-500" : current_temperature < 15 ? "text-blue-500" : "text-gray-500"
    )}
  >
    {current_temperature > 30
      ? "Suhu Tinggi"
      : current_temperature < 15
      ? "Suhu Rendah"
      : "Suhu Normal"}
  </p>

  {/* Menampilkan waktu pembaruan */}
  <p className="text-gray-500 mt-2">Terakhir diperbarui: {lastUpdated}</p>
</div>

        </div>
        <hr className="w-full my-4 border-none h-[1px] bg-transparent opacity-25 bg-gradient-to-r from-transparent via-[#34476780] to-transparent" />

        {/* Kontrol perangkat */}
        <Toaster position="top-right" />

        <div className="col-span-4 flex flex-1 h-full grid grid-cols-6 gap-4 overflow-hidden pb-6 pl-2 pr-2">
        {devices.map((device, index) => (
  <div
    key={device.name}
    className={cn(
      "p-4 rounded-lg flex flex-col items-center border border-neutral-200 transition duration-200 shadow-input hover:shadow-xl dark:shadow-none",
      device.active ? "bg-gradient-to-br from-gray-100 to-gray-50" : "bg-gray-50"
    )}
  >
    <div className="w-full flex justify-between mb-4 items-center">
      <Switch
        id={`device-switch-${index}`}
        checked={device.active}  // Pastikan checked mengacu pada nilai boolean
        onCheckedChange={() => {
          if (device.name === "Pakan") {
            hoppertoggleDevice(index); // Panggil hoppertoggleDevice untuk Pakan
          } else {
            toggleDevice(index);  // Panggil toggleDevice untuk perangkat lainnya
          }
        }}  // Fungsi toggle
      />
    </div>

    <div className="flex flex-col items-center mb-4">
      {device.icon}
      {device.active && (
        <div className="w-16 h-16 max-h-[200px] overflow-hidden mt-2">
          <LottieComponent animationPath={getAnimationData(device.name)} />
        </div>
      )}
    </div>

    <div className="flex flex-col items-center text-center">
      {!device.active && (
        <p className="text-md text-gray-600 dark:text-white mb-2">
          {device.name}
        </p>
      )}
    </div>
  </div>
))}

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

export default Housing;
