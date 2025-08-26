"use client";

import { useState, useMemo, useEffect, useCallback } from "react"; // Added useEffect, useCallback
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import api, { BASE_URL } from "@/utils/api";
import { usePayment } from "@/hooks/use-payment";
import { useUnifiedCart } from "@/hooks/use-unified-cart";
import { useAuthContext } from "@/contexts/AuthContext";
import { Plan, PlanFeature } from "@/schema/Plan";
import axios from "axios";
import { API_URL } from "@/utils/config";

// Define your API base URL
const API_BASE_URL = BASE_URL; // CRITICAL: Ensure this matches your backend URL

// Interface for products fetched from the backend, matching ProductDetails in models.py
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
}

const MotionCard = motion(Card);

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function safeParse<T>(str: string | null | undefined, fallback: T) {
  try {
    if (!str) return fallback;
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export default function PricingPlans() {
  const [view, setView] = useState<"subscriptions" | "products">(
    "subscriptions"
  );
  const { plans } = usePayment();
  const { addToCart, isAddingToCart, isAuthenticated } = useUnifiedCart();
  const { user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription");

  // New states for product fetching
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const filteredPlans = useMemo(() => {
    return plans?.filter((plan) => {
      const match = plan.interval === "month" && plan.active;
      return subscriptionId ? match && plan.id === subscriptionId : match;
    });
  }, [plans, subscriptionId]);

  const handleProductImage = async (id: string) => {
    const response = await axios.get(
      `${API_URL}/ecommerce/admin/product-image/${id}`,
      {
        responseType: "blob",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      }
    );
    const blob = new Blob([response.data], { type: "image/jpeg" });
    return URL.createObjectURL(blob);
  };

  const [productImages, setProductImages] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    async function fetchProductImage() {
      if (products && products.length) {
        const urls: { [key: string]: string } = {};
        await Promise.all(
          products.map(async (u: any) => {
            if (u.image_url) {
              try {
                const url = await handleProductImage(u.product_id);
                urls[u.id] = url;
              } catch (err) {
                console.error("Error fetching product image:", err);
              }
            }
          })
        );
        Object.values(productImages).forEach((url) => URL.revokeObjectURL(url));
        setProductImages(urls);
      }
    }
    fetchProductImage();
  }, [products]);

  // Function to fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);
      const response = await fetch(`${API_BASE_URL}/ecommerce/shop/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProductsError("Failed to load products. Please try again later.");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Effect to fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePlanSelect = async (planId: string) => {
    if (!isAuthenticated) {
      // For guest users, add to cart and redirect to cart page
      const plan = plans?.find((p) => p.id === planId);
      if (plan) {
        const productData: Product = {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          currency: plan.currency || "usd",
          description: plan.description || null,
          image_url: null,
          active: plan.active,
          features: plan.features?.map((f: PlanFeature) => f.name) || null,
          category: "subscription",
          interval: plan.interval,
          interval_count: plan.interval_count,
        };
        await addToCart(productData, 1);
        router.push("/cart");
      }
      return;
    }

    // For authenticated users, use the existing flow
    let selectedPlans = safeParse<string[]>(Cookies.get("selected_plans"), []);
    if (!selectedPlans.includes(planId)) {
      if (
        planId === "prod_RKmbTUf8GVWRbZ" ||
        planId === "prod_RKmcvDUQOPIrFO"
      ) {
        selectedPlans = selectedPlans.filter(
          (id) => id !== "prod_RKmbTUf8GVWRbZ" && id !== "prod_RKmcvDUQOPIrFO"
        );
      }
      selectedPlans.push(planId);
      Cookies.set("selected_plans", JSON.stringify(selectedPlans));
    }
    router.push("/cart");
  };

  const handleProductSelect = async (product: Product) => {
    if (isAuthenticated) {
      // For authenticated users, pass product ID
      await addToCart(product.id, 1);
    } else {
      // For guest users, pass the full product object
      await addToCart(product, 1);
    }
    router.push("/cart");
  };

  return (
    <section className="w-full py-20 px-6 lg:px-24 bg-background">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold bg-[radial-gradient(100%_100%_at_top_left,white,white,rgba(140,65,255,0.6))] text-transparent bg-clip-text"
        >
          Product Hub
        </motion.h2>
        <p className="text-muted-foreground text-sm mt-4 max-w-xl mx-auto">
          Discover the perfect plan and cutting-edge products to enhance your
          digital experience.
        </p>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center mb-10 space-x-4">
        <button
          onClick={() => setView("subscriptions")}
          className={`px-6 py-2 rounded-full text-sm font-medium ${
            view === "subscriptions"
              ? "bg-muted text-muted-foreground border border-border"
              :  "bg-primary text-primary-foreground"
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setView("products")}
          className={`px-6 py-2 rounded-full text-sm font-medium ${
            view === "products"
              ? "bg-muted text-muted-foreground border border-border"
              :  "bg-primary text-primary-foreground"
          }`}
        >
          Products
        </button>
      </div>

      {/* Subscriptions */}
      {view === "subscriptions" && (
        <div className="grid gap-10 lg:grid-cols-2">
          {filteredPlans?.reverse()?.map((plan: Plan, index: number) => (
            <MotionCard
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-card border border-border shadow-xl backdrop-blur-lg rounded-3xl overflow-hidden"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  {plan.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">€{plan.price}/month</p>
                <ul className="mt-6 space-y-3">
                  {plan.features?.map((feature: PlanFeature, idx: number) => (
                    <li
                      className="flex items-center text-muted-foreground"
                      key={idx}
                    >
                      <Check className="mr-2 h-4 w-4 text-green-400" />
                      {feature.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isAddingToCart === plan.id}
                  className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {isAddingToCart === plan.id ? "Adding..." : "Choose Plan"}
                </Button>
              </CardFooter>
            </MotionCard>
          ))}
        </div>
      )}

      {/* Products */}
      {view === "products" && (
        <>
          {loadingProducts ? (
            <div className="text-center">Loading products...</div>
          ) : productsError ? (
            <div className="text-center text-destructive">
              Error: {productsError}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center">No products available.</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-10">
              {products.map(
                (product) =>
                  // Only display active products
                  product.active && (
                    <MotionCard
                      key={product.id} // Use product.id from backend
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.04 }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                      className="bg-card border border-border rounded-3xl backdrop-blur-xl px-6 py-8 flex flex-col items-center shadow-lg"
                    >
                      <CardHeader className="flex flex-col items-center">
                        <img
                          src={
                            productImages[product.id] ||
                            "/placeholder-image.jpg"
                          } // Use image_url from backend
                          alt={product.name}
                          className="w-28 h-28 object-cover rounded-2xl border border-border mb-5"
                        />
                        <CardTitle className="text-center text-lg font-semibold">
                          {product.name}
                        </CardTitle>
                        <p className="text-xs uppercase text-muted-foreground mt-1">
                          {product.category || "General"}{" "}
                          {/* Use category from backend */}
                        </p>
                      </CardHeader>
                      <CardContent className="text-center mt-4 px-2">
                        <p className="text-sm text-muted-foreground mb-4">
                          {product.description || "No description available."}
                        </p>
                        <p className="text-xl font-bold">
                          {product.currency.toUpperCase()}
                          {product.price.toFixed(2)}
                        </p>
                      </CardContent>
                      <CardFooter className="w-full mt-5">
                        <Button
                          className="w-full bg-primary text-primary-foreground rounded-full text-sm py-2 font-medium hover:bg-primary/90"
                          onClick={() => handleProductSelect(product)}
                          disabled={isAddingToCart === product.id}
                        >
                          {isAddingToCart === product.id
                            ? "Adding..."
                            : "Add to Cart"}
                        </Button>
                      </CardFooter>
                    </MotionCard>
                  )
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
