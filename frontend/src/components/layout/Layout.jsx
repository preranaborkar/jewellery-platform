import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F]">
      <Header />
      <main className={`flex-1 transition-all duration-300 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;