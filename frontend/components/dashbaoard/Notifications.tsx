"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api, { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Trash2,
  MoreVertical,
  Settings,
  Filter,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  timestamp?: string;
  status?: string;
  icon?: React.ReactNode;
  created_at?: string;
};

const NotificationPopup = ({
  isOpen,
  onClose,
  notifications: initialNotifications = [],
  onNotificationUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
  onNotificationUpdate?: () => void;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (initialNotifications.length > 0) {
      setNotifications(
        initialNotifications.map((notif: Notification) => ({
          ...notif,
          status: notif.read ? "read" : "unread",
          icon: getIcon(notif.type),
          timestamp: notif.created_at ? new Date(notif.created_at).toLocaleString() : new Date().toLocaleString(),
        }))
      );
    } else {
      setNotifications([]);
    }
  }, [initialNotifications]);

  // Map notification type to icon
  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="text-yellow-500" />;
      case "success":
        return <CheckCircle2 className="text-green-500" />;
      case "system":
        return <Settings className="text-blue-500" />;
      case "message":
        return <Mail className="text-purple-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await api.delete(`${BASE_URL}/notifications/notifications/${id}`);
      if (res.status !== 204) throw new Error("Failed to delete notification");

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
      
      // Update parent component
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.post(`${BASE_URL}/notifications/notifications/mark-all-read`);
      if (res.status !== 204) throw new Error("Failed to mark all as read");

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          status: "read",
        }))
      );
      
      // Update parent component
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.status === filter);

  const getStatusBadge = (status: string) => {
    return status === "unread" ? (
      <Badge variant="secondary" className="bg-purple-800 text-white">
        New
      </Badge>
    ) : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 flex items-center justify-end z-50">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="w-full md:w-[480px] h-screen bg-background shadow-lg"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 flex justify-between items-center bg-black">
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-gray-500">
                Stay updated with your activities
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="p-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="flex gap-2">
                <TabsTrigger
                  value="all"
                  onClick={() => setFilter("all")}
                  className="flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  onClick={() => setFilter("unread")}
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Unread
                </TabsTrigger>
                <TabsTrigger
                  value="read"
                  onClick={() => setFilter("read")}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Read
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`transition-all hover:shadow-md ${
                      notification.status === "unread" ? "bg-purple-900/50" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="mt-1">{notification.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {notification.title}
                                </h3>
                                {getStatusBadge(notification.status ?? "")}
                              </div>
                              <p className="text-gray-600 text-sm mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                              {notification.timestamp}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Example usage component
const NotificationTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUser();

  // Listen for new notifications from WebSocket
  useEffect(() => {
    const handleNewNotification = () => {
      if (user?.id) {
        fetchUserNotifications();
      }
    };

    // Add event listener for new notifications
    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, [user?.id]);

  // Fetch notifications when component mounts or when opened
  useEffect(() => {
    if (user?.id) {
      fetchUserNotifications();
    }
  }, [user?.id]);

  // Also fetch when popup opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserNotifications();
    }
  }, [isOpen, user?.id]);

  const fetchUserNotifications = async () => {
    try {
      const response = await api.get(`${BASE_URL}/notifications/notifications?user_id=${user?.id}`);
      
      if (response.status === 200) {
        const data = response.data;
        setNotifications(data);
        // Count unread notifications
        const unread = data.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <NotificationPopup 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)}
            notifications={notifications}
            onNotificationUpdate={fetchUserNotifications}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationTrigger;
