// Dashboard.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import api, { BASE_URL } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

// Define your API base URL
const API_BASE_URL = BASE_URL; // CRITICAL: Ensure this matches your backend URL

// Updated interfaces to match backend models
interface User {
  id: string; // Assuming user IDs are strings (e.g., MongoDB ObjectId as string)
  email: string; // Assuming email is available
  first_name?: string | "";
  last_name?: string | ""; // Optional name field
  subscription: string; // This might be derived from backend data or managed separately
  lastLogin?: string; // Optional last login date
  is_active: boolean; // User account status
  role?: string; // Added role for potential admin checks
}

interface Product {
  id: string; // Matches Stripe Product ID from backend
  name: string;
  active: boolean;
  price: number;
  currency: string; // Added currency
  description?: string; // Added description
  image_url?: string; // Added image_url
  in_stock?: number; // Matches 'in_stock' from backend
}

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  image_url?: string;
}

interface Order {
  id: string; // MongoDB Order ID
  user_id: string; // ID of the user who placed the order
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status:
    | "pending"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "failed"; // Lowercase to match backend
  created_at: string; // ISO string date
  updated_at: string; // ISO string date
  shipping_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  }; // Expanded for delivery
  tracking_number?: string; // Added for delivery management
}

interface Chat {
  user: string;
  message: string;
  timestamp: string;
  flagged: boolean;
}

const mockChats: Chat[] = [
  {
    user: "User A",
    message: "What is my subscription status?",
    timestamp: "2025-03-05 10:00 AM",
    flagged: false,
  },
  {
    user: "User B",
    message: "Why was my app not approved?",
    timestamp: "2025-03-05 10:15 AM",
    flagged: true,
  },
];

