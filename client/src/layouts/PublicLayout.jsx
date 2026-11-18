import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MobileBottomNav } from '../components/MobileBottomNav';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] selection:bg-[#8F1238] selection:text-white">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};
