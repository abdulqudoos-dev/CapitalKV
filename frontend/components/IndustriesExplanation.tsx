// This will be a new file, e.g., components/FeaturesSection.tsx or sections/InvestmentOpportunities.tsx

"use client";

import React from "react";
import { motion } from "framer-motion";
import bgLines from "@/assets/component-bg.png";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1], delay: 0.2 },
  },
};

const cards = [
  {
    title: "Starlight Fund",
    description:
      "A real estate-backed investment fund that annually selects and invests in a promising tech company, driving innovation and growth.",
  },
  // {
  //   title: "Ghost Kitchens",
  //   description:
  //     "Launch your own food brand with CapitalKV’s Ghost Kitchen model—no dine-in required, just streamlined delivery and scalable operations.",
  // },
  {
    title: "Franchise Model",
    description:
      "Operate exclusive businesses powered by CapitalKV’s products and support, designed for entrepreneurs seeking proven growth opportunities.",
  },
  {
    title: "Product Testing Lab",
    description:
      "Validate new products in real market conditions using CapitalKV’s e-commerce ecosystem, gaining actionable feedback and minimizing risk.",
  },
];

const IndustriesExplanation = () => {
  return (
    <section
      className="relative bg-transparent flex justify-center py-6 sm:py-8 md:py-12 lg:py-16 xl:py-24"
      style={{
        background: `
              linear-gradient(rgba(18,0,47,1), rgba(18,0,47,0.6)),
              linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.6)),
              url(${bgLines.src}) center center/cover no-repeat
            `,
        backgroundBlendMode: "overlay, normal",
      }}
    >
      {/* Top black fade */}
      <div
        className="pointer-events-none absolute left-0 top-0 w-full h-16 sm:h-20 md:h-24 z-30"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)",
        }}
      />
      {/* Bottom black fade */}
      <div
        className="pointer-events-none absolute left-0 bottom-0 w-full h-16 sm:h-20 md:h-24 z-30"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-2xl border border-[#5959E7] backdrop-blur-md shadow-[inset_0_0_25px_1px_rgba(57,59,148,0.5)] p-6 flex flex-col items-start text-left relative min-h-[240px] transition-all duration-200"
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2 border-b-2 border-white/40 pb-8">
                {card.title}
              </h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mt-4">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesExplanation;
