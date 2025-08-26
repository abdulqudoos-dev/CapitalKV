"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import {
  Bell,
  Send,
  Users,
  Target,
  Globe,
  AlertCircle,
  CheckCircle2,
  Settings,
  Star,
  ShoppingCart,
  MessageSquare,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Download,
  Upload,
  Plus,
  Minus,
} from "lucide-react";
import api, { BASE_URL } from "@/utils/api";

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  is_active: boolean;
}

interface NotificationHistory {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

const notificationTypes = [
  { value: "system", label: "System", icon: Settings, color: "bg-blue-500" },
  { value: "order", label: "Order", icon: ShoppingCart, color: "bg-green-500" },
  { value: "subscription", label: "Subscription", icon: Star, color: "bg-purple-500" },
  { value: "promotion", label: "Promotion", icon: Bell, color: "bg-orange-500" },
  { value: "other", label: "Other", icon: MessageSquare, color: "bg-gray-500" },
];

export default function AdminNotificationsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "system",
    sendToAll: true,
  });

  const { toast } = useToast();

  // Check if user is admin
  useEffect(() => {
    if (!userLoading && (!user || !user.is_admin_user)) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page",
        variant: "destructive",
      });
      router.push("/dashboard/home");
      return;
    }
  }, [user, loading, router, toast]);

  // Fetch users and notification history
  useEffect(() => {
    if (user?.is_admin_user) {
      fetchUsers();
      fetchNotificationHistory();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`${BASE_URL}/notifications/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const fetchNotificationHistory = async () => {
    try {
      const response = await api.get(`${BASE_URL}/notifications/admin/notifications`);
      setNotificationHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch notification history:", error);
      toast({
        title: "Error",
        description: "Failed to load notification history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sendToAll && selectedUsers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one user or choose 'Send to All'",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        user_ids: formData.sendToAll ? undefined : selectedUsers,
      };

      const response = await api.post(`${BASE_URL}/notifications/admin/send`, payload);
      
      toast({
        title: "Success",
        description: `Successfully sent ${response.data.sent_count} notifications`,
        variant: "default",
      });

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "system",
        sendToAll: true,
      });
      setSelectedUsers([]);
      setSelectAll(false);

      // Refresh notification history
      fetchNotificationHistory();
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
      setSelectAll(true);
    } else {
      setSelectedUsers([]);
      setSelectAll(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Settings;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Show loading or access denied
  // Show loading or access denied
  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user?.is_admin_user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Notification Management</h1>
          <p className="text-gray-400 mt-2">
            Send notifications to users and manage notification history
          </p>
        </div>
        <Button
          onClick={fetchNotificationHistory}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </motion.div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Notifications
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Notification History
          </TabsTrigger>
        </TabsList>

        {/* Send Notifications Tab */}
        <TabsContent value="send" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-transparent border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Compose Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-transparent border-gray-600"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter notification message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="min-h-[120px] bg-transparent border-gray-600"
                  />
                </div>

                {/* Recipients */}
                <div className="space-y-4">
                  <Label>Recipients</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendToAll"
                      checked={formData.sendToAll}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({ ...prev, sendToAll: !!checked }));
                        if (checked) {
                          setSelectedUsers([]);
                          setSelectAll(false);
                        }
                      }}
                    />
                    <Label htmlFor="sendToAll" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Send to all users
                    </Label>
                  </div>

                  {!formData.sendToAll && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                          />
                          <Label>Select all users</Label>
                        </div>
                        <Badge variant="secondary">
                          {selectedUsers.length} selected
                        </Badge>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-transparent border-gray-600"
                        />
                      </div>

                      {/* User List */}
                      <ScrollArea className="h-[300px] border rounded-md p-4">
                        <div className="space-y-2">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-800/50"
                            >
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={(checked) => handleUserSelection(user.id, !!checked)}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-white">
                                  {user.name || user.username}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {user.email}
                                </div>
                              </div>
                              <Badge variant={user.is_active ? "default" : "secondary"}>
                                {user.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendNotification}
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notification History Tab */}
        <TabsContent value="history" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-transparent border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Notification History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {notificationHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white">No notifications sent yet</h3>
                        <p className="text-gray-400">Start sending notifications to see them here</p>
                      </div>
                    ) : (
                      notificationHistory.map((notification) => {
                        const TypeIcon = getTypeIcon(notification.type);
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800/30 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                                  <TypeIcon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-white">{notification.title}</h3>
                                    <Badge variant={notification.read ? "secondary" : "default"}>
                                      {notification.read ? "Read" : "Unread"}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-300 mb-2">{notification.message}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span>Type: {notification.type}</span>
                                    <span>User ID: {notification.user_id}</span>
                                    <span>Sent: {formatDate(notification.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
