'use client';

import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import ShinyButton from "@/components/ui/shiny-button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Dialog from "./login/dialog";

export default function Home() {
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const logIn = async (email, password) => {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      console.log('User logged in:', user);
      onLoginSuccess();
      setDialogVisible(false);
    }
  };

  const onLoginSuccess = () => {
    router.push('/housing');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const values = Object.fromEntries(formData.entries());
    logIn(values.email, values.password);
  };

  const openDialog = () => setDialogVisible(true);
  const closeDialog = () => {
    setDialogVisible(false);
    setErrorMessage("");
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "absolute inset-0 h-full w-full z-0",
          "skew-y-12"
        )}
      />

      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10 z-10">
        Selamat Datang di web kandang berbasis automasi,
      </span>

      {/* Tombol untuk membuka dialog login */}
      <ShinyButton onClick={openDialog} className="z-10">
        Masuk
      </ShinyButton>

      {/* Dialog untuk login */}
      <Dialog 
  isVisible={isDialogVisible} 
  onClose={closeDialog} 
  setErrorMessage={setErrorMessage} 
  errorMessage={errorMessage}
  onLoginSuccess={onLoginSuccess}
/>

    </div>
  );
}
