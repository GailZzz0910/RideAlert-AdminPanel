import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Menu, 
         ChevronsUpDown 
} from "lucide-react";
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

export const SuperAdminTopBar: React.FC<TopBarProps> = ({ 
  className,
  title = "Dashboard"
}) => {
  const { toggleSidebar } = useSidebarContext();
  const navigate = useNavigate();
  const { signOut, user } = useUser();

  return (
    <motion.header
      className={cn(
        "bg-sidebar px-4 py-4 border-b",
        "flex items-center justify-between shadow-sm h-[64px]",
        className
      )}
      layout
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Left side - Menu button and title */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg transition-colors cursor-pointer",
            "text-primary  xl:flex"
          )}
          variant="ghost"
          size="icon"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-primary">{title}</h1>
        </div>
      </div>

      {/* Right side - User profile and notifications */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <NotifDropdown />
        {/* Mode Toggle */}
        <ModeToggle />

        {/* User Profile */}
        <UserProfileDropdown signOut={signOut} user={user} />
      </div>
    </motion.header>
  );
};

const UserProfileDropdown: React.FC<{ signOut: () => void; user: any }> = ({ signOut, user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center pr-2 rounded-lg transition-colors cursor-pointer">
          <ChevronsUpDown className="w-5 h-5 text-primary" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <div className="font-medium text-sm text-primary">
            {user?.company_name || "Guest"}
          </div>
          <div className="text-xs text-gray-400">
            {user?.role || "Unknown"}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut() }>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
