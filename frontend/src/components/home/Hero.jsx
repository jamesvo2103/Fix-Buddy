import React, { useState } from 'react';

const Hero = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openMenuHandler = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMenuHandler = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }
        body, html {
          background-color: #000000;
          margin: 0;
          padding: 0;
        }
      `}</style>

      <section className="flex flex-col items-center text-white text-sm">
        <svg className="absolute -z-10 w-screen -mt-40 md:mt-0" width="1440" height="676" viewBox="0 0 1440 676" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="-92" y="-948" width="1624" height="1624" rx="812" fill="url(#a)"/>
          <defs>
            <radialGradient id="a" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90 428 292)scale(812)">
              <stop offset=".63" stopColor="#372AAC" stopOpacity="0"/>
              <stop offset="1" stopColor="#372AAC"/>
            </radialGradient>
          </defs>
        </svg>

        <nav className="z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur">
          <a href="/">
            {/* Replace with your logo */}
            <span className="text-2xl font-bold">FixBuddy</span>
          </a>

          <div className="hidden md:flex items-center gap-8 transition duration-500">
            <a href="#products" className="hover:text-slate-300 transition">Products</a>
            <a href="#resources" className="hover:text-slate-300 transition">Resources</a>
            <a href="#stories" className="hover:text-slate-300 transition">Stories</a>
            <a href="#pricing" className="hover:text-slate-300 transition">Pricing</a>
          </div>

          <div className="hidden md:block space-x-3">
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md">
              Get started
            </button>
            <button className="hover:bg-slate-300/20 transition px-6 py-2 border border-slate-400 rounded-md">
              Login
            </button>
          </div>

          <button onClick={openMenuHandler} className="md:hidden active:scale-90 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>
            </svg>
          </button>
        </nav>

        <div className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <a href="#products">Products</a>
          <a href="#resources">Resources</a>
          <a href="#stories">Stories</a>
          <a href="#pricing">Pricing</a>
          <button onClick={closeMenuHandler} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-slate-100 hover:bg-slate-200 transition text-black rounded-md flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center mt-32 gap-2 border border-slate-600 text-gray-50 rounded-full px-4 py-2">
          <div className="size-2.5 bg-green-500 rounded-full"/>
          <span>Book a live demo today</span>
        </div>

        <h1 className="text-center text-5xl leading-[68px] md:text-6xl md:leading-[70px] mt-4 font-semibold max-w-2xl">
          Let's build AI agents together
        </h1>

        <p className="text-center text-base max-w-lg mt-2">
          Our platform helps you build, test, and deliver faster — so you can focus on what matters.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 rounded-lg px-7 h-11">
            Get started
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.166 10h11.667m0 0L9.999 4.165m5.834 5.833-5.834 5.834" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="border border-slate-400 active:scale-95 hover:bg-white/10 transition rounded-lg px-8 h-11">
            Book a demo
          </button>
        </div>

        <img 
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/hero-section-showcase-2.png"
          className="w-full rounded-[15px] max-w-4xl mt-16"
          alt="hero section showcase"
        />
      </section>
    </>
  );
};

export default Hero;