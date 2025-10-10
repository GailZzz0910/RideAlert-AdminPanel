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
import { SuperAdminTopBar } from "../components/ui/super-admin-top-bar";
import { useUser } from "../context/userContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Building, 
  Users, 
  Car,
  BarChart3,
  Settings,
  Crown,
  Database,
  UserPlus,
  UserCheck,
  ClipboardList,
  Cpu,
} from "lucide-react";

// Memoized Logo component for Super Admin
const SuperAdminLogo = React.memo(() => {
  const { isOpen, isMobile } = useSidebarContext();
  const showFullLogo = isOpen || isMobile;
  
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
        <Crown className="w-5 h-5 text-white" />
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
            <span className="font-bold text-sidebar-foreground whitespace-nowrap">Super Admin</span>
            <span className="text-xs text-gray-400 whitespace-nowrap">System Management</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Memoized navigation links for super admin
const useSuperAdminNavigationLinks = () => {
  const location = useLocation();
  
  return React.useMemo(() => {
    const mainNavLinks = [
      {
        label: "Dashboard",
        href: "/super-admin",
        icon: <BarChart3 className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/super-admin",
      },
      {
        label: "Companies",
        href: "/super-admin/companies",
        icon: <Building className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/super-admin/companies",
      }
    ];

    const userNavLinks = [
      {
        label: "Fleet Registration",
        href: "/super-admin/fleet-management",
        icon: <ClipboardList className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/super-admin/fleet-management",
      },
    ];

    const systemNavLinks = [
      {
        label: "IOT Management",
        href: "/super-admin/iot-management",
        icon: <Cpu className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/super-admin/iot-management",
      },
    ];


    const settingsNavLinks = [
      {
        
        label: "Settings",
        href: "/super-admin/settings",
        icon: <Settings className="w-5 h-5 text-sidebar-foreground" />,
        isActive: location.pathname === "/super-admin/settings",
      },
    ];

    return { mainNavLinks, userNavLinks, systemNavLinks, settingsNavLinks };  
  }, [location.pathname]);
};

// Memoized Sidebar Content for Super Admin
const MemoizedSuperAdminSidebarContent = React.memo(() => {
  const { mainNavLinks, userNavLinks, systemNavLinks, settingsNavLinks } = useSuperAdminNavigationLinks();

  return (
    <>
      <SidebarHeader>
        <SuperAdminLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup label="Main">
          <SidebarNav>
            {mainNavLinks.map((link) => (
              <SidebarNavItem key={link.href} link={link} />
            ))}
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Fleet Management">
          <SidebarNav>
            {userNavLinks.map((link) => (
              <SidebarNavItem key={link.href} link={link} />
            ))}
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="System">
          <SidebarNav>
            {systemNavLinks.map((link) => (
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

// Get page title based on current route for super admin
const getSuperAdminPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/super-admin":
      return "Super Admin Dashboard";
    case "/super-admin/companies":
      return "Company Management";
    case "/super-admin/users":
      return "User Management";
    case "/super-admin/fleet-management":
      return "Fleet Registration Management";
    case "/super-admin/iot-management":
      return "IOT Device Management";
    case "/super-admin/add-user":
      return "Add User";
    case "/super-admin/all-vehicles":
      return "All Vehicles";
    case "/super-admin/system-data":
      return "System Data";
    case "/super-admin/settings":
      return "System Settings";
    default:
      return "Super Admin Dashboard";
  }
};

export default function SuperAdminLayout() {
  const location = useLocation();
  const { user } = useUser();

  // Additional role check at layout level
  if (user && user.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">This area is restricted to super administrators only.</p>
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
          <MemoizedSuperAdminSidebarContent />
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
          <SuperAdminTopBar title={getSuperAdminPageTitle(location.pathname)} />

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
