"use client";

import React, { RefObject, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import starsBg from "@/assets/stars.png";
import ctaBg from "@/assets/cta-bg.jpg";
import ctaBottomBg from "@/assets/cta-bottom-bg.png";
import { Sparkles } from "lucide-react";

const useRelativeMousePosition = (ref: RefObject<HTMLElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      if (!ref.current) return;
      const { top, left, width, height } = ref.current.getBoundingClientRect();

      // Calculate position as percentage instead of pixels for better responsiveness
      const x = ((event.clientX - left) / width) * 100;
      const y = ((event.clientY - top) / height) * 100;

      // Clamp values between 0 and 100
      mouseX.set(Math.max(0, Math.min(100, x)));
      mouseY.set(Math.max(0, Math.min(100, y)));
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [ref, mouseX, mouseY]);

  return { mouseX, mouseY };
};

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

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.42, 0, 0.58, 1],
      delay: 0.3 + i * 0.1,
    },
  }),
};

const CallToAction = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundPositionY = useTransform(
    scrollYProgress,
    [0, 1],
    [-300, 300]
  );

  const { mouseX, mouseY } = useRelativeMousePosition(containerRef);

  const maskImage = useMotionTemplate`radial-gradient(50% 50% at ${mouseX}% ${mouseY}%, black, transparent)`;

  return (
    <section
      className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24"
      ref={sectionRef}
      style={{
        background: `
              linear-gradient(rgba(18,0,47,1), rgba(18,0,47,0.8)),
              linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)),
              url(${ctaBottomBg.src}) center center/cover no-repeat
            `,
        backgroundBlendMode: "overlay, normal",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={containerRef}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="border border-white/15 py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 mx-2 sm:mx-3 md:mx-4 lg:mx-6 rounded-lg sm:rounded-xl overflow-hidden relative group bg-black"
          transition={{
            repeat: Infinity,
            duration: 60,
            ease: "linear",
          }}
          style={{ backgroundPositionY }}
        >
          {/* Top black fade overlay */}
          <div
            className="pointer-events-none absolute left-0 top-0 w-full h-12 sm:h-16 z-20"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0,1), transparent)",
            }}
          />
          <div
            className="absolute inset-0 bg-purple-900 bg-blend-overlay opacity-90 group-hover:opacity-0 transition duration-700"
            style={{
              backgroundImage: `url(${ctaBg.src})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              maskImage:
                "radial-gradient(70% 70% at 70% 50%, black, transparent)",
            }}
          />
          <motion.div
            className="absolute inset-0 bg-purple-900 bg-blend-overlay opacity-80 group-hover:opacity-100 transition duration-700"
            style={{
              maskImage,
              backgroundImage: `url(${ctaBg.src})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
            }}
          />
          <div className="relative px-4 sm:px-6 md:px-8 lg:px-12">
            <motion.h2
              variants={textVariants}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl/none tracking-tight max-w-5xl mx-auto py-2 sm:py-3 font-semibold bg-gradient-to-t from-white to-neutral-600 bg-clip-text text-transparent leading-tight"
            >
              Unlock the Future of Luxury Now
            </motion.h2>
            <motion.p
              variants={textVariants}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mx-auto max-w-[320px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl py-4 sm:py-6 md:py-8 font-regular"
            >
              CapitalKV:Key Digital Commerce for Real-World Impact and Victory!
            </motion.p>
          </div>

          <motion.div
            variants={textVariants}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative flex flex-col sm:flex-row justify-center items-center mt-6 sm:mt-8 space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-6 md:px-8 lg:px-12"
          >
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-b from-fuchsia-500 to-purple-900 border border-purple-600 transition flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base">
                <Sparkles size={15} className="text-white" />
                Shop
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white hover:bg-white/90 text-black font-semibold px-6 py-3 text-sm sm:text-base">
                Join Now !
              </Button>
            </Link>
          </motion.div>
          {/* Bottom black fade overlay */}
          <div
            className="pointer-events-none absolute left-0 bottom-0 w-full h-12 sm:h-16 z-20"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
