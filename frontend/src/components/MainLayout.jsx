import React from 'react';
import Footer from './Footer';

const MainLayout = ({ navbar: Navbar, children }) => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default MainLayout;
