"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Loader2, Search, Crown, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUnifiedCart } from "@/hooks/use-unified-cart";
import { useAuthContext } from "@/contexts/AuthContext";
import api, { BASE_URL } from "@/utils/api";
import { usePayment } from "@/hooks/use-payment";
import CountdownTimer from "@/components/CountdownTimer";
import { Product as ProductType, getProductAccessStatus, shouldShowProduct, canPurchaseProduct } from "@/utils/productAccess";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  features: string[] | null;
  category: string | null;
  interval: string | null;
  interval_count: number | null;
  // Early Access Fields
  early_access_date?: string;
  release_date?: string;
  subscriber_tier_required?: string;
  // Access control info (from API)
  access_status?: string;
  countdown_info?: any;
}

const MotionCard = motion(Card);

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { addToCart, isAddingToCart, isAuthenticated } = useUnifiedCart();
  const { user } = useAuthContext();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/ecommerce/shop/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    
    // Check if product should be shown based on access control
    const productForAccess: ProductType = {
      ...product,
      description: product.description || undefined,
      image_url: product.image_url || undefined,
      features: product.features || undefined,
      category: product.category || undefined,
      interval: product.interval || undefined,
      interval_count: product.interval_count || undefined,
    };
    
    // DEBUG: Log what backend is sending
    console.log(`🔍 Product: ${product.name}`);
    console.log(`🔍 Backend access_status: ${product.access_status}`);
    console.log(`🔍 Backend countdown_info: ${JSON.stringify(product.countdown_info)}`);
    
    // Use backend's access control info if available, otherwise fallback to frontend calculation
    let accessInfo;
    if (product.access_status) {
      // Use backend's calculated access info
      console.log(`✅ Using backend data for ${product.name}`);
      accessInfo = {
        accessStatus: product.access_status,
        countdownInfo: product.countdown_info,
        canPurchase: product.access_status === 'available' || product.access_status === 'early_access',
        message: product.access_status === 'countdown' ? `Available in ${product.countdown_info?.display || 'soon'}` : 
                 product.access_status === 'early_access' ? 'Early Access - CapitalKV Exclusive Members Only' :
                 product.access_status === 'hidden' ? 'Coming Soon' : undefined
      };
    } else {
      // Fallback to frontend calculation
      console.log(`⚠️ Using frontend calculation for ${product.name}`);
      accessInfo = getProductAccessStatus(productForAccess, user?.subscription);
    }
    
    // Ensure canPurchase is always defined
    if (accessInfo.canPurchase === undefined) {
      accessInfo.canPurchase = accessInfo.accessStatus === 'available' || accessInfo.accessStatus === 'early_access';
    }
    
    const shouldShow = shouldShowProduct(productForAccess, user?.subscription, false);
    
    return product.active && matchesSearch && matchesCategory && shouldShow;
  });

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const handleAddToCart = async (product: Product) => {
    if (isAuthenticated) {
      // For authenticated users, pass product ID
      await addToCart(product.id, 1);
    } else {
      // For guest users, pass the full product object
      await addToCart(product, 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  const { subscriptions: subs } = usePayment();
    const subscriptionsIds = subs?.map((sub: any) => sub.plan_id);
    const CapitalKVExclusive = subscriptionsIds?.includes(
    "prod_Rdm2MmZsfuqc5G"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold bg-[radial-gradient(100%_100%_at_top_left,white,white,rgba(140,65,255,0.6))] text-transparent bg-clip-text mb-4"
          >
            Shop Our Products
          </motion.h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover amazing products and services.{" "}
            {!isAuthenticated &&
              "Add items to your cart and sign up to complete your purchase!"}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-background"
            >
              {categories.map((category) => (
                <option key={category ?? ""} value={category ?? ""}>
                  {category === "all"
                    ? "All Categories"
                    : category ?? "Uncategorized"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const productForAccess: ProductType = {
                ...product,
                description: product.description || undefined,
                image_url: product.image_url || undefined,
                features: product.features || undefined,
                category: product.category || undefined,
                interval: product.interval || undefined,
                interval_count: product.interval_count || undefined,
              };
              
              // DEBUG: Log what backend is sending for this product
              console.log(`🔍 Render Product: ${product.name}`);
              console.log(`🔍 Render Backend access_status: ${product.access_status}`);
              console.log(`🔍 Render Backend countdown_info: ${JSON.stringify(product.countdown_info)}`);
              
              // Use backend's access control info if available, otherwise fallback to frontend calculation
              let accessInfo;
              if (product.access_status) {
                // Use backend's calculated access info
                console.log(`✅ Render Using backend data for ${product.name}`);
                accessInfo = {
                  accessStatus: product.access_status,
                  countdownInfo: product.countdown_info,
                  canPurchase: product.access_status === 'available' || product.access_status === 'early_access',
                  message: product.access_status === 'countdown' ? `Available in ${product.countdown_info?.display || 'soon'}` : 
                           product.access_status === 'early_access' ? 'Early Access - CapitalKV Exclusive Members Only' :
                           product.access_status === 'hidden' ? 'Coming Soon' : undefined
                };
              } else {
                // Fallback to frontend calculation
                console.log(`⚠️ Render Using frontend calculation for ${product.name}`);
                accessInfo = getProductAccessStatus(productForAccess, user?.subscription);
              }
              
              // Ensure canPurchase is always defined
              if (accessInfo.canPurchase === undefined) {
                accessInfo.canPurchase = accessInfo.accessStatus === 'available' || accessInfo.accessStatus === 'early_access';
              }
              
              return (
              <MotionCard
                key={product.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-muted">
                    <img
                      src={product.image_url || "/placeholder-image.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.category && (
                        <Badge className="bg-blue-500">
                          {product.category}
                        </Badge>
                      )}
                      {accessInfo.accessStatus === 'early_access' && (
                        <Badge className="bg-amber-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Early Access
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {product.description || "No description available."}
                  </p>
                  
                  {/* Early Access / Countdown Information */}
                  {accessInfo.accessStatus === 'countdown' && accessInfo.countdownInfo && (
                    <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 text-sm text-amber-700">
                        <Clock className="h-4 w-4" />
                        <span>Available in {accessInfo.countdownInfo.display}</span>
                      </div>
                      <p className="text-xs text-amber-700 mt-1">
                        Early access for CapitalKV Exclusive members
                      </p>
                    </div>
                  )}
                  
                  {accessInfo.accessStatus === 'early_access' && (
                    <div className="mb-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <Crown className="h-4 w-4" />
                        <span>CapitalKV Exclusive Early Access</span>
                      </div>
                    </div>
                  )}
                  
                  {accessInfo.accessStatus === 'hidden' && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Clock className="h-4 w-4" />
                        <span>Coming Soon</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Product will be available for early access soon
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">
                      {product.currency.toUpperCase()}
                      {product.price.toFixed(2)}
                    </span>
                    {product.interval && (
                      <span className="text-sm text-muted-foreground">
                        /{product.interval}
                      </span>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={isAddingToCart === product.id || !accessInfo.canPurchase}
                    className="w-full"
                    variant={accessInfo.canPurchase ? "default" : "secondary"}
                  >
                    {isAddingToCart === product.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : !accessInfo.canPurchase ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        {accessInfo.message || "Coming Soon"}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                      )}
                  </Button>
                </CardContent>
              </MotionCard>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 p-6 bg-muted rounded-lg"
          >
            <h3 className="text-xl font-semibold mb-2">
              Ready to complete your purchase?
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign up or log in to proceed to checkout and complete your order.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => (window.location.href = "/auth/register")}>
                Sign Up
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/auth/login")}
              >
                Log In
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
