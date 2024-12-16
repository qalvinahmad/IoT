import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

const Dialog = ({ isVisible, onClose, setErrorMessage, errorMessage, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    const email = event.target.email.value;
    const password = event.target.password.value;
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    setLoading(false);
  
    if (error) {
      setErrorMessage(error.message);
      toast.error(`Login gagal: ${error.message}`);
      return; 
    }
  
    toast.success(`Selamat datang kembali, ${data.user.email}!`);

    const { error: logError } = await supabase.from('login_logs').insert([{
      user_id: data.user.id,
      action: 'login',
      timestamp: new Date().toISOString(),
    }]);
  
    if (logError) {
      console.error('Error mencatat aksi login:', logError.message);
    }

    onLoginSuccess();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-black p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          &times;
        </button>
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
          <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
            Selamat datang di <br /> Kandang Automasi berbasis IOT
          </h2>
          <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
            Hanya pengguna terdaftar yang dapat mengakses website. Jika Anda sudah memiliki akun terdaftar, silakan masuk 👌.
          </p>

          {errorMessage && (
            <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
          )}

          <form className="my-8" onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-2 w-full mb-4">
              <Label htmlFor="email">Alamat Email</Label>
              <Input id="email" name="email" placeholder="oneandonly@kandangiot.tech" type="email" required />
            </div>
            <div className="flex flex-col space-y-2 w-full mb-4">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input id="password" name="password" placeholder="••••••••" type="password" required />
            </div>

            <div className="z-10 flex items-center justify-center mt-4">
              <button
                type="submit"
                className={`bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Sedang Masuk...' : 'Masuk'}
              </button>
            </div>
            <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

            <div className="flex flex-col space-y-4">
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Lupa kata sandi? <Link href="/" className="text-gray-600 hover:text-gray-700">Atur Ulang Kata Sandi</Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Dialog;
