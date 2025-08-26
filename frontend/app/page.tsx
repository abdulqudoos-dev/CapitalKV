"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import Hero from "@/components/Hero";
import LogoTicker from "@/components/LogoTicker";
import Features from "@/components/Features";
import Integrations from "@/components/Integrations";
import IndustriesExplanation from "@/components/IndustriesExplanation";
import Club from "@/components/club";
import CallToAction from "@/components/CallToAction";
import ServiceBentoGrid from "@/components/ServiceBentoGrid";

const Home: React.FC = () => {
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="styles.main">
      <div>
        {user && <button onClick={handleLogout}>Logout</button>}
        <Hero />
        {/* <LogoTicker /> */}
        <Features />
        <Integrations />
        <Club />
        {/* <IndustriesExplanation /> */}
        <ServiceBentoGrid />
        <CallToAction />
      </div>
    </main>
  );
};

export default Home;
