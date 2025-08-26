import Image from "next/image";
import { Button } from "@/components/ui/button";
import HeroBg from "@/assets/hero-bg.png";
import PlanetImage from "@/assets/hero-globe.png";
import { motion, useAnimation, useInView } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { Bot } from "lucide-react"; // Lucide Bot icon
import { BASE_URL } from "@/utils/api"; // Optional base URL
import { useUser } from "@/hooks/use-user";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useUnifiedCart } from "@/hooks/use-unified-cart";
import { useAssistant } from "@/context/Assistant-context";
import { usePayment } from "@/hooks/use-payment";

export default function Hero() {
  const planetRef = useRef(null);
  const controls = useAnimation();
  const inView = useInView(planetRef, { once: true, margin: "-100px" });
  const { user } = useUser();
   
  const { subscriptions: subs } = usePayment();
    const subscriptionsIds = subs?.map((sub: any) => sub.plan_id);
    const CapitalKVExclusive = subscriptionsIds?.includes(
    "prod_Rdm2MmZsfuqc5G"
  );


  const [showExclusive, setShowExclusive] = useState(false);
  const API_BASE_URL = BASE_URL;
  const { toggle } = useAssistant();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = localStorage.getItem("admin") === "true";
      const isSubscriber =
        localStorage.getItem("capitalKV_subscriber") === "true";
      setShowExclusive(isAdmin || isSubscriber);
    }
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1, ease: "easeOut" },
      });
    }
  }, [inView, controls]);

  return (
    <motion.section
      className="relative w-full overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Bottom black fade */}
      <div
        className="pointer-events-none absolute left-0 bottom-0 w-full h-16 sm:h-20 md:h-24 z-30"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
        }}
      />

      {/* Background Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image
          src={HeroBg}
          alt="Space background with flowing curves"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center px-4 text-center mt-28"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
      >
        {/* Main Heading */}
        <motion.h1
          className="text-4xl md:text-6xl font-medium text-white mb-4"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        >
          Next-Level Luxury
        </motion.h1>
        <motion.p
          className="text-md md:text-lg mb-8 max-w-2xl font-light"
          style={{ fontFamily: '"Inter", Arial, sans-serif' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
        >
          What if you’re one key step away from the tools others are already
          using for victory—will you be the one left behind?
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-8 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
        >
          <Link href="/auth/register" passHref legacyBehavior>
            <Button className="bg-gradient-to-b from-fuchsia-500 to-purple-900 text-white font-bold px-8 py-3 rounded-full border-2 border-purple-600  transition-all duration-200 flex items-center gap-2">
              <span className="text-lg">✧</span>
              <span className="tracking-wide">Start Journey</span>
            </Button>
          </Link>
          <Link href="/pricing" passHref legacyBehavior>
            <Button
              variant="outline"
              className="border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-200"
            >
              Shop
            </Button>
          </Link>
        </motion.div>

        {/* Exclusive Button */}
        {showExclusive && (
          <Link href="/exclusive" passHref legacyBehavior>
            <Button className="hidden" aria-label="Exclusive">
              Exclusive
            </Button>
          </Link>
        )}

        {/* Planet Image + Bot Icon */}
        <motion.div
          ref={planetRef}
          initial={{ opacity: 0, y: 80, scale: 0.98 }}
          animate={controls}
          whileHover={{ scale: 1.0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 12 }}
          className="relative"
        >
          {/* Rotating Globe */}
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            {/* Glowing shadow behind the globe */}
            <div
              className="absolute inset-10 z-0 rounded-full pointer-events-none"
              style={{
                boxShadow: "0 0 80px 32px rgba(34,211,238,0.45)",
                filter: "blur(2px)",
              }}
            />

            {/* Planet */}
            <Image
              src={PlanetImage}
              alt="Glowing teal planet"
              width={400}
              height={400}
              className="h-48 w-48 object-contain md:h-64 md:w-64 lg:h-80 lg:w-80 xl:h-96 xl:w-96 2xl:h-[28rem] 2xl:w-[28rem] relative z-10"
              priority
            />
          </motion.div>


          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-auto">
  {/* Ambient floating effect */}
  <div className="relative flex items-center justify-center animate-spin-slower">
    {/* Ambient blur/glow aura */}
    <div className="absolute inset-0 rounded-full bg-cyan-300/5 blur-2xl animate-ping-slower" />

    {/* Main 3D Orb Button with Glass Effect */}
      <button
                 onClick={() => {
                    if (CapitalKVExclusive || user?.is_admin_user) {
                      toggle(); // ✅ Open assistant
                    } else {
                      alert("Access denied: Only CapitalKV Exclusive subscribers can use the AI Assistant."); // ❌ Fallback alert
                    }
                  }}
      className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full
                 bg-white/10 backdrop-blur-[6px] border border-white/10
                 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.1),inset_-2px_-2px_8px_rgba(0,0,0,0.2),0_4px_30px_rgba(0,0,0,0.4)]
                 flex items-center justify-center
                 transition-transform duration-300
                 hover:scale-105 hover:shadow-[0_0_40px_10px_rgba(34,211,238,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
      aria-label="Activate AI Assistant"
    >
      {/* AI Bot Icon with gentle bounce */}
      <Bot className="text-cyan-200 w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] animate-bounce-slow" />
      
      {/* Inner light reflection */}
      <span className="absolute inset-2 rounded-full bg-white/5 blur-sm pointer-events-none" />
    </button>
  </div>

  {/* Subtitle text, faded and soft */}
  <span className="text-cyan-100 mt-4 text-sm md:text-base font-light tracking-wide opacity-70 animate-fade-in">
    Engage AI Assistant
  </span>
</div>
              

\        </motion.div>
      </motion.div>

      {/* Overlay Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-purple-900/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1 }}
      />
    </motion.section>
  );
}
