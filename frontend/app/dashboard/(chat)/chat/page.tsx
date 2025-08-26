"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  MessageSquare,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  BarChart2,
  Package,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserMinus,
  Send,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useSWR from "swr";
import api, { fetcher } from "@/utils/api";
import { useGroups, useMessages } from "@/api/chat_apis";
import axios, { isAxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import ChatMessages from "./ChatMessages";
import { API_URL } from "@/utils/config";

const chatRooms = [
  {
    id: "announcements",
    name: "Announcements and Events",
    icon: Bell,
    color: "rounded-full bg-blue-100 text-blue-600",
  },
  {
    id: "insider",
    name: "Insider Business",
    icon: Users,
    color: "rounded-full bg-green-100 text-green-600",
  },
  {
    id: "market",
    name: "Market Speculations and Trends",
    icon: TrendingUp,
    color: "rounded-full bg-purple-100 text-purple-600",
  },
  {
    id: "networking",
    name: "Discussions and Networking",
    icon: MessageSquare,
    color: "rounded-full bg-yellow-100 text-yellow-600",
  },
  {
    id: "entry",
    name: "Entering/Exiting Markets",
    icon: DollarSign,
    color: "rounded-full bg-red-100 text-red-600",
  },
  {
    id: "strategy",
    name: "Strategy and Business Opportunities",
    icon: Briefcase,
    color: "rounded-full bg-indigo-100 text-indigo-600",
  },
  {
    id: "trading",
    name: "Trading Discussions",
    icon: BarChart2,
    color: "rounded-full bg-pink-100 text-pink-600",
  },
  {
    id: "products",
    name: "Real Products to Trade",
    icon: Package,
    color: "rounded-full bg-orange-100 text-orange-600",
  },
  {
    id: "irregular",
    name: "Starter Community Chat",
    icon: Paperclip,
    color: "rounded-full bg-orange-100 text-orange-600",
  },
];

export default function ChatInterface() {
  const [activeRoom, setActiveRoom] = useState("announcements");
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [groupName, setGroupName] = useState("");
  const { user } = useUser();
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [removeMember, setRemoveMember] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [membersModal, setMembersModal] = useState(false);
  const [receiptId, setReceiptId] = useState(undefined);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const messagesEndRef = useRef(null);
  const { data: users, isLoading } = useSWR("/users/all", fetcher);
  const {
    groups,
    isLoading: fetchingGroup,
    isError,
    mutateGroups,
  } = useGroups();

  const {
    messages,
    isLoading: isMessageLoading,
    isError: isMessageError,
    mutateMessages,
  } = useMessages({
    groupId: selectedGroup?.id,
    groupName: activeRoom,
    receiptId,
  });

  const scrollToBottom = () => {
    (messagesEndRef as any).current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAvatar = async (id: string) => {
    const response = await axios.get(`${API_URL}/users/me/user_image/${id}`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${Cookies.get("token")}` },
    });

    const blob = new Blob([response.data], { type: "image/jpeg" });

    return URL.createObjectURL(blob);
  };
  const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchAvatars() {
      if (users && users.length) {
        const urls: { [key: string]: string } = {};
        await Promise.all(
          users.map(async (u: any) => {
            if (u.profile_picture_url) {
              try {
                const url = await handleAvatar(u.id);
                urls[u.id] = url;
              } catch {}
            }
          })
        );
        Object.values(avatarUrls).forEach((url) => URL.revokeObjectURL(url));
        setAvatarUrls(urls);
      }
    }
    fetchAvatars();
  }, [users]);

  const handleSendMessage = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const response = await api.post(`/chats/messages`, {
        group_id: selectedGroup?.id,
        user_id: user?.id,
        group_name: activeRoom,
        receipt_id: receiptId,
        message: newMessage,
      });
      setNewMessage("");
      mutateMessages();
      return response.data;
    } catch (err) {
      console.log(err);
      if (isAxiosError(err)) {
        toast({
          title: err?.response?.data?.detail,
          variant: "destructive",
        });
      } else {
        toast({
          title: (err as Error)?.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const createGroup = async (name: string) => {
    setCreatingGroup(true);
    try {
      const response = await api.post("/chats/groups/", { name });
      setGroupOpen(false);
      toast({
        title: "Group Created",
        variant: "default",
      });
      mutateGroups();
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        toast({
          title: err?.response?.data?.detail,
          variant: "destructive",
        });
      } else {
        toast({
          title: (err as Error)?.message,
          variant: "destructive",
        });
      }
    } finally {
      setCreatingGroup(false);
    }
  };

  const uploadGroupAvatar = async (groupId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      
      const response = await api.post(`/chats/groups/${groupId}/upload-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast({
        title: "Group avatar uploaded successfully",
        variant: "default",
      });
      
      mutateGroups(); // Refresh groups list
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        toast({
          title: err?.response?.data?.detail || "Failed to upload group avatar",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to upload group avatar",
          variant: "destructive",
        });
      }
    }
  };

  const addUserToGroup = async (groupId: string, userId: string) => {
    setAddingMember(true);
    try {
      const response = await api.post(`/chats/groups/${groupId}/add_member/`, {
        user_id: userId,
        group_id: groupId,
      });
      toast({
        title: "user added to group",
        variant: "default",
      });
      setMembersModal(false);
      mutateGroups();
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        toast({
          title: err?.response?.data?.detail,
          variant: "destructive",
        });
      } else {
        toast({
          title: (err as Error)?.message,
          variant: "destructive",
        });
      }
    } finally {
      setAddingMember(false);
    }
  };

  const removeUserFromGroup = async (groupId: any, userId: any) => {
    setRemoveMember(true);
    try {
      const response = await api.post(
        `/chats/groups/${groupId}/remove_member/`,
        {
          user_id: userId,
          group_id: groupId,
        }
      );
      toast({
        title: "user removed from group",
        variant: "default",
      });
      setMembersModal(false);
      mutateGroups();
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        toast({
          title: err?.response?.data?.detail,
          variant: "destructive",
        });
      } else {
        toast({
          title: (err as Error)?.message,
          variant: "destructive",
        });
      }
    } finally {
      setRemoveMember(false);
    }
  };

  const deleteGroup = async (groupId: any) => {
    try {
      const response = await api.post(
        `/chats/groups/${groupId}/delete_group/`,
        {
          group_id: groupId,
        }
      );
      toast({
        title: "group delete successfully",
        variant: "default",
      });
      setMembersModal(false);
      mutateGroups();
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        toast({
          title: err?.response?.data?.detail,
          variant: "destructive",
        });
      } else {
        toast({
          title: (err as Error)?.message,
          variant: "destructive",
        });
      }
    }
  };

  const selectRoom = (roomId: React.SetStateAction<string>) => {
    setActiveRoom(roomId);
    setIsSidebarCollapsed(window.innerWidth < 768);
  };

  // added code
  const longPressTimerRef = useRef(null); // added code
  const [isLongPressing, setIsLongPressing] = useState(false); // added code

  // added code
  const handlePressStart = (group) => {
    // added code
    clearTimeout(longPressTimerRef.current); // added code
    longPressTimerRef.current = setTimeout(() => { // added code
      setIsLongPressing(true); // added code
      setSelectedGroup(group); // added code
      setMembersModal(true); // added code
    }, 500); // added code
  };

  // added code
  const handlePressEnd = (group) => {
    // added code
    clearTimeout(longPressTimerRef.current); // added code

    // added code
    if (isLongPressing) { // added code
      setIsLongPressing(false); // added code
      return; // added code
    }

    // added code
    setReceiptId(undefined); // added code
    setActiveRoom(""); // added code
    setSelectedGroup(group); // added code
  };

  // added code
  const handlePressCancel = () => {
    // added code
    clearTimeout(longPressTimerRef.current); // added code
    setIsLongPressing(false); // added code
  };

  return (
    <div className="flex h-[calc(90vh-0.5rem)] md:h-[calc(90vh-1rem)] rounded-lg relative felx overflow-hidden">
      {/* Collapsible Sidebar */}
      <div
        className={`bg-purple-900 rounded-lg ml-1 text-white h-full flex flex-col shadow-lg transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        } absolute md:relative z-50`}
      >
        <div className="  p-4 flex justify-between items-center">
          {!isSidebarCollapsed && (
            <h1 className="text-2xl font-bold text-white">CapitalKV+</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="h-[calc(90vh-5rem)]">
          <nav className="mt-4">
            {chatRooms.map((room) => (
              <TooltipProvider key={room.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setSelectedGroup(null);
                        setReceiptId(undefined);
                        selectRoom(room.id);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-left ${
                        activeRoom === room.id ? "bg-gray-100/10" : ""
                      }`}
                    >
                      <room.icon className={`p-1 h-8 w-8 ${room.color}`} />
                      {!isSidebarCollapsed && (
                        <span className="ml-2 text-sm text-white font-thin">
                          {room.name}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{room.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>

          {/* User List */}
          <div className="mt-8 px-4">
            {!isSidebarCollapsed && (
              <h2 className="text-lg font-semibold mb-2">Users</h2>
            )}
            {users
              ?.filter((cur: any) => cur.id !== user.id)
              ?.map((user: any) => (
                <div
                  onClick={() => {
                    setActiveRoom("");
                    setSelectedGroup(null);
                    setReceiptId(user.id);
                  }}
                  key={user.id}
                  className={`flex overflow-hidden items-center p-1 px-2 rounded-lg mb-2 cursor-pointer
                    ${receiptId === user.id ? "bg-gray-100/10" : ""}`}
                >
                  <Avatar className="h-8 w-8 mr-2">
                    {user?.profile_picture_url ? (
                      <AvatarImage src={avatarUrls[user.id]} alt={user?.name} />
                    ) : (
                      <>
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.username}`}
                        />
                        <AvatarFallback>
                          {user?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="text-sm">{user?.username}</span>
                      <Badge
                        variant={
                          user.status === "online" ? "default" : "secondary"
                        }
                        className="ml-2"
                      >
                        {user.status}
                      </Badge>
                    </>
                  )}
                </div>
              ))}
          </div>

          {/* Groups */}
          <div className="mt-8 px-4">
            {!isSidebarCollapsed && (
              <>
                <h2 className="text-lg font-semibold mb-2">Groups</h2>
                <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mb-2">Create Group</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Group</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Group Name"
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                    <Button onClick={() => createGroup(groupName)}>
                      Create
                    </Button>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {groups?.map((group: any) => (
              <div key={group.id} className="mb-2">
                <Button
                  variant="outline"
                  className={`w-full overflow-hidden justify-start p-2 ${
                    selectedGroup?.id === group?.id ? "bg-gray-100/10" : ""
                  }`}
                  // added code
                  onMouseDown={() => handlePressStart(group)} // added code
                  onMouseUp={() => handlePressEnd(group)} // added code
                  onMouseLeave={handlePressCancel} // added code
                  // added code
                  onTouchStart={() => handlePressStart(group)} // added code
                  onTouchEnd={() => handlePressEnd(group)} // added code
                  onTouchCancel={handlePressCancel} // added code
                >
                  {group.group_avatar_url ? (
                    <Avatar className="mr-2 h-4 w-4">
                      <AvatarImage 
                        src={group.group_avatar_url} 
                        alt={group.name}
                      />
                      <AvatarFallback>
                        <Users className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  {!isSidebarCollapsed && group.name}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-16">
        {/* Chat Area */}
        <ChatMessages
          groupName={activeRoom}
          messages={messages}
          users={users}
          avatarUrls={avatarUrls}
          messagesEndRef={messagesEndRef}
        />

        {/* Group Management Dialog */}
        {membersModal && (
          <Dialog
            open={!!membersModal}
            onOpenChange={() => setMembersModal(false)}
          >
            <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-lg md:text-xl">
                  Manage Group: {selectedGroup.name}
                </DialogTitle>
                
                {/* Group Avatar Upload Section */}
                {selectedGroup.created_by === user.id && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium">Group Avatar</h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        {selectedGroup.group_avatar_url ? (
                          <AvatarImage 
                            src={selectedGroup.group_avatar_url} 
                            alt={selectedGroup.name}
                          />
                        ) : (
                          <AvatarFallback>
                            <Users className="h-8 w-8" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 w-full">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadGroupAvatar(selectedGroup.id, file);
                            }
                          }}
                          className="mb-2 w-full"
                        />
                        <p className="text-xs text-gray-500">Upload a group profile picture (PNG, JPG, max 5MB)</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t">
                  {selectedGroup.created_by === user.id && (
                    <Button
                      onClick={() => {
                        deleteGroup(selectedGroup.id);
                      }}
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      Delete Group
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      removeUserFromGroup(selectedGroup.id, user.id);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Leave Group
                  </Button>
                </div>
              </DialogHeader>
              
              {/* Scrollable Content Area */}
              <ScrollArea className="flex-1 overflow-y-auto pr-4">
                <div className="space-y-6 py-4">
                  {/* Current Members Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Current Members</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedGroup?.members?.map(
                        (member: number, index: number) => {
                          const memberData = users.find(
                            (cur: any) => cur.id === member
                          );
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {avatarUrls[memberData?.id] ? (
                                    <AvatarImage src={avatarUrls[memberData.id]} alt={memberData?.username} />
                                  ) : (
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      {memberData?.username?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="font-medium text-gray-900">{memberData?.username}</span>
                                {selectedGroup.created_by === memberData?.id && (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Creator</Badge>
                                )}
                              </div>
                              {selectedGroup.created_by === user.id && memberData?.id !== user.id && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    removeUserFromGroup(
                                      selectedGroup.id,
                                      memberData.id
                                    )
                                  }
                                >
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Remove</span>
                                </Button>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                  
                  {/* Add Members Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Add Members</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {users
                        .filter(
                          (user: { id: any }) =>
                            !selectedGroup.members.some(
                              (member: any) => member === user.id
                            )
                        )
                        .map(
                          (user: {
                            id: string;
                            first_name: string;
                            last_name: string;
                            username: string;
                          }) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {avatarUrls[user.id] ? (
                                    <AvatarImage src={avatarUrls[user.id]} alt={user?.username} />
                                  ) : (
                                    <AvatarFallback className="bg-green-100 text-green-600">
                                      {user?.username?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="font-medium text-gray-900">
                                  {(() => {
                                    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
                                    return fullName || user?.username || 'Unknown User';
                                  })()}
                                </span>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  addUserToGroup(selectedGroup.id, user?.id)
                                }
                                className="bg-green-600 hover:bg-green-700 text-white border-0"
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Add</span>
                              </Button>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}

        {/* Message Input */}
        <div className="bottom-0 p-4 border-t w-full">
          <form onSubmit={handleSendMessage} className=" items-center ">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder={
                  activeRoom === "announcements"
                    ? "You can't send messages in this room"
                    : "Type your message..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="mr-2"
                disabled={
                  activeRoom === "announcements" && !user?.is_admin_user
                }
              />
              <Button
                type="submit"
                disabled={
                  activeRoom === "announcements" && !user?.is_admin_user
                }
              >
                <Send className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
