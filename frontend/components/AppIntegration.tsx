"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import IntegrtionIocn from "@/assets/integration.png";

const AppIntegration = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Custom ease curve for a springy effect
      },
    },
  };

  return (
    <motion.section
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-neutral-950/30 via-purple-900/30 to-neutral-950/30"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 bg-[radial-gradient(100%_100%_at_top_left,white,white,rgba(140,65,255,0.6))] text-transparent bg-clip-text"
          variants={textVariants}
        >
          Smart Picks
        </motion.h2>
        <div className="md:flex">
          <motion.div className="my-auto" variants={textVariants}>
            <motion.p
              className="text-center text-2xl py-3 font-semibold max-w-full md:max-w-[700px]"
              variants={textVariants}
            >
              Holographic Future!
            </motion.p>
            <motion.p
              className="text-center max-w-full md:max-w-[700px] text-gray-200 md:text-xl"
              variants={textVariants}
            >
              CapitalKV: Driving strong returns and real-world impact by strategically investing in high-potential [Real Estate/Assets/Startups] with hands-on management.
             <Link href="/contact" className="text-green-900"> Join CapitalKV. </Link>
              {" "}
            </motion.p> 
          </motion.div>
          <motion.div
            className="max-w-[200px] md:max-w-[300px] mx-auto my-10"
            variants={imageVariants}
          >
            <motion.div>
              <Image src={IntegrtionIocn} alt="Integration Icon" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AppIntegration;
