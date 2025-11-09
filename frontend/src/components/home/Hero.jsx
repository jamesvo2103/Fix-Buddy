import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {

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
            <span className="text-2xl font-bold">FixBuddy</span>
          </a>

          <div className="hidden md:block space-x-3">
            <Link to='/login?state=register'>
                <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 transition text-white rounded-md">
                Get started
                </button>
            </Link>
            <Link to='/login?state=login'>
                <button className="hover:bg-slate-300/20 transition px-6 py-2 border border-slate-400 rounded-md">
                Login
                </button>
            </Link>
          </div>
        </nav>

        <div className="flex items-center mt-32 gap-2 border border-slate-600 text-gray-50 rounded-full px-4 py-2">
          <div className="size-2.5 bg-green-500 rounded-full"/>
          <span>Fix your household equipments today</span>
        </div>

        <h1 className="text-center text-5xl leading-[68px] md:text-6xl md:leading-[70px] mt-4 font-semibold max-w-2xl">
          Let's fix your household problems
        </h1>

        <p className="text-center text-base max-w-lg mt-2">
          Our platform helps you fix and save budget when it comes to household issues, especially your equipments.
        </p>

        <div className="flex items-center gap-4 mt-8">
            <Link to='/login?state=register'>
                <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white active:scale-95 rounded-lg px-7 h-11">
                    Get started
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.166 10h11.667m0 0L9.999 4.165m5.834 5.833-5.834 5.834" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </Link>
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