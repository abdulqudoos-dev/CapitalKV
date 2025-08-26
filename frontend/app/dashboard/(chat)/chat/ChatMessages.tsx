import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AlertCircle } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";

type ChatMessagesProps = {
  groupName?: string;
  messagesEndRef: any;
  messages?: any[];
  users?: any[];
  avatarUrls?: { [key: string]: string }; // Add avatarUrls prop
};

const ChatMessages = ({
  groupName,
  messagesEndRef,
  messages,
  users,
  avatarUrls = {},
}: ChatMessagesProps) => {
  return (
    <ScrollArea className="flex-1 px-4 h-[100%-4rem)] overflow-y-auto">
      {groupName === "announcements" && (
        <Alert className="mb-4 bg-red-400 border-none">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Announcements Room</AlertTitle>
          <AlertDescription>
            This room is for announcements only. Regular users cannot send
            messages here.
          </AlertDescription>
        </Alert>
      )}
      <AnimatePresence>
        {messages?.map((msg: any) => {
          const user = users?.find((cur) => cur.id == msg.user_id);
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start mb-4 ${
                msg.isAdmin ? "bg-blue-400 p-2 rounded" : ""
              }`}
            >
              <Avatar className="mr-2 h-8 w-8 rounded-full">
                {avatarUrls[user?.id] ? (
                  <AvatarImage src={avatarUrls[user.id]} alt={user?.username} 
                  className="rounded-full"
                  />
                ) : (
                  <>
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.username}`}
                      className="rounded-full"
                    />
                    <AvatarFallback>
                      {user?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div>
                <p className="font-semibold">
                  {(user?.first_name || "") + " " + (user?.last_name || "")}{" "}
                  {msg?.isAdmin && <Badge variant="outline">Admin</Badge>}
                </p>
                <p>{msg?.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg?.created_at).toLocaleString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default ChatMessages;
// ...existing code...
