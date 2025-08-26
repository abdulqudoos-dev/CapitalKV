"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart, ArrowRight } from "lucide-react";
import FeatureBg from "@/assets/feature-bg.png";
import Link from "next/link"; // Keep Link import for "Visit Our Shop" button
import { useRef, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useUnifiedCart } from "@/hooks/use-unified-cart";

// Product type interface
interface Product {
  id: string;
  name: string;
  active: boolean;
  price: number;
  currency: string;
  description: string | null;
  image_url: string | null;
  features: string[] | null;
  category: string | null;
  interval: string | null;
  interval_count: number | null;
  product_id?: string;
}

const API_BASE_URL = BASE_URL;

function Features() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [scrollX, setScrollX] = useState(0);
  const { addToCart, isAddingToCart, isAuthenticated } = useUnifiedCart();
  const router = useRouter();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({});

  const handleProductSelect = async (product: Product) => {
    if (isAuthenticated) {
      // For authenticated users, pass product ID
      await addToCart(product.id, 1);
    } else {
      // For guest users, create a new object that includes `product_id` to match the expected payload
      const productForCart = { ...product, product_id: product.id };
      await addToCart(productForCart, 1);
    }
    router.push("/cart");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.scrollBehavior = "auto";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.scrollBehavior = "smooth";
    }
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollX(scrollRef.current.scrollLeft);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);

    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: i * 0.1,
      },
    }),
  };

  const handleProductImage = async (productId: string) => {
    try {
      // Use the public-facing shop endpoint to fetch images
      const response = await axios.get(
        `${API_BASE_URL}/ecommerce/shop/product-image/${productId}`,
        {
          responseType: "blob",
          // Remove the Authorization header as it's not needed for a public endpoint
        }
      );
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Error fetching image for product ${productId}:`, error);
      return "/placeholder-image.jpg";
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);
      const response = await axios.get<Product[]>(`${API_BASE_URL}/ecommerce/shop/products`);
      const activeProducts = response.data.filter((product) => product.active);
      setFeaturedProducts(activeProducts);

      const imageUrls: { [key: string]: string } = {};
      await Promise.all(
        activeProducts.map(async (product) => {
          if (product.image_url) {
            imageUrls[product.id] = await handleProductImage(product.id);
          }
        })
      );
      setProductImages(imageUrls);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProductsError("Failed to load products. Please try again later.");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const ProductCard = ({
    product,
    index,
    isInitialLoad,
  }: {
    product: Product;
    index: number;
    isInitialLoad: boolean;
  }) => (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial={isInitialLoad ? "hidden" : false}
      animate={isInitialLoad ? "visible" : false}
      style={{
        transform: `translateX(${(scrollX - index * 20) * 0.05}px)`,
      }}
      className="flex-shrink-0 w-72 group select-none transition-transform duration-300"
    >
      <div className="bg-[#1A1A3A] border border-[#5959E7] shadow-[inset_0_0_25px_1px_rgba(57,59,148,0.5)] backdrop-blur-md rounded-xl overflow-hidden">
        <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden rounded-xl bg-black/80">
          <Image
            src={productImages[product.id] || "/placeholder-image.jpg"}
            alt={product.name}
            width={260}
            height={200}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-102 rounded-xl"
            loading="lazy"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none rounded-xl" />
        </div>

        <div className="px-6 py-5">
          <p className="text-white/80 text-sm mb-4 leading-relaxed line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-md font-bold text-gray-200">
              ${product.price.toFixed(2)}
            </span>
            {/* The Button now correctly calls the handler to add the product and redirect */}
            <Button
              className="bg-gradient-to-b from-fuchsia-500 to-purple-900 border border-purple-600 transition flex items-center px-6"
              onClick={() => handleProductSelect(product)}
              disabled={isAddingToCart === product.id}
            >
              <ShoppingCart className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
  

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-cover opacity-20 z-0"
        style={{ backgroundImage: `url(${FeatureBg.src})`, backgroundSize: "100% 100%" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute left-0 top-0 w-full h-16 sm:h-20 md:h-24 z-30 bg-gradient-to-b from-black/85 to-transparent" />
      <div className="pointer-events-none absolute left-0 bottom-0 w-full h-16 sm:h-20 md:h-24 z-30 bg-gradient-to-t from-black/85 to-transparent" />

      <div className="relative z-20 max-w-7xl mx-auto w-full py-16 px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Featured Products
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover our handpicked collection of innovative products
          </p>
        </motion.div>

        {loadingProducts ? (
          <div className="text-center text-gray-400">Loading featured products...</div>
        ) : productsError ? (
          <div className="text-center text-red-500">Error: {productsError}</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center text-gray-400">No featured products available.</div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="mb-12"
          >
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide cursor-grab select-none scroll-smooth"
              style={{ scrollSnapType: "x mandatory" }}
            >
              <div className="flex gap-8 pl-4 md:pl-0 pr-4">
                {featuredProducts.map((product, index) => (
                  <div key={product.id} style={{ scrollSnapAlign: "start" }} className="flex-shrink-0">
                    <ProductCard
                      product={product}
                      index={index}
                      isInitialLoad={!hasAnimated}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>←</span>
                <span>Drag to scroll or use mouse wheel</span>
                <span>→</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* This Link remains as it correctly navigates to the full pricing page */}
          <Link href="/pricing">
            <Button className="bg-gradient-to-b from-fuchsia-500 to-purple-900 border border-purple-600 transition items-center">
              Visit Our Shop
              <ArrowRight size={20} className="ml-3" />
            </Button>
          </Link>
        </motion.div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

export default Features;
