import React from "react";
import { motion } from "framer-motion";

const LogoTicker = ({
  speed = 30,
  pauseOnHover = true,
  className = "",
  logoHeight = "h-8",
}) => {
  // Professional logo dataset with realistic company logos
  const logos = [
    {
      id: 1,
      name: "TechCorp",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-gray-300 font-semibold tracking-wide">
            TechCorp
          </span>
        </div>
      ),
    },
    {
      id: 2,
      name: "DataFlow",
      component: (
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-6 bg-green-400 rounded-full"></div>
            <div className="w-2 h-4 bg-green-500 rounded-full mt-1"></div>
            <div className="w-2 h-5 bg-green-600 rounded-full mt-0.5"></div>
          </div>
          <span className="text-gray-300 font-medium">DataFlow</span>
        </div>
      ),
    },
    {
      id: 3,
      name: "CloudSync",
      component: (
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-6 h-4 bg-cyan-400 rounded-full opacity-80"></div>
            <div className="absolute -top-1 left-2 w-4 h-3 bg-cyan-300 rounded-full"></div>
          </div>
          <span className="text-gray-300 font-medium">CloudSync</span>
        </div>
      ),
    },
    {
      id: 4,
      name: "SecureVault",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-7 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-t-full relative">
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gray-700 rounded-sm"></div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full"></div>
          </div>
          <span className="text-gray-300 font-medium">SecureVault</span>
        </div>
      ),
    },
    {
      id: 5,
      name: "Neural Labs",
      component: (
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-pink-400 rounded-full"></div>
            <div className="absolute top-1 left-1 w-2 h-2 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-400 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-pink-300 rounded-full"></div>
          </div>
          <span className="text-gray-300 font-medium">Neural Labs</span>
        </div>
      ),
    },
    {
      id: 6,
      name: "Quantum Systems",
      component: (
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8 border-2 border-indigo-400 transform rotate-45">
            <div className="absolute inset-1 bg-indigo-500 transform -rotate-45"></div>
          </div>
          <span className="text-gray-300 font-medium">Quantum</span>
        </div>
      ),
    },
    {
      id: 7,
      name: "InnovatePro",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-red-500 to-pink-500 rounded-lg flex items-center justify-center transform rotate-12">
            <span className="text-white font-bold text-sm transform -rotate-12">
              i
            </span>
          </div>
          <span className="text-gray-300 font-medium">InnovatePro</span>
        </div>
      ),
    },
    {
      id: 8,
      name: "Alpha Dynamics",
      component: (
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-6 border-b-emerald-400"></div>
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-6 border-b-emerald-500 -ml-2"></div>
          </div>
          <span className="text-gray-300 font-medium">Alpha Dynamics</span>
        </div>
      ),
    },
  ];

  // Triple the logos for ultra-smooth infinite scroll
  const extendedLogos = [...logos, ...logos, ...logos];

  return (
    <div className={`relative overflow-hidden bg-transparent ${className}`}>
      {/* Gradient fade edges for professional look */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

      <motion.div
        className={`flex items-center ${logoHeight} py-12 bg-gradient-to-b from-transparent via-black to-black`}
        animate={{ x: [0, -33.333 + "%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
        whileHover={pauseOnHover ? { animationPlayState: "paused" } : {}}
        style={{ width: "max-content" }}
      >
        {extendedLogos.map((logo, index) => (
          <motion.div
            key={`${logo.id}-${index}`}
            className="flex-shrink-0 px-8 lg:px-12 flex items-center justify-center min-w-[200px] group"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div className="transition-all duration-300 group-hover:brightness-125 mt-10">
              {logo.component}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LogoTicker;
