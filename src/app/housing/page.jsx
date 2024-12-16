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
  const [current_temperature, setCurrentTemperature] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Inisialisasi Supabase client dengan URL dan anon key yang diambil dari environment variables
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    fetchSensorData();
    const interval = setInterval(() => {
      fetchSensorData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const [systemStatus, setSystemStatus] = useState('loading'); // Status awal
  const [lastOnline, setLastOnline] = useState("");  // Deklarasi state untuk lastOnline


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data terbaru dari Supabase
        const { data, error } = await supabase
          .from('temp')  // Nama tabel yang sesuai
          .select('system_status, timestamp')  // Ambil status dan timestamp dari tabel
          .order('timestamp', { ascending: false })  // Urutkan berdasarkan timestamp terbaru
          .limit(1);  // Ambil hanya 1 baris data terbaru
      
        if (error) {
          throw error;
        }
      
        if (data && data.length > 0) {
          const latestData = data[0];
          setSystemStatus(latestData.system_status); // Menyimpan status sistem
          
          // Memastikan timestamp valid sebelum mengonversinya
          if (latestData.timestamp) {
            const lastOnlineDate = new Date(latestData.timestamp);
            setLastOnline(lastOnlineDate.toLocaleString()); // Format timestamp menjadi format waktu lokal
          } else {
            setLastOnline("Waktu tidak tersedia"); // Jika tidak ada timestamp
          }
        } else {
          setSystemStatus('inactive'); // Jika tidak ada data
          setLastOnline("Waktu tidak tersedia"); // Jika tidak ada data timestamp
        }
      } catch (error) {
        console.error('Error fetching system status:', error);
        setSystemStatus('inactive'); // Set ke 'inactive' jika ada error
        setLastOnline("Waktu tidak tersedia"); // Set waktu tidak tersedia saat error
      }
    };
    
    fetchData();
  }, []);  // Menjalankan sekali saat komponen dimount

  // const toggleDevice = (index) => {
  //   setDevices((prevDevices) => {
  //     return prevDevices.map((device, i) => {
  //       if (i === index) {
  //         return { ...device, active: !device.active }; 
  //       }
  //       return device;
  //     });
  //   });
  //   toast('Sensor berubah');
  // };

  const toggleDevice = async (index) => {
    const updatedDevices = [...devices];
    const device = updatedDevices[index];
    device.active = !device.active; // Toggle status perangkat
    
    // Update status perangkat di Supabase
    await updateDeviceStatus(device.relay, device.active);
  
    // Update state untuk menampilkan perubahan
    setDevices(updatedDevices);
    toast(`${device.name} telah ${device.active ? 'aktif' : 'nonaktif'}`);
  };
  
  const [devices, setDevices] = useState([
    { name: "Kipas Pendingin", relay: "relay1", icon: <IconPropeller className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />, active: false },
    { name: "Lampu Penerangan", relay: "relay2", icon: <IconBulb className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />, active: false },
    { name: "Pakan", relay: "servo_status", icon: <IconFilter className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />, active: false },
    { name: "Lampu Pemanas", relay: "relay4", icon: <IconTemperatureSun className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />, active: false },
    { name: "Kipas Exhaust", relay: "relay3", icon: <IconWind className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />, active: false },
    { name: "Mode Otomatis", relay: "mode", icon: <IconSettingsSpark className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />, active: false },
  ]);

  const updateDeviceStatus = async (relay, active) => {
    try {
      const { data, error } = await supabase
        .from('control')
        .update({ [relay]: active, timestamp: new Date() })
        .eq('id', 1); // Sesuaikan dengan ID yang sesuai untuk perangkat
  
      if (error) {
        console.error('Error updating device status:', error.message);
      } else {
        console.log('Device status updated:', data);
      }
    } catch (error) {
      console.error('Error updating device status:', error.message);
    }
  };

  const fetchDeviceStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('control')  // Tabel tempat status perangkat disimpan
        .select('relay1, relay2, relay3, relay4, servo_status, mode')  // Kolom-kolom status perangkat
        .eq('id', 1);  // Misalkan ID perangkat adalah 1
  
      if (error) {
        console.error('Error fetching device statuses:', error.message);
        return;
      }
  
      if (data && data.length > 0) {
        const latestData = data[0];
        setDevices([
          { name: "Kipas Pendingin", relay: "relay1", active: latestData.relay1, icon: <IconPropeller />, },
          { name: "Lampu Penerangan", relay: "relay2", active: latestData.relay2, icon: <IconBulb />,  },
          { name: "Pakan", relay: "servo_status", active: latestData.servo_status, icon: <IconFilter />, },
          { name: "Lampu Pemanas", relay: "relay4", active: latestData.relay4, icon: <IconTemperatureSunSun />, },
          { name: "Kipas Exhaust", relay: "relay3", active: latestData.relay3, icon: <IconWind />, },
          { name: "Mode Otomatis", relay: "mode", active: latestData.mode, icon: <IconSettingsSpark />, },
        ]);
      }
    } catch (error) {
      console.error('Error fetching device statuses:', error.message);
    }
  };
  
  useEffect(() => {
    fetchDeviceStatuses();
  }, []);
  
  

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
            text="Kandang Ayam Berbasis"
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
  <p
    className={`text-lg font-medium text-center ${
      systemStatus === 'active' ? 'text-green-600' : 'text-red-600'
    }`}
  >
    {systemStatus === 'active'
      ? 'Sistem berjalan dengan baik.'
      : `Perangkat tidak aktif. Terakhir online: ${lastUpdated}`}
  </p>

  {/* Penjelasan tambahan */}
  <div className="mt-4 text-sm text-gray-400 dark:text-neutral-300 text-center">
    {systemStatus === 'active' ? (
      <p>Sistem berfungsi normal, perangkat terhubung dengan baik.</p>
    ) : (
      <p>Perangkat belum mengirimkan data terbaru. Periksa koneksi atau status perangkat.</p>
    )}
  </div>
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
      {/* Switch untuk menyalakan/mematikan perangkat */}
      <div className="w-full flex justify-between mb-4 items-center">
        <Switch
          id={`device-switch-${index}`}
          checked={device.active}  // Pastikan checked mengacu pada nilai boolean
          onCheckedChange={() => toggleDevice(index)}  // Fungsi toggle
        />
      </div>

      {/* Menampilkan ikon perangkat */}
      <div className="flex flex-col items-center mb-4">
        {device.icon}
        {/* Animasi Lottie jika perangkat aktif */}
        {device.active && (
          <div className="w-16 h-16 max-h-[200px] overflow-hidden mt-2">
            <LottieComponent animationPath={getAnimationData(device.name)} />
          </div>
        )}
      </div>

      {/* Informasi perangkat */}
      <div className="flex flex-col items-center text-center">
        {/* Menampilkan nama perangkat hanya jika perangkat tidak aktif */}
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
