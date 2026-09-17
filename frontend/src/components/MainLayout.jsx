import React from 'react';
import Footer from './Footer';

const MainLayout = ({ navbar: Navbar, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />
      <main className="flex-1">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default MainLayout;
