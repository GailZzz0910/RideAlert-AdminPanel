import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import { useSidebarContext } from "./side-bar";
import { ModeToggle } from "../mode-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import NotifDropdown from "../notif-dialog";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";

interface TopBarProps {
  className?: string;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  className,
  title = "Dashboard"
}) => {
  const { toggleSidebar } = useSidebarContext();
  const navigate = useNavigate();
  const { signOut, user } = useUser();

  return (
    <motion.header
      className={cn(
        "bg-sidebar px-6 py-4 border-b border-sidebar-border backdrop-blur-sm",
        "flex items-center justify-between shadow-sm h-[64px] relative z-10",
        className
      )}
      layout
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Left side - Menu button and title */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-sm",
            "text-sidebar-foreground hover:bg-sidebar-accent xl:flex"
          )}
          variant="ghost"
          size="icon"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-sidebar-foreground tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right side - User profile and notifications */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <div className="hover:scale-105 transition-transform duration-200">
          <NotifDropdown />
        </div>
        
        {/* Mode Toggle */}
        <div className="hover:scale-105 transition-transform duration-200">
          <ModeToggle />
        </div>

        {/* User Profile */}
        <UserProfileDropdown signOut={signOut} user={user} />
      </div>
    </motion.header>
  );
};

const UserProfileDropdown: React.FC<{ signOut: () => void; user: any }> = ({ signOut, user }) => {
  const isSuperAdmin = user?.role === "super-admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center p-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-sidebar-accent hover:scale-105 hover:shadow-sm">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.company_name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 shadow-lg border-0 bg-background/95 backdrop-blur-sm">
        <div className="px-4 py-3 border-b border-border/50">
          <div className="font-medium text-sm text-foreground">
            {user?.company_name || 'Fleet Manager'}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user?.email || 'Please sign in again to see email'}
          </div>
          {isSuperAdmin && (
            <div className="text-xs text-primary font-medium mt-1">
              Super Administrator
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut()} 
          className="bg-red-500 hover:bg-red-600 text-white focus:bg-red-600 focus:text-white cursor-pointer mx-2 my-1 rounded-md"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
