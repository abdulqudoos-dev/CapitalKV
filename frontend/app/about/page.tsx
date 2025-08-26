'use client';

import React from 'react';
import { motion } from 'framer-motion';

const page = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className='container mx-auto mt-20 h-full'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <motion.h2
        className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 bg-[radial-gradient(100%_100%_at_top_left,white,white,rgba(140,65,255,0.6))] text-transparent bg-clip-text'
        variants={itemVariants}
      >
        About CapitalKV
      </motion.h2>
      <motion.p
        className='text-center mx-auto max-w-[700px] text-gray-200'
        variants={itemVariants}
      >
        <p>
          Founded amid the uncertainty of the COVID-19 pandemic, CapitalKV emerged from witnessing firsthand how daunting it was for entrepreneurs and everyday individuals to navigate e-commerce, find reliable networks, and scale their businesses. The rapid shift online exposed a widespread lack of accessible tools, guidance, and community support—creating fear and isolation for many aspiring founders.
        </p>

        <p className="mt-4">
          In response, CapitalKV built an integrated ecosystem to bridge these gaps — combining a members-only business chat network, real estate-backed venture capital, tailored digital products, and AI-powered solutions. Our goal is to empower entrepreneurs with the resources, connections, and confidence needed to grow sustainably in a complex digital landscape potentially.
        </p>

        <p className="mt-4">
          Our model unites:
        </p>
        <ul className="list-disc list-inside space-y-1 text-left max-w-[600px] mx-auto my-4">
          <li><strong>CapitalKV+:</strong> A vibrant community offering real-time guidance and collaboration.</li>
          <li><strong>Real Estate-Backed Venture Capital Accelerator:</strong> Combining stable assets with growth investments.</li>
          <li><strong>Tailored Digital Products:</strong> Exclusive offerings for modern businesses and consumers.</li>
          <li><strong>Focused Growth Strategies:</strong> Franchise opportunities and retail access to accelerate scaling.</li>
        </ul>

        <p className="mt-6 font-semibold text-lg">
          Accelerator Fund Program
        </p>
        <p className="mt-2">
          Each year, our flagship fund invests in a top tech startup, providing not only capital but strategic support powered by real estate assets. Members gain exclusive investment access potentially, marketing support, office space, and networking opportunities, fostering sustainable, high-impact growth.
        </p>

        <ul className="list-disc list-inside space-y-1 text-left max-w-[600px] mx-auto my-4">
          <li>One-time membership fee: €10,000</li>
          <li>Monthly service fee: €500</li>
          <li>Focus on sustainable, green ventures</li>
          <li>Optional marketing and retail partnerships</li>
        </ul>

        <p className="mt-6">
          At CapitalKV, we go beyond funding — we build communities and tools that help entrepreneurs thrive smarter and faster potentially, creating lasting value for all stakeholders.
        </p>
      </motion.p>
    </motion.div>
  );
};

export default page;
