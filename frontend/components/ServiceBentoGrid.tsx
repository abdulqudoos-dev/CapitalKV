"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Banknote, FlaskConical, Store, Megaphone } from "lucide-react";

// === Props ===
interface ServiceCardProps {
  title: string;
  description: string;
  imageSlot?: React.ReactNode;
  className?: string;
}

// === Card ===
const ServiceCard: React.FC<ServiceCardProps> = React.memo(
  ({ title, description, imageSlot, className = "" }) => {
    return (
      <article
        role="region"
        aria-label={title}
        className={`group relative overflow-hidden rounded-3xl p-6 md:p-8 h-full border border-white/10 bg-white/5 backdrop-blur-sm text-white flex flex-col gap-6 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.015] ${className}`}
      >
        {/* Background hover effect */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/10 via-white/5 to-cyan-400/10 pointer-events-none" />

        {/* Icon */}
        {imageSlot && (
          <div
            aria-hidden="true"
            className="relative w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-purple-400/30"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">{imageSlot}</div>
          </div>
        )}

        {/* Text */}
        <div className="relative z-10">
          <h3 className="text-xl md:text-2xl font-semibold leading-tight bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed font-normal">
            {description}
          </p>
        </div>

        {/* Hover border ring */}
        <div className="absolute inset-0 z-0 rounded-3xl border border-transparent group-hover:border-purple-400/20 transition-all duration-300 pointer-events-none" />
      </article>
    );
  }
);

// === Gradient Heading Card ===
const GradientHeadingCard: React.FC = React.memo(() => (
  <article
    role="region"
    aria-label="Additional Services"
    className="group relative rounded-3xl p-6 md:p-8 h-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white flex flex-col items-center justify-center text-center overflow-hidden hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500"
  >
    {/* Hover glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

    {/* Text */}
    <div className="relative z-10">
      <h3 className="text-base md:text-lg font-bold mb-2 drop-shadow-lg">
        Additional Services
      </h3>
      <p className="text-sm md:text-base font-medium opacity-90 drop-shadow-sm">
        Explore our comprehensive suite
      </p>
    </div>

    {/* Decorative dots */}
    <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
    <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-500" />
  </article>
));

// === Data ===
const services = {
  accelerator: {
    title: "Idea Factory",
    description:
      "Struggling with uncertainty and where to start? Franchise the CapitalKV Accelerator program and create a space where innovation thrives, earning opportunities grow, and multiple ideas flourish.",
    icon: (
      <Megaphone
        size={24}
        className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300"
      />
    ),
  },
  marketing: {
    title: "Accelerator Fund Program",
    description:
      "Real estate-powered fund investing in 1 elite tech startup annually and providing services like digital marketing and short term office space till the demo day, with a one-time payment and small monthly fee.",
    icon: (
      <Banknote
        size={24}
        className="text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300"
      />
    ),
  },
  productTesting: {
    title: "Product testing lab",
    description:
      "Test and validate new products through CapitalKV's e-commerce ecosystem, real feedback, and zero guesswork.",
    icon: (
      <FlaskConical
        size={24}
        className="text-orange-400 group-hover:text-orange-300 transition-colors duration-300"
      />
    ),
  },
  retail: {
    title: "Retail to Shop",
    description:
      "Empower retailers to buy and resell exclusive branded products.",
    icon: (
      <Store
        size={24}
        className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300"
      />
    ),
  },
};

// === Main Component ===
const ServicesShowcase: React.FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/contact");
  };

  return (
    <section
      aria-label="Our Services"
      className="py-16 px-4 bg-black md:px-6 lg:px-12 overflow-hidden"
    >
      <div
        className="relative z-10 max-w-6xl mx-auto
        rounded-3xl p-6 md:p-10
        border border-[#5959E7] bg-purple-900/10 shadow-[inset_0_0_25px_1px_rgba(57,59,148,0.5)]
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
        auto-rows-[minmax(180px,auto)]
        gap-6 md:gap-8"
      >
        <div className="lg:row-span-1 lg:col-span-1">
          <GradientHeadingCard />
        </div>

        <div className="lg:col-span-2 lg:row-span-2"onClick={handleClick}>
          <ServiceCard {...services.retail} imageSlot={services.retail.icon} />
        </div>

        <div className="lg:row-span-1 lg:col-span-1"onClick={handleClick}>
          <ServiceCard
            {...services.productTesting}
            imageSlot={services.productTesting.icon}
          />
        </div>

        <div className="lg:col-span-2 lg:row-span-1"onClick={handleClick}>
          <ServiceCard
            {...services.marketing}
            imageSlot={services.marketing.icon}
          />
        </div>

        <div className="lg:col-span-1 lg:row-span-1"onClick={handleClick}>
          <ServiceCard
            {...services.accelerator}
            imageSlot={services.accelerator.icon}
          />
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
