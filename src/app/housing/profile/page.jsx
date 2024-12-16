"use client"; 

import { FloatingDock } from "@/components/ui/floating-dock";
import { cn } from "@/lib/utils";
import {
    IconBulb,
    IconExchange,
    IconFilter,
    IconHome,
    IconLogout,
    IconPropeller,
    IconSettingsSpark,
    IconTemperatureSun,
    IconUserScan,
    IconWind
} from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

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

const Profile = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Tambahkan state untuk pengguna saat ini

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error(error);
      } else {
        setUsers(data);
      }
    };

    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
      } else {
        setCurrentUser(user); // Simpan pengguna yang saat ini masuk
      }
    };

    fetchUsers();
    fetchCurrentUser(); // Ambil pengguna saat ini
  }, []);

  const handleLogout = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
  
    if (user) {
      // Logika logout tetap sama
      const logEntry = {
        user_id: user.id, // Pastikan ini adalah string jika id bukan integer
        action: 'logout',
        timestamp: new Date().toISOString(),
      };
  
      const { error: logError } = await supabase
        .from('login_logs')
        .insert([logEntry])
        .select();
  
      if (logError) {
        console.error('Error logging logout:', logError);
        toast.error('Logout logging failed: ' + logError.message);
      } else {
        console.log('Logout logged successfully');
        toast.info('Logout logged successfully');
      }
  
      const { error } = await supabase.auth.signOut();
  
      if (error) {
        console.error('Sign out error:', error.message);
        toast.error('Logout failed');
      } else {
        console.log('User logged out');
        toast.success('Logout successful');
        router.push('/');
      }
    } else {
      toast.error('No user found');
    }
  };
  
  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen")}>
      <main className="flex-1 p-6 md:p-10 bg-white dark:bg-neutral-900 flex flex-col">
        <h1 className="text-4xl relative pb-14 z-20 md:text-md lg:text-md font-bold text-center text-black dark:text-white font-sans tracking-tight">
          Profil{" "}
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse py-4">
              <span>Automasi</span>
            </div>
          </div>
        </h1>

        {/* Tambahkan teks selamat datang */}
        {currentUser && (
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Selamat datang, {currentUser.user_metadata?.username || currentUser.email}
          </h2>
        )}

        {/* Daftar Pengguna */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Daftar Pengguna</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
              <thead>
                <tr className="bg-gray-200 dark:bg-neutral-800">
                  <th className="py-2 px-4 border-b border-neutral-200 dark:border-neutral-700 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Username</th>
                  <th className="py-2 px-4 border-b border-neutral-200 dark:border-neutral-700 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-neutral-700">
                    <td className="py-2 px-4 border-b border-neutral-200 dark:border-neutral-700 text-sm text-gray-800 dark:text-gray-200">{user.username}</td>
                    <td className="py-2 px-4 border-b border-neutral-200 dark:border-neutral-700 text-sm text-gray-800 dark:text-gray-200">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mb-6 flex justify-center">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <IconLogout className="mr-2" /> Logout
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Toaster position="top-right"/>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
          <FloatingDock
            mobileClassName="translate-y-20" // only for demo, remove for production
            items={link}
          />
        </div>
      </main>
    </div>
  );
};

export default Profile;
