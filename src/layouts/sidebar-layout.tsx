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
  Cpu
} from "lucide-react";
import { useUser } from "@/context/userContext";
import logoImage from "@/assets/logo.png";

// Memoized Logo component to prevent unnecessary re-renders
const Logo = React.memo(() => {
  const { isOpen, isMobile } = useSidebarContext();
  const showFullLogo = isOpen || isMobile;
  const { user } = useUser(); // 👈 pull fleet/company info
  
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
        <img src={logoImage} alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
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
            <span className="font-bold text-sidebar-foreground whitespace-nowrap">
              {user?.company_name || "Ride Alert"}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Vehicle Management
            </span>
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
    ];

    const managementNavLinks = [
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
      },
      {
        label: "IOT Management",
        href: "/dashboard/iot-management",
        icon: <Cpu className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/dashboard/iot-management",
      },
    ];

    return { mainNavLinks, managementNavLinks };  
  }, [location.pathname]);
};

// Memoized Sidebar Content to prevent unnecessary re-renders
const MemoizedSidebarContent = React.memo(() => {
  const { mainNavLinks, managementNavLinks } = useNavigationLinks();

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
            {managementNavLinks.map((link) => (
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
    case "/dashboard/iot-management":
      return "IOT Management";
    case "/dashboard/notifications":
      return "Notifications";
    default:
      return "Dashboard";
  }
};

export default function NewDashboardLayout() {
  const location = useLocation();
  const { user } = useUser();

  // Additional role check at layout level
  if (user && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">This area is restricted to fleet administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
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