const AnalyticsOverview: React.FC<{ users: User[]; orders: Order[] }> = ({
  users,
  orders,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-transparent border shadow-sm mt-3 w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Analytics Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border p-4">
            <h4 className="text-lg font-semibold">Total Users</h4>
            <p className="text-2xl">{users.length}</p>
          </Card>
          <Card className="border p-4">
            <h4 className="text-lg font-semibold">Active Subscriptions</h4>
            <p className="text-2xl">
              {
                users.filter(
                  (u) =>
                    u.subscription === "Active" ||
                    u.subscription.includes("CapitalKV+")
                ).length
              }
            </p>
          </Card>
          <Card className="border p-4">
            <h4 className="text-lg font-semibold">Total Orders</h4>
            <p className="text-2xl">{orders.length}</p>
          </Card>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const AccountManagement: React.FC<{
  users: User[];
  onToggleUserActive: (id: string) => void;
}> = ({ users, onToggleUserActive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-transparent border shadow-sm mt-3 w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Account Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">User Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Subscription</th>
                <th className="p-2 text-left">Last Login</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`
        transition-all duration-200
        hover:bg-blue-100 dark:hover:bg-blue-900/60
        hover:shadow-lg
        hover:text-blue-900 dark:hover:text-white
        cursor-pointer
      `}
                  style={{
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                  }}
                >
                  <td className="p-2">
                    {user.first_name || user.last_name
                      ? `${user.first_name || ""} ${
                          user.last_name || ""
                        }`.trim()
                      : "N/A"}
                  </td>

                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.subscription}</td>
                  <td className="p-2">{user.lastLogin || "N/A"}</td>
                  <td className="p-2">
                    {user.is_active == true ? "Active" : "Terminated"}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => onToggleUserActive(user.id)}
                      className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                    >
                      {user.is_active ? "Terminate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const SubscriptionManagement: React.FC<{
  users: User[];
  onAssignSubscription: (id: string, newSub: string) => void;
}> = ({ users, onAssignSubscription }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newSubscription, setNewSubscription] = useState<string>(
    "Active All Subscription"
  );

  const handleAssign = () => {
    if (selectedUser !== null) {
      onAssignSubscription(selectedUser, newSubscription);
      setSelectedUser(null); // Reset selection
      setNewSubscription("Active All Subscription"); // Reset subscription selection
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-transparent border shadow-sm mt-3 w-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3 max-w-sm">
            <select
              value={selectedUser ?? ""}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="rounded border px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition-all"
              style={{ minWidth: 180 }}
            >
              <option value="" disabled>
                Select User
              </option>
              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {!user.first_name && !user.last_name
                    ? user.email
                    : `${user.first_name || ""} ${user.last_name || ""}`.trim()}
                </option>
              ))}
            </select>
            <select
              value={newSubscription}
              onChange={(e) => setNewSubscription(e.target.value)}
              className="rounded border px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition-all"
            >
              {[
                "Active All Subscription",
                "Expired All Subscription",
                "Cancelled All Subscription",
                "Active CapitalKV+",
                "Active CapitalKV Exclusive",
                "Expired CapitalKV+",
                "Expired CapitalKV Exclusive",
                "Cancelled CapitalKV+",
                "Cancelled CapitalKV Exclusive",
              ].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={selectedUser === null}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Assign Subscription
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductOrderManagement: React.FC<{
  products: Product[];
  orders: Order[];
  onToggleProductActive: (id: string, currentStatus: boolean) => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
}> = ({ products, orders, onToggleProductActive, onUpdateOrderStatus }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-transparent border shadow-sm mt-3 w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Product & Order Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 text-lg font-semibold">Products</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Stock</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr
                  key={prod.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="p-2">{prod.name}</td>
                  <td className="p-2">{prod.active ? "Yes" : "No"}</td>
                  <td className="p-2">
                    ${prod.price.toFixed(2)} {prod.currency.toUpperCase()}
                  </td>
                  <td className="p-2">
                    {prod.in_stock !== undefined ? prod.in_stock : "N/A"}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() =>
                        onToggleProductActive(prod.id, prod.active)
                      }
                      className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700"
                    >
                      {prod.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-lg font-semibold">Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2 text-left">User ID</th>
                <th className="p-2 text-left">Items</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Created At</th>
                <th className="p-2 text-left">Tracking No.</th>
                <th className="p-2 text-left">Shipping Address</th>
                <th className="p-2 text-left">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="p-2">{order.id}</td>
                  <td className="p-2">{order.user_id}</td>
                  <td className="p-2">
                    {order.items.map((item) => (
                      <div key={item.product_id}>
                        {item.name} (x{item.quantity})
                      </div>
                    ))}
                  </td>
                  <td className="p-2">
                    ${order.total_amount.toFixed(2)}{" "}
                    {order.currency.toUpperCase()}
                  </td>
                  <td className="p-2">{order.status}</td>
                  <td className="p-2">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2">{order.tracking_number || "N/A"}</td>
                  <td className="p-2">
                    {order.shipping_address ? (
                      <div>
                        {order.shipping_address.line1}
                        <br />
                        {order.shipping_address.city},{" "}
                        {order.shipping_address.state}{" "}
                        {order.shipping_address.postal_code}
                        <br />
                        {order.shipping_address.country}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        onUpdateOrderStatus(
                          order.id,
                          e.target.value as Order["status"]
                        )
                      }
                      className="rounded border px-2 py-1"
                    >
                      {[
                        "pending",
                        "paid",
                        "shipped",
                        "delivered",
                        "cancelled",
                        "refunded",
                        "failed",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ChatMessages: React.FC<{
  chats: Chat[];
  onFlagChat: (index: number) => void;
}> = ({ chats, onFlagChat }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-transparent border shadow-sm mt-3 w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64 rounded-md border overflow-y-auto">
          <ul className="space-y-3">
            {chats.map((chat, i) => (
              <li
                key={i}
                className={`p-3 rounded border ${
                  chat.flagged
                    ? "border-red-600 bg-red-100 dark:bg-red-800"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <p>
                  <strong>{chat.user}:</strong> {chat.message}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {chat.timestamp}
                </p>
                {chat.flagged ? (
                  <p className="text-sm text-red-600 font-semibold">
                    Flagged Message
                  </p>
                ) : (
                  <button
                    onClick={() => onFlagChat(i)}
                    className="mt-2 rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
                  >
                    Flag Message
                  </button>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`${API_BASE_URL}/users/me/allUsers`);
        const data: User[] = response.data;
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecommerce/shop/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products.");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      console.log(API_BASE_URL);
      const response = await api.get(`${API_BASE_URL}/ecommerce/orders`);
      const data: Order[] = response.data;
      // Parse dates for consistency if needed, though Pydantic should handle ISO strings
      setOrders(
        data.map((order) => ({
          ...order,
          created_at: new Date(order.created_at).toISOString(),
          updated_at: new Date(order.updated_at).toISOString(),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders.");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchProducts(), fetchOrders()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProducts, fetchOrders]);

  const toggleUserActive = (id: string) => {
    const updatedUser = users.find((user) => user.id === id);
    if (!updatedUser) return;

    const newIsActive = !updatedUser.is_active;
    const newSub = newIsActive
      ? "Active All Subscription"
      : "Expired All Subscription";

    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              is_active: newIsActive,
              subscription: newSub,
            }
          : user
      )
    );

    api
      .put(`${API_BASE_URL}/users/me/updateStatus/${id}`, {
        is_active: newIsActive,
        subscription: newSub,
      })
      .then(() => {
        toast({
          title: "User Status Updated",
          description: `User ${id} is now ${
            newIsActive ? "active" : "inactive"
          }`,
          variant: "default",
        });
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: `Failed to update status for user ${id}: ${err.message}`,
          variant: "destructive",
        });
      });
  };

  const { toast } = useToast();

  const assignSubscription = (id: string, newSub: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, subscription: newSub } : user
      )
    );
    // In a real app, you would make an API call here to assign subscription
    api
      .put(`${API_BASE_URL}/users/me/updateSubscription/${id}`, {
        subscription: newSub,
      })
      .then(() => {
        toast({
          title: "Subscription Updated",
          description: `User subscription updated to ${newSub}`,
          variant: "default",
        });
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: `Failed to update subscription for user : ${err.message}`,
          variant: "destructive",
        });
      });
  };

  const toggleProductActive = async (id: string, currentStatus: boolean) => {
    try {
      // The backend /admin/products/{product_id} DELETE endpoint sets active=False
      // So, if we want to "activate" (set active=True), we might need a separate PUT endpoint
      // For now, this will only "deactivate" a product.
      // If `currentStatus` is true (product is active), we call DELETE to deactivate.
      // If `currentStatus` is false (product is inactive), there's no direct "activate" endpoint.
      // A more robust backend would have PUT /admin/products/{product_id} with an 'active' field.

      if (currentStatus) {
        // Product is currently active, so we want to deactivate it
        const response = await fetch(
          `${API_BASE_URL}/ecommerce/admin/products/${id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert("Product deactivated successfully!");
      } else {
        // Handle activation: You'd need a PUT endpoint that can set `active: true`
        // For example: PUT /ecommerce/admin/products/{id} with body { "active": true }
        alert(
          "Product activation is not directly supported by current DELETE endpoint. Please use PUT /admin/products/{id} on backend if available."
        );
        console.warn(
          "Product activation not implemented via API, needs a PUT endpoint."
        );
      }
      fetchProducts(); // Re-fetch products to reflect changes
    } catch (err) {
      console.error(`Failed to toggle product ${id} active status:`, err);
      alert(`Error toggling product status: ${error}`);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ecommerce/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      alert(`Order ${orderId} status updated to ${status}!`);
      fetchOrders(); // Re-fetch orders to reflect changes
    } catch (err) {
      console.error(`Failed to update order ${orderId} status:`, err);
      setError(
        `Error updating order status: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      alert(
        `Error updating order status: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const flagChat = (index: number) => {
    setChats((prev) =>
      prev.map((chat, i) => (i === index ? { ...chat, flagged: true } : chat))
    );
  };

  if (loading)
    return (
      <div className="p-4 max-w-6xl mx-auto text-center">
        Loading dashboard data...
      </div>
    );
  if (error)
    return (
      <div className="p-4 max-w-6xl mx-auto text-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <main className="p-4 max-w-6xl mx-auto space-y-8">
      <AnalyticsOverview users={users} orders={orders} />
      <AccountManagement users={users} onToggleUserActive={toggleUserActive} />
      <SubscriptionManagement
        users={users}
        onAssignSubscription={assignSubscription}
      />
      <ProductOrderManagement
        products={products}
        orders={orders}
        onToggleProductActive={toggleProductActive}
        onUpdateOrderStatus={updateOrderStatus}
      />
      <ChatMessages chats={chats} onFlagChat={flagChat} />
    </main>
  );
}
