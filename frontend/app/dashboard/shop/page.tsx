"use client";

import { useState, useMemo, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  AppWindow,
  Trash2,
  Pencil, // Added for the edit icon
  ShoppingCart,
  Search,
  LayoutGrid,
  Store,
  PackageCheck,
  Loader2,
  Bot,
  ShoppingBagIcon, // Added for loading indicator
  Image as ImageIcon, // Renamed to avoid conflict with HTML Image element
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Clock, Crown, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import api, { BASE_URL } from "@/utils/api";
// Assuming these image paths are correct and accessible in your Next.js setup
// These are now less relevant as we'll be uploading images
import { usePayment } from "@/hooks/use-payment";
import { useUser } from "@/hooks/use-user";
import axios from "axios";
import { API_URL } from "@/utils/config";
import Cookies from "js-cookie";
import { useAssistant } from "@/context/Assistant-context";

// Define the base URL for your backend API
const API_BASE_URL = BASE_URL; // IMPORTANT: Update this if your backend runs elsewhere

type Product = {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  active: boolean;
  image_url?: string; // Changed to image_url to match backend
  features?: string[];
  interval?: string;
  interval_count?: number;
  // Early Access Fields
  early_access_date?: string;
  release_date?: string;
  subscriber_tier_required?: string;
  // Access Control Fields (computed by backend)
  access_status?: 'available' | 'early_access' | 'countdown' | 'hidden';
  countdown_info?: {
    display?: string;
    days?: number;
    hours?: number;
    minutes?: number;
    expired?: boolean;
    total_seconds?: number;
  };
};

// Frontend type for a new product to be created
type NewProductData = {
  name: string;
  description: string;
  price: number;
  currency: string;
  is_one_time_purchase: boolean;
  interval?: string;
  interval_count?: number;
  // image_url is now derived from upload, not directly set in initial form data
  active: boolean;
  category?: string;
  in_stock?: boolean;
  // Early Access Fields
  early_access_date?: string;
  release_date?: string;
  subscriber_tier_required?: string;
};

type BackendOrderStatus = {
  status: string;
  estimatedDelivery?: string;
};

export default function ShopManagement() {
  const router = useRouter();
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("shop");
  const { toast } = useToast();
  const { addToCart, isAddingToCart } = useCart();

  // Enhanced add to cart with error handling
  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart(productId);
      toast({
        title: "Added to Cart",
        description: `${productName} has been added to your cart.`,
      });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const [newItemData, setNewItemData] = useState<NewProductData>({
    name: "",
    description: "",
    price: 0,
    currency: "usd",
    is_one_time_purchase: true,
    active: true,
    category: "",
    in_stock: true,
    // Early Access Fields
    early_access_date: "",
    release_date: "",
    subscriber_tier_required: "",
  });

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
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function fetchProductImage() {
      if (shopProducts && shopProducts.length) {
        const urls: { [key: string]: string } = {};
        const loadingStates: { [key: string]: boolean } = {};
        const errorStates: { [key: string]: boolean } = {};
        
        // Set loading states
        shopProducts.forEach((product: any) => {
          if (product.image_url) {
            loadingStates[product.id] = true;
            errorStates[product.id] = false;
          }
        });
        setImageLoadingStates(loadingStates);
        setImageErrors(errorStates);
        
        await Promise.all(
          shopProducts.map(async (u: any) => {
            if (u.image_url) {
              try {
                const url = await handleProductImage(u.product_id);
                urls[u.id] = url;
                setImageLoadingStates(prev => ({ ...prev, [u.id]: false }));
              } catch (err) {
                console.error("Error fetching product image:", err);
                setImageLoadingStates(prev => ({ ...prev, [u.id]: false }));
                setImageErrors(prev => ({ ...prev, [u.id]: true }));
              }
            }
          })
        );
        
        // Cleanup old URLs
        Object.values(productImages).forEach((url) => URL.revokeObjectURL(url));
        setProductImages(urls);
      }
    }
    fetchProductImage();
  }, [shopProducts]);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [orderIdInput, setOrderIdInput] = useState("");
  const [addressDetails, setAddressDetails] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [orderStatus, setOrderStatus] = useState<null | BackendOrderStatus>(
    null
  );
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false); // State for Add Product button loading

  // Function to update a product
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setIsAddingItem(true);
    let imageUrl = editingProduct.image_url; // Default to existing image

    try {
      // If a new image file is selected, upload it first
      if (editImageFile) {
        const formData = new FormData();
        formData.append("file", editImageFile);

        const imageUploadResponse = await api.post(
          "/ecommerce/upload/image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (imageUploadResponse.status === 200) {
          imageUrl = imageUploadResponse.data.image_url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      // Prepare the data for product update
      const productUpdateData = {
        ...editingProduct,
        image_url: imageUrl, // Use new or existing URL
      };

      const response = await api.put(
        `/ecommerce/admin/products/${editingProduct.id}`,
        productUpdateData
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Product updated successfully.",
        });
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        setEditImageFile(null); // Clear the selected image file
        fetchProducts(); // Refresh list
      } else {
        const errorData = response.data;
        toast({
          title: "Error updating product",
          description: errorData.detail || "An unexpected error occurred.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to update product.",
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  // State for editing a product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null); // For handling image updates

  // Handle file selection
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Create URL for preview
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  // --- API Calls ---

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await api.get("/ecommerce/shop/products");
      if (response.status === 200) {
        console.log("🔍 Raw products data from backend:", response.data);
        
        // Log each product's access control data
        response.data.forEach((product: Product, index: number) => {
          console.log(`📦 Product ${index + 1}: ${product.name}`, {
            id: product.id,
            early_access_date: product.early_access_date,
            release_date: product.release_date,
            subscriber_tier_required: product.subscriber_tier_required,
            access_status: product.access_status,
            countdown_info: product.countdown_info,
            current_time: new Date().toISOString()
          });
        });
        
        setShopProducts(response.data);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Could not load products from the shop.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Run once on component mount

  // Debug function to check backend access control
  const debugBackendAccessControl = async () => {
    try {
      console.log("🔍 Checking backend access control...");
      
      // Check raw database data
      const debugResponse = await api.get("/ecommerce/debug/products");
      console.log("🗄️ Raw database data:", debugResponse.data);
      
      // Check if we can get admin products (should show all including hidden)
      const adminResponse = await api.get("/ecommerce/admin/products");
      console.log("📊 Admin products (should include all):", adminResponse.data);
      
      // Check shop products (should be filtered)
      const shopResponse = await api.get("/ecommerce/shop/products");
      console.log("🛍️ Shop products (filtered):", shopResponse.data);
      
      // Compare the two
      const adminProductIds: string[] = adminResponse.data.map((p: any) => p.id);
      const shopProductIds: string[] = shopResponse.data.map((p: any) => p.id);
      
      console.log("🔍 Comparison:", {
        admin_count: adminProductIds.length,
        shop_count: shopProductIds.length,
        hidden_products: adminProductIds.filter(id => !shopProductIds.includes(id))
      });
      
    } catch (error: any) {
      console.error("❌ Debug backend access control failed:", error);
    }
  };

  // Run debug on mount in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugBackendAccessControl();
    }
  }, []);

  const addNewItem = async () => {
    const {
      name,
      description,
      price,
      category,
      currency,
      is_one_time_purchase,
      active,
      in_stock,
      early_access_date,
      release_date,
      subscriber_tier_required,
    } = newItemData;
    
    // Basic validation
    if (!name || !description || !price || !category || price <= 0) {
      toast({
        title: "Error",
        description: "Name, description, valid price, and category are required.",
        variant: "destructive",
      });
      return;
    }

    // Early access validation
    if (early_access_date && release_date) {
      const earlyDate = new Date(early_access_date);
      const releaseDate = new Date(release_date);
      
      if (earlyDate >= releaseDate) {
        toast({
          title: "Error",
          description: "Early access date must be before release date.",
          variant: "destructive",
        });
        return;
      }
      
      if (earlyDate <= new Date()) {
        toast({
          title: "Error",
          description: "Early access date must be in the future.",
          variant: "destructive",
        });
        return;
      }
    }

    if (release_date && new Date(release_date) <= new Date()) {
      toast({
        title: "Error",
        description: "Release date must be in the future.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingItem(true); // Start loading

    let imageUrlForBackend: string | null = null;

    // Step 1: Upload image if selected
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      try {
        const uploadResponse = await fetch(
          `${API_BASE_URL}/ecommerce/upload/image`,
          {
            method: "POST",
            body: formData, // No 'Content-Type' header needed for FormData
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            errorData.detail ||
              `Image upload failed! status: ${uploadResponse.status}`
          );
        }
        const uploadResult = await uploadResponse.json();
        imageUrlForBackend = uploadResult.image_url;
      } catch (uploadError: any) {
        console.error("Failed to upload image:", uploadError);
        toast({
          title: "Upload Error",
          description: `Failed to upload image: ${uploadError.message}`,
          variant: "destructive",
        });
        setIsAddingItem(false); // Stop loading on upload failure
        return;
      }
    }

    // Step 2: Create product with the obtained image URL
    try {
      const productData = {
        name,
        description,
        price,
        currency,
        is_one_time_purchase,
        image_url: imageUrlForBackend, // Use the uploaded image URL
        active,
        category,
        in_stock,
        features: [],
        interval: is_one_time_purchase ? null : newItemData.interval,
        interval_count: is_one_time_purchase
          ? null
          : newItemData.interval_count,
        // Early Access Fields
        early_access_date: early_access_date || null,
        release_date: release_date || null,
        subscriber_tier_required: subscriber_tier_required || null,
      };

      const response = await fetch(`${API_BASE_URL}/ecommerce/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const createdProduct: Product = await response.json();
      setShopProducts((prevItems) => [...prevItems, createdProduct]);
      setIsDialogOpen(false);
      toast({
        title: "Product Created",
        description: `${name} has been added to the store.`,
      });

      // Reset form and image fields
      setNewItemData({
        name: "",
        description: "",
        price: 0,
        currency: "usd",
        is_one_time_purchase: true,
        active: true,
        category: "",
        in_stock: true,
        // Early Access Fields
        early_access_date: "",
        release_date: "",
        subscriber_tier_required: "",
      });
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    } catch (error: any) {
      console.error("Failed to add new product:", error);
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAddingItem(false); // Stop loading
    }
  };

  const deleteItem = async (productId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ecommerce/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      setShopProducts((prevItems) =>
        prevItems.filter((item) => item.id !== productId)
      );
      toast({
        title: "Item Archived",
        description: "The item has been removed from the catalog.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Failed to delete item:", error);
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const trackOrder = async () => {
    if (!orderIdInput) {
      toast({
        title: "Tracking Failed",
        description: "Please provide an Order ID.",
        variant: "destructive",
      });
      return;
    }
    setTrackingLoading(true);
    setOrderStatus(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ecommerce/orders/${orderIdInput}`,
        {
          headers: {
            "Authorization": `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found or address details do not match.");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setOrderStatus({
        status: data.status,
        estimatedDelivery:
          "Delivery information not available from backend yet.",
      });
      toast({ title: "Order Found", description: `Status: ${data.status}` });
    } catch (error: any) {
      console.error("Order tracking failed:", error);
      toast({
        title: "Tracking Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return shopProducts.filter((item) => {
      const matchesTab = item.active;
      return (
        matchesTab &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    });
  }, [shopProducts, searchTerm]);

  // Helper function to get access status badge
  const getAccessStatusBadge = (item: Product) => {
    console.log(`🎯 Getting badge for product: ${item.name}`, {
      access_status: item.access_status,
      countdown_info: item.countdown_info,
      early_access_date: item.early_access_date,
      release_date: item.release_date
    });
    
    switch (item.access_status) {
      case 'early_access':
        return (
          <Badge variant="default" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Early Access
          </Badge>
        );
      case 'countdown':
        return (
          <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-300 border-orange-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>
        );
      case 'available':
        return (
          <Badge variant="default" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
            Available
          </Badge>
        );
      default:
        console.warn(`⚠️ Unknown access status for ${item.name}:`, item.access_status);
        return null;
    }
  };

  // Helper function to check if product can be purchased
  const canPurchaseProduct = (item: Product) => {
    const canPurchase = item.access_status === 'available' || item.access_status === 'early_access';
    console.log(`🛒 Purchase check for ${item.name}:`, {
      access_status: item.access_status,
      canPurchase: canPurchase
    });
    return canPurchase;
  };

  // Helper function to get countdown display
  const getCountdownDisplay = (item: Product) => {
    console.log(`⏰ Countdown check for ${item.name}:`, {
      access_status: item.access_status,
      countdown_info: item.countdown_info,
      has_display: !!item.countdown_info?.display
    });
    
    if (item.access_status === 'countdown' && item.countdown_info?.display) {
      return (
        <div className="text-xs text-orange-300 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20">
          <Clock className="w-3 h-3 inline mr-1" />
          Available in {item.countdown_info.display}
        </div>
      );
    }
    return null;
  };
  const { user, loading } = useUser();
  const [subscriptions, setSubscriptions] = useState({
    canAddApp: false,
    canAddCampaign: false,
  });
 
  const { subscriptions: subs } = usePayment();
  const subscriptionsIds = subs?.map((sub: any) => sub.plan_id);
  const CapitalKVExclusive = subscriptionsIds?.includes(
    "prod_Rdm2MmZsfuqc5G"
  );

  // Debug user and subscription info
  console.log("👤 User debug info:", {
    user: user,
    user_subscription: user?.subscription,
    subscriptions: subs,
    subscriptionIds: subscriptionsIds,
    CapitalKVExclusive: CapitalKVExclusive,
    current_time: new Date().toISOString()
  });
  const { toggle } = useAssistant();

  return (
    <div className="p-3 sm:p-6 min-h-screen text-white overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-4 bg-transparent">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold">Product Hub</h1>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 md:w-64 bg-white/5 border border-white/20 text-white placeholder-gray-300"
          />
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
              <Button
                variant="secondary"
                onClick={() => {
                    if (CapitalKVExclusive || user?.is_admin_user) {
                      toggle(); // ✅ Open assistant
                    } else {
                      alert("Access denied: Only CapitalKV Exclusive subscribers can use the AI Assistant."); // ❌ Fallback alert
                    }
                  }}
                className="rounded-full p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                aria-label="Open AI Assistant"
              >

                <Bot  className="text-cyan-200 w-4 h-4 sm:w-5 sm:h-5 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] animate-bounce-slow" />
              </Button>   
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shop" onValueChange={(val) => setActiveTab(val)}>
        <TabsList className="mb-4 sm:mb-6 bg-white/5 border border-white/10 flex space-x-1 sm:space-x-2 w-full sm:w-auto overflow-x-auto">
          <TabsTrigger
            value="shop"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Shop</span>
          </TabsTrigger>

          <TabsTrigger
            value="track"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Order Tracking</span>
          </TabsTrigger>

          {(CapitalKVExclusive || user?.is_admin_user) && (
            <TabsTrigger
              value="manage"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Manage Products</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Shop Tab Content */}
        <TabsContent value="shop">
          {/* Debug Panel - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h3 className="text-yellow-300 font-semibold mb-2">🔧 Debug Panel (Development Only)</h3>
              <div className="text-xs text-yellow-200 space-y-1">
                <div>User Subscription: {user?.subscription || 'None'}</div>
                <div>CapitalKV Exclusive: {CapitalKVExclusive ? 'Yes' : 'No'}</div>
                <div>Is Admin: {user?.is_admin_user ? 'Yes' : 'No'}</div>
                <div>Current Time: {new Date().toLocaleString()}</div>
                <div>Products Loaded: {shopProducts.length}</div>
                {shopProducts.map((product, index) => (
                  <div key={product.id} className="ml-4 text-yellow-100">
                    {index + 1}. {product.name} - Status: {product.access_status || 'undefined'} 
                    {product.countdown_info?.display && ` (${product.countdown_info.display})`}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-4 sm:mb-6 flex gap-2">
            {(CapitalKVExclusive || user?.is_admin_user) && (
              <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add New Product
              </Button>
            )}
            {process.env.NODE_ENV === 'development' && (
              <Button 
                onClick={() => {
                  console.log("🔄 Manual refresh triggered");
                  fetchProducts();
                }} 
                variant="outline" 
                className="w-full sm:w-auto"
              >
                🔄 Refresh & Debug
              </Button>
            )}
          </div>

          {loadingProducts ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <span className="ml-2 text-lg text-gray-300">
                Loading products...
              </span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-3 text-center text-lg font-medium text-gray-300">
              No active products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/10 p-3 sm:p-4 rounded-2xl shadow-lg border border-white/20 hover:scale-[1.02] sm:hover:scale-[1.03] transition-transform"
                >
                  <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-4">
                    {item.image_url ? (
                      imageLoadingStates[item.id] ? (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 animate-spin" />
                        </div>
                      ) : imageErrors[item.id] ? (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                          <AppWindow className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      ) : (
                        <img
                          src={productImages[item.id]}
                          alt={item.name}
                          className="w-16 h-16 sm:w-24 sm:h-24 rounded object-cover flex-shrink-0"
                          onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                        />
                      )
                    ) : (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                        <AppWindow className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 sm:w-full">
                      <h3 className="text-sm sm:text-lg font-semibold line-clamp-2">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <div className="text-lg sm:text-xl font-bold text-white">
                      ${item.price.toFixed(2)} {item.currency.toUpperCase()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">{item.category}</div>
                    <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex flex-col gap-1">
                        {getAccessStatusBadge(item)}
                        {getCountdownDisplay(item)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCart(item.id, item.name)}
                        disabled={isAddingToCart === item.id || !canPurchaseProduct(item)}
                        className={`w-full sm:w-auto text-xs ${
                          !canPurchaseProduct(item) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isAddingToCart === item.id && (
                          <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        )}
                        {!canPurchaseProduct(item) ? (
                          <>
                            <Lock className="mr-1 h-3 w-3" />
                            {item.access_status === 'countdown' ? 'Coming Soon' : 'Unavailable'}
                          </>
                        ) : (
                          'Add to Cart'
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProduct(item);
                        setIsEditDialogOpen(true);
                      }}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Order Tracking Tab */}
        <TabsContent value="track">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Track Your Orders</h2>
            <Input
              placeholder="Enter Order ID..."
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="bg-white/5 border border-white/20 text-white placeholder-gray-300"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsAddressDialogOpen(true)}
              >
                Manage Address
              </Button>
              <Button onClick={trackOrder} disabled={trackingLoading}>
                {trackingLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Track Order
              </Button>
            </div>

            {orderStatus && (
              <div className="mt-4 bg-emerald-900/30 p-4 rounded-xl border border-emerald-400 text-white space-y-2">
                <div>
                  <strong>Status:</strong> {orderStatus.status}
                </div>
                {orderStatus.estimatedDelivery && (
                  <div>
                    <strong>Estimated Delivery:</strong>{" "}
                    {orderStatus.estimatedDelivery}
                  </div>
                )}
                <div className="text-sm text-gray-300">
                  Shipping to: {addressDetails.street}, {addressDetails.city},{" "}
                  {addressDetails.state} {addressDetails.zip}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Manage Products Tab (showing all products, including archived ones) */}
        <TabsContent value="manage">
          {loadingProducts ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-emerald-400" />
              <span className="ml-2 text-base sm:text-lg text-gray-300">
                Loading products...
              </span>
            </div>
          ) : shopProducts.length === 0 ? (
            <div className="text-center text-base sm:text-lg font-medium text-gray-300">
              No products found for management.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {shopProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/10 p-3 sm:p-4 rounded-2xl shadow-lg border border-white/20 hover:scale-[1.02] sm:hover:scale-[1.03] transition-transform"
                >
                  <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-4">
                    {item.image_url ? (
                      imageLoadingStates[item.id] ? (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 animate-spin" />
                        </div>
                      ) : imageErrors[item.id] ? (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                          <AppWindow className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      ) : (
                        <img
                          src={productImages[item.id]}
                          alt={item.name}
                          className="w-16 h-16 sm:w-24 sm:h-24 rounded object-cover flex-shrink-0"
                          onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                        />
                      )
                    ) : (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                        <AppWindow className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 sm:w-full">
                      <h3 className="text-sm sm:text-lg font-semibold line-clamp-2">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <div className="text-lg sm:text-xl font-bold text-white">
                      ${item.price.toFixed(2)} {item.currency.toUpperCase()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">{item.category}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Badge variant={item.active ? "default" : "secondary"} className="text-xs">
                          {item.active ? "Active" : "Archived"}
                        </Badge>
                        {getAccessStatusBadge(item)}
                        {getCountdownDisplay(item)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProduct(item);
                        setIsEditDialogOpen(true);
                      }}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                      disabled={!item.active}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild />
        <DialogContent className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="p-4 pb-2 border-b border-white/20 shrink-0">
              <DialogTitle className="text-lg font-semibold text-white text-center">Add New Product</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Product Name"
                    value={newItemData.name}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, name: e.target.value })
                    }
                    className="bg-white/5 border border-white/20 text-white placeholder-gray-300"
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={newItemData.price || ""}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-white/5 border border-white/20 text-white placeholder-gray-300"
                  />
                </div>
                
                <Textarea
                  placeholder="Description"
                  value={newItemData.description}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      description: e.target.value,
                    })
                  }
                  className="bg-white/5 border border-white/20 text-white placeholder-gray-300 min-h-[80px] resize-none"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={newItemData.category || ""}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        category: e.target.value,
                      })
                    }
                    className="bg-white/5 border border-white/20 text-white placeholder-gray-300 p-2 rounded text-sm"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="Beverages">Beverages</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Standard Product">Standard Product</option>
                    <option value="Limited Edition Product">Limited Edition</option>
                  </select>
                  
                  <label className="flex items-center space-x-2 text-white text-sm p-2 bg-white/5 border border-white/20 rounded">
                    <Input
                      type="checkbox"
                      checked={
                        newItemData.category === "CapitalKV Exclusive Product"
                      }
                      onChange={(e) =>
                        setNewItemData({
                          ...newItemData,
                          category: e.target.checked
                            ? "CapitalKV Exclusive Product"
                            : "",
                        })
                      }
                      className="w-4 h-4 accent-white bg-white/5 border border-white/20"
                    />
                    <span>CapitalKV Exclusive Product</span>
                  </label>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 bg-white/5 border border-white/20 rounded-md p-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload-input"
                    />
                    <Button asChild className="cursor-pointer w-full sm:w-auto">
                      <label
                        htmlFor="image-upload-input"
                        className="flex items-center justify-center gap-2 w-full text-sm"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {selectedImageFile ? "Change Image" : "Upload Image"}
                      </label>
                    </Button>
                    {selectedImageFile && (
                      <span className="text-xs text-gray-300 truncate max-w-[120px] hidden sm:block">
                        {selectedImageFile.name}
                      </span>
                    )}
                  </div>
                  {imagePreviewUrl && (
                    <div className="text-center">
                      <img
                        src={imagePreviewUrl}
                        alt="Image Preview"
                        className="max-w-full h-24 sm:h-32 object-contain mx-auto rounded-md border border-white/20"
                      />
                    </div>
                  )}
                </div>

                {/* Early Access Fields */}
                <div className="space-y-3 p-3 bg-white/5 border border-white/20 rounded-lg">
                  <h4 className="text-white font-medium text-sm flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    Early Access Settings
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white text-xs mb-1">Early Access Date</label>
                        <Input
                          type="datetime-local"
                          value={newItemData.early_access_date || ""}
                          onChange={(e) =>
                            setNewItemData({
                              ...newItemData,
                              early_access_date: e.target.value,
                            })
                          }
                          className="bg-white/5 border border-white/20 text-white text-xs"
                        />
                        <p className="text-xs text-gray-400 mt-1">When exclusive subscribers can access (1 week before general release)</p>
                      </div>
                      
                      <div>
                        <label className="block text-white text-xs mb-1">General Release Date</label>
                        <Input
                          type="datetime-local"
                          value={newItemData.release_date || ""}
                          onChange={(e) =>
                            setNewItemData({
                              ...newItemData,
                              release_date: e.target.value,
                            })
                          }
                          className="bg-white/5 border border-white/20 text-white text-xs"
                        />
                        <p className="text-xs text-gray-400 mt-1">When everyone can access</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white text-xs mb-1">Required Subscription Tier</label>
                      <select
                        value={newItemData.subscriber_tier_required || ""}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            subscriber_tier_required: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-300 p-2 rounded text-xs"
                      >
                        <option value="">No early access required</option>
                        <option value="CapitalKV+">CapitalKV+</option>
                        <option value="CapitalKV Exclusive">CapitalKV Exclusive</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Which subscription tier is required for early access</p>
                    </div>

                    {/* Early Access Preview */}
                    {newItemData.early_access_date && newItemData.release_date && (
                      <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-300">
                        <div className="font-medium mb-1">Early Access Preview:</div>
                        <div>• Exclusive subscribers: {new Date(newItemData.early_access_date).toLocaleString()}</div>
                        <div>• General release: {new Date(newItemData.release_date).toLocaleString()}</div>
                        <div>• Early access period: {Math.round((new Date(newItemData.release_date).getTime() - new Date(newItemData.early_access_date).getTime()) / (1000 * 60 * 60 * 24))} days</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Fixed at bottom */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 pt-2 border-t border-white/20 shrink-0">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedImageFile(null);
                  setImagePreviewUrl(null);
                }}
                className="w-full sm:w-auto text-sm"
              >
                Cancel
              </Button>
              <Button onClick={addNewItem} disabled={isAddingItem} className="w-full sm:w-auto text-sm">
                {isAddingItem && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) {
            setEditImageFile(null); // Reset image file on close
          }
        }}
      >
        <DialogContent className="bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="p-4 pb-2 border-b border-white/20 shrink-0">
              <DialogTitle className="text-lg font-semibold text-white text-center">Edit Product</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Product Name"
                        value={editingProduct.name}
                        readOnly
                        className="bg-black/20 border border-white/20 text-gray-400 placeholder-gray-500 cursor-not-allowed"
                      />
                      <Input
                        placeholder="Price"
                        type="number"
                        value={editingProduct.price || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="bg-white/5 border border-white/20 text-white placeholder-gray-300"
                      />
                  </div>
                  
                  <Textarea
                    placeholder="Description"
                    value={editingProduct.description || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    className="bg-white/5 border border-white/20 text-white placeholder-gray-300 min-h-[80px]"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                      value={editingProduct.category || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                      className="bg-white/5 border border-white/20 text-white placeholder-gray-300 p-2 rounded"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      <option value="Beverages">Beverages</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Standard Product">Standard Product</option>
                      <option value="Limited Edition Product">Limited Edition</option>
                    </select>
                    
                    <label className="flex items-center space-x-2 text-white text-sm">
                      <Input
                        type="checkbox"
                        checked={
                          editingProduct.category === "CapitalKV Exclusive Product"
                        }
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.checked
                              ? "CapitalKV Exclusive Product"
                              : "",
                          })
                        }
                        className="w-4 h-4 accent-white bg-white/5 border border-white/20"
                      />
                      <span>CapitalKV Exclusive Product</span>
                    </label>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 bg-white/5 border border-white/20 rounded-md p-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setEditImageFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="edit-image-upload-input"
                      />
                      <Button asChild className="cursor-pointer w-full sm:w-auto">
                        <label
                          htmlFor="edit-image-upload-input"
                          className="flex items-center justify-center gap-2 w-full"
                        >
                          <ImageIcon className="h-4 w-4" />
                          {editImageFile ? "Change Image" : "New Image"}
                        </label>
                      </Button>
                      {editImageFile && (
                        <span className="text-sm text-gray-300 truncate max-w-[150px] hidden sm:block">
                          {editImageFile.name}
                        </span>
                      )}
                    </div>

                    {/* Image Preview for Edit */}
                    <div className="text-center">
                      <img
                        src={
                          editImageFile
                            ? URL.createObjectURL(editImageFile)
                            : editingProduct.image_url || ""
                        }
                        alt="Image Preview"
                        className={`max-w-full h-32 object-contain mx-auto rounded-md border border-white/20 ${
                          editImageFile || editingProduct.image_url ? "" : "hidden"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Fixed at bottom */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 pt-2 border-t border-white/20 shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditImageFile(null);
                  }}
                  className="w-full sm:w-auto text-sm"
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateProduct} disabled={isAddingItem} className="w-full sm:w-auto text-sm">
                  {isAddingItem && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogTrigger asChild />
        <DialogContent className="bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Enter Shipping Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <Input
              placeholder="Street Address"
              value={addressDetails.street}
              onChange={(e) =>
                setAddressDetails({ ...addressDetails, street: e.target.value })
              }
              className="bg-white/5 border border-white/20 text-white placeholder-gray-300"
            />
            <Input
              placeholder="City"
              value={addressDetails.city}
              onChange={(e) =>
                setAddressDetails({ ...addressDetails, city: e.target.value })
              }
              className="bg-white/5 border border-white/20 text-white placeholder-gray-300"
            />
            <Input
              placeholder="State"
              value={addressDetails.state}
              onChange={(e) =>
                setAddressDetails({ ...addressDetails, state: e.target.value })
              }
              className="bg-white/5 border border-white/20 text-white placeholder-gray-300"
            />
            <Input
              placeholder="ZIP Code"
              value={addressDetails.zip}
              onChange={(e) =>
                setAddressDetails({ ...addressDetails, zip: e.target.value })
              }
              className="bg-white/5 border border-white/20 text-white placeholder-gray-300"
            />
            <div className="flex justify-end">
              <Button onClick={() => setIsAddressDialogOpen(false)}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Ensure dialog appears above everything */
        [data-radix-dialog-overlay] {
          z-index: 9998 !important;
          position: fixed !important;
          inset: 0 !important;
          background-color: rgba(0, 0, 0, 0.8) !important;
        }

        [data-radix-dialog-content] {
          z-index: 9999 !important;
          position: fixed !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 90vh !important;
          width: 95vw !important;
          max-width: 32rem !important;
        }

        @media (min-width: 640px) {
          [data-radix-dialog-content] {
            max-width: 56rem !important;
          }
        }

        /* Hide any potential conflicting z-index elements */
        .sidebar, .header {
          z-index: 10 !important;
        }
      `}</style>
    </div>
  );
}
