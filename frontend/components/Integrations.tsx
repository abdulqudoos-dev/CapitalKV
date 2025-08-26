"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import bgLines from "@/assets/component-bg.png";

// Animation variants similar to club.tsx
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1], delay: 0.2 },
  },
};

const perkVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.42, 0, 0.58, 1],
      delay: 0.4 + i * 0.1,
    },
  }),
};

const subscriptionDetails = {
  name: "CapitalKV Exclusive",
  price: "€4.99/month",
  perks: [
    "CapitalKV Exclusive",
    "Unlock early drops in shop — CapitalKV members only",
    "Early exclusive limited collab products at CapitalKV shop",
    "Email Support",
  ],
  link: "/pricing",
};

const SubscriptionCard: React.FC = () => {
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

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex justify-center">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative flex flex-col lg:flex-row items-stretch w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl rounded-2xl lg:rounded-3xl border border-[#5959E7] backdrop-blur-md overflow-hidden shadow-[0_0_20px_2px_rgba(57,59,148,0.3)]"
        >
          {/* Inner shadow layer */}
          <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl lg:rounded-3xl shadow-[inset_0_0_25px_1px_rgba(57,59,148,1)]" />

          {/* Left: Description */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative z-20 flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 text-center lg:text-left "
          >
            <motion.h2
              variants={containerVariants}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold bg-gradient-to-t from-white to-neutral-600 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight"
            >
              Unlock VIP Access Join CapitalKV Exclusive
            </motion.h2>
            <motion.p
              variants={containerVariants}
              className="text-white mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg font-regular"
            >
              Experience Superior Communication
            </motion.p>
            <motion.p
              variants={containerVariants}
              className="text-white text-xs sm:text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0"
            >
              Get early access to drops, exclusive collab products, and more
              with CapitalKV.
            </motion.p>
          </motion.div>

          {/* Right: Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative z-20 flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
          >
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md mx-auto rounded-xl lg:rounded-2xl border border-[#5959E7] backdrop-blur-md shadow-[inset_0_0_25px_1px_rgba(57,59,148,0.5)] p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8">
              <div className="text-center sm:text-left">
                <motion.h3
                  variants={containerVariants}
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-2 sm:mb-3"
                >
                  {subscriptionDetails.name}
                </motion.h3>
                <motion.div
                  variants={containerVariants}
                  className="flex items-baseline justify-center sm:justify-start mb-4 sm:mb-5 md:mb-6"
                >
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-t from-white to-neutral-600 bg-clip-text text-transparent leading-tight">
                    €4.99
                  </span>
                  <span className="text-xs sm:text-sm md:text-base font-medium text-white/70 ml-2">
                    Per month
                  </span>
                </motion.div>
              </div>

              <div className="w-full mb-4 sm:mb-5 md:mb-6">
                <motion.h4
                  variants={containerVariants}
                  className="text-sm sm:text-base md:text-lg text-white mb-3 sm:mb-4 text-center sm:text-left"
                >
                  Membership Benefits:
                </motion.h4>
                <div className="w-full border-b border-white/20 my-4 sm:my-5 md:my-6"></div>

                <ul className="space-y-2 sm:space-y-3  overflow-y-auto pr-1 sm:pr-2">
                  {subscriptionDetails.perks.map((perk, index) => (
                    <motion.li
                      key={index}
                      custom={index}
                      variants={perkVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.3 }}
                      className="flex items-start text-white/90 text-xs sm:text-sm md:text-base leading-relaxed"
                    >
                      <span className="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white mr-2 sm:mr-3 mt-0.5 flex-shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-black" />
                      </span>
                      <span className="flex-1">{perk}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <Link href={subscriptionDetails.link} className="w-full">
                <Button className="w-full bg-gradient-to-b from-fuchsia-500 to-purple-900 text-white font-bold px-8 py-3 rounded-full border-2 border-purple-600  transition-all duration-200 flex items-center gap-2 ">
                  ✧ Join CapitalKV Exclusive
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionCard;
