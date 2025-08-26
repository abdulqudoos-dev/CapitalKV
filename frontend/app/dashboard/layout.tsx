"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  LifeBuoy,
  LogOut,
  PieChart,
  SquareTerminal,
  Share2,
  Users,
  Award,
  Puzzle,
  House,
  Settings2,
  Workflow,
  Zap,
  ShieldCheck,
  Wallet,
  Bell,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import DashLogo from "@/public/capitalkvAILogo.png";
import NotificationTrigger from "@/components/dashbaoard/Notifications";
import { CartSheet } from "@/components/CartSheet";
import { GamificationPopup } from "@/components/dashbaoard/Achivements";
import AuthContext from "@/contexts/AuthContext";
import { useUser } from "@/hooks/use-user";
import { usePayment } from "@/hooks/use-payment";
import { API_URL } from "@/utils/config";
import axios from "axios";
import Cookies from "js-cookie";
import NotificationSocket from "../notificationSocket/notificationSocket";
import { ToastProvider } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export default function Component({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useContext(AuthContext);
  const { user, loading } = useUser();

  const { subscriptions } = usePayment();
  const subscriptionsIds = subscriptions?.map((sub: any) => sub.plan_id);

  const isChatSubscrition = subscriptionsIds?.includes("prod_Rdm3KZLrcc1ees");

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
    async function fetchAvatar() {
      if (user && user.profile_picture_url) {
        try {
          const url = await handleAvatar(user.id);
          Object.values(avatarUrls).forEach((oldUrl) =>
            URL.revokeObjectURL(oldUrl)
          );

          setAvatarUrls({ [user.id]: url });
        } catch (err) {
          console.error(`Failed to load avatar for user ${user.id}`, err);
        }
      }
    }

    fetchAvatar();
  }, [user]);

  const [notification, setNotification] = useState<any>(null);
  const { toast } = useToast();

  // Optionally, show a toast when a new notification arrives
  useEffect(() => {
    console.log("Notification received:", notification);
    if (notification) {
      toast({
        title: notification.title || "New Notification",
        description: notification.message || JSON.stringify(notification),
        variant: "default",
      });
      
      // Dispatch custom event to update notification count
      window.dispatchEvent(new CustomEvent('new-notification'));
    }
  }, [notification, toast]);

  type NavItem = {
    title: string;
    url: string;
    icon: React.ComponentType<any>;
    isAdmin?: boolean;
    items?: Array<{
      title: string;
      url: string;
      icon: React.ComponentType<any>;
    }>;
  };

  const data: {
    navMain: NavItem[];
    navSecondary: NavItem[];
  } = {
    navMain: [
      {
        title: "Home",
        url: "/dashboard/home",
        icon: House,
      },
      {
        title: "Dashboard",
        url: "/dashboard/main",
        icon: SquareTerminal,
        isAdmin: user?.is_admin_user, // Admin-only access
      },
      {
        title: "Notifications",
        url: "/dashboard/notifications",
        icon: Bell,
        isAdmin: user?.is_admin_user, // Admin-only access
      },
      {
        title: "Shop",
        url: "/dashboard/shop",
        icon: Zap,
      },
      {
        title: "CapitalKV+",
        url: "/dashboard/chat",
        icon: Bot,
      },
      {
        title: "Funds", //keep
        url: "/dashboard/funds",
        icon: PieChart,
      },
    ],
    navSecondary: [
      {
        title: "24/7 Support", //keep
        url: "/dashboard/support",
        icon: LifeBuoy,
      },
      {
        title: "Loyalty Centre", //update gamification
        url: "/dashboard/gamification",
        icon: Award,
      },
      {
        title: "Affiliate Program", //keep and adjust accordingly
        url: "/dashboard/affiliate",
        icon: Users,
      },
    ],
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar variant={isSidebarOpen ? "inset" : undefined}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href="/dashboard/home"
                className="flex items-center space-x-2 mb-3"
              >
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image src={DashLogo} className="size-8" alt="logo" />
                </div>
                <div className="flex-1 text-left text-lg leading-tight">
                  <span>CapitalKV</span>
                </div>
              </Link>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard/profile" onClick={handleSidebarToggle}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-purple-200">
                    <Avatar className="h-8 w-8 rounded-full">
                      {user?.profile_picture_url ? (
                        <AvatarImage
                          src={avatarUrls[user?.id] || ""}
                          alt={user?.name}
                        />
                      ) : (
                        <AvatarFallback className="rounded-full">
                          {user?.first_name && user?.last_name
                            ? `${user.first_name[0]}${user.last_name[0]}`
                            : "AI"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.company ||
                        (user?.first_name || "") +
                          " " +
                          (user?.last_name || "")}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain
                .filter((item) => !item.isAdmin || (item.isAdmin && user?.is_admin_user))
                .map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <Collapsible key={item.title} asChild defaultOpen={isActive}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          className={`relative ${
                            isActive
                              ? 'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-md before:bg-purple-500 before:content-[""]'
                              : ""
                          }`}
                        >
                          <Link
                            href={item.url}
                            className={isActive ? "bg-white" : ""}
                          >
                            <item.icon
                              className={isActive ? "text-purple-500" : ""}
                            />
                            <span
                              className={
                                isActive ? "font-semibold text-purple-500" : ""
                              }
                            >
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                        {item.items?.length ? (
                          <>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuAction className="data-[state=open]:rotate-90">
                                <ChevronRight />
                                <span className="sr-only">Toggle</span>
                              </SidebarMenuAction>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.items?.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild>
                                      <Link href={subItem.url}>
                                        <subItem.icon />
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </>
                        ) : null}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size="sm">
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.username}
                      </span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-none bg-neutral-900"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.first_name + " " + user?.last_name}
                        </span>
                        <span className="truncate text-xs">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup></DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Link href="/dashboard/profile" className="flex">
                        {" "}
                        <BadgeCheck className="mr-1" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard/subscription" className="flex">
                        {" "}
                        <CreditCard className="mr-1" /> Subscriptions
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link
                      href="#"
                      className="flex"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent the default navigation behavior
                        logout(); // Call the logout function
                      }}
                    >
                      <LogOut className="mr-1" />
                      Log out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-gradient-to-br from-purple-500/40 via-black to-purple-600/40 w-full">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-4">
            <NotificationSocket
              onNotification={(notification) => {
                setNotification(notification);
                toast({
                  title: notification.title || "New Notification",
                  description:
                    notification.message || JSON.stringify(notification),
                  variant: "default",
                });
              }}
            />
            <NotificationTrigger />
            <CartSheet />
          </div>
        </header>

        <main className="flex-grow max-w-full"> {children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
