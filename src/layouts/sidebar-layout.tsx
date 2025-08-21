import { Outlet, useLocation } from "react-router-dom";
import React from "react";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavItem,
  SidebarGroup,
  useSidebarContext,
} from "../components/ui/side-bar";
import { TopBar } from "../components/ui/top-bar";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layers, 
  Plus, 
  Car, 
  Settings,
} from "lucide-react";

// Memoized Logo component to prevent unnecessary re-renders
const Logo = React.memo(() => {
  const { isOpen, isMobile } = useSidebarContext();
  const showFullLogo = isOpen || isMobile;
  
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
        <Car className="w-5 h-5 text-white" />
      </div>
      <AnimatePresence>
        {showFullLogo && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col overflow-hidden"
          >
            <span className="font-bold text-sidebar-foreground whitespace-nowrap">Ride Alert</span>
            <span className="text-xs text-gray-400 whitespace-nowrap">Vehicle Management</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Memoized navigation links to prevent re-computation
const useNavigationLinks = () => {
  const location = useLocation();
  
  return React.useMemo(() => {
    const mainNavLinks = [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <Layers className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/dashboard",
      },
      {
        label: "Add Vehicle",
        href: "/dashboard/add-vehicle",
        icon: <Plus className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/dashboard/add-vehicle",
      },
      {
        label: "Vehicle Management",
        href: "/dashboard/vehicle-management",
        icon: <Car className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/dashboard/vehicle-management",
        badge: "12",
      },
    ];

    const settingsNavLinks = [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: <Settings className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/dashboard/settings",
      },
    ];

    return { mainNavLinks, settingsNavLinks };  
  }, [location.pathname]);
};

// Memoized Sidebar Content to prevent unnecessary re-renders
const MemoizedSidebarContent = React.memo(() => {
  const { mainNavLinks, settingsNavLinks } = useNavigationLinks();

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup label="Main">
          <SidebarNav>
            {mainNavLinks.map((link) => (
              <SidebarNavItem key={link.href} link={link} />
            ))}
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Management">
          <SidebarNav>
            {settingsNavLinks.map((link) => (
              <SidebarNavItem key={link.href} link={link} />
            ))}
          </SidebarNav>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
});

// Get page title based on current route
const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/dashboard":
      return "Dashboard";
    case "/dashboard/add-vehicle":
      return "Add Vehicle";
    case "/dashboard/vehicle-management":
      return "Vehicle Management";
    case "/dashboard/settings":
      return "Settings";
    case "/dashboard/notifications":
      return "Notifications";
    default:
      return "Dashboard";
  }
};

export default function NewDashboardLayout() {
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={false}>
      <motion.div 
        className="flex h-screen bg-gray-50 overflow-hidden relative"
        layout
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <Sidebar>
          <MemoizedSidebarContent />
        </Sidebar>

        {/* Main content area */}
        <motion.div 
          className="flex-1 flex flex-col min-w-0"
          layout
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* Top Bar */}
          <TopBar title={getPageTitle(location.pathname)} />

          {/* Page content */}
          <motion.main 
            className="flex-1 overflow-hidden"
            layout
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Outlet />
          </motion.main>
        </motion.div>
      </motion.div>
    </SidebarProvider>
  );
}
