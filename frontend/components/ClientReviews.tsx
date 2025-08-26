// ProductShowcase.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { motion } from "framer-motion";
import Link from "next/link";
import Dashboard from "@/assets/features-image/dashboard.png";
import AIGlass from "@/assets/features-image/AIGlass.png";
import hpShot from "@/assets/features-image/hp-shot.png";
import mpShot from "@/assets/features-image/mp-shot.png";

const products = [
  {
    id: 1,
    name: "Holographic Glasses AI",
    price: 1999.99,
    imageUrl: AIGlass.src,
    description:
      "Your intelligent companion for daily tasks. Voice-activated, real-time insights.",
    rating: 4.8,
    reviews: 125,
  },
  {
    id: 3,
    name: "HP Shot",
    price: 19.99,
    imageUrl: hpShot.src,
    description:
      "Six natural drink shots that is based on the RPG HP drink with strawberry.",
    rating: 4.7,
    reviews: 70,
  },
  {
    id: 2,
    name: "Holographic Glasses AR",
    price: 1999.99,
    imageUrl: Dashboard.src,
    description:
      "Experience the next dimension. Seamless AR/VR integration with unparalleled clarity.",
    rating: 4.5,
    reviews: 80,
  },
  {
    id: 4,
    name: "MP Shot",
    price: 19.99,
    imageUrl: mpShot.src,
    description:
      "Six natural drink shots that is based on the RPG MP drink with blueberry.",
    rating: 4.4,
    reviews: 50,
  },
];

export default function ProductShowcase() {
  const swiperRef = useRef<any>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(2);

  useEffect(() => {
    const updateSlidesPerView = () => {
      setSlidesPerView(window.innerWidth < 768 ? 1 : 2);
    };
    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, []);

  const handleSlideChange = (swiper: any) => {
    setActiveSlideIndex(swiper.realIndex);
  };

  return (
    <section className="bg-transparent w-full py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold text-center md:text-6xl bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-500 text-transparent bg-clip-text"
        >
          Explore Our Featured Products
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-lg text-muted-foreground mt-4 max-w-3xl mx-auto"
        >
          Cutting-edge gear and unique consumables to elevate your lifestyle and productivity.
        </motion.p>

        <Swiper
          ref={swiperRef}
          spaceBetween={40}
          slidesPerView={slidesPerView}
          centeredSlides
          loop
          onSlideChange={handleSlideChange}
          grabCursor
          className="!py-10"
        >
          {products.map((product, index) => (
            <SwiperSlide key={index} className="flex justify-center">
              <motion.div
                initial={{ scale: 0.95, opacity: 0.7 }}
                animate={
                  activeSlideIndex === index
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0.9, opacity: 0.5 }
                }
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg"
              >
                <Card className="bg-card backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-border hover:border-primary transition duration-300">
                  <CardHeader className="p-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-64 object-cover rounded-t-3xl"
                    />
                    <CardTitle className="text-2xl font-semibold p-6">
                      {product.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-6">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                      {product.description}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {product.reviews} reviews
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center px-6 pb-6 mt-4">
                    <div className="flex gap-1">
                      {[...Array(Math.floor(product.rating))].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <Link href="/contact">
                      <button className="bg-primary text-primary-foreground py-2 px-5 rounded-full hover:bg-primary/90 transition">
                        Add to Cart
                      </button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
