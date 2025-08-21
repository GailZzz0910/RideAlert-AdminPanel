import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
}

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(defaultOpen);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [defaultOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider
      value={{ isOpen, toggleSidebar, closeSidebar, isMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ children, className }) => {
  const { isOpen, isMobile } = useSidebarContext();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? "280px" : "72px",
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          "hidden md:flex h-full bg-sidebar flex-col relative z-10 border-r",
          "overflow-hidden",
          className
        )}
        layout
      >
        {children}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => useSidebarContext().closeSidebar()}
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={cn(
                "fixed top-0 left-0 h-full w-80 bg-sidebar z-50 md:hidden",
                className
              )}
            >
              {children}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  children,
  className,
}) => {
  const { isMobile, toggleSidebar } = useSidebarContext();

  return (
    <div
      className={cn(
        "relative p-4",
        className
      )}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {children}
      </div>

      {/* Close button only on mobile */}
      {isMobile && (
        <motion.button
          onClick={toggleSidebar}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full bg-sidebar hover:bg-gray-200",
            "flex items-center justify-center transition-colors"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden px-3 py-4",
        "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
        className
      )}
      layout
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-4 border-t border-gray-200 bg-gray-50/50",
        className
      )}
    >
      {children}
    </div>
  );
};

interface SidebarNavProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  children,
  className,
}) => {
  return (
    <nav className={cn("space-y-1", className)}>
      {children}
    </nav>
  );
};

interface SidebarNavItemProps {
  link: SidebarLink;
  className?: string;
  onClick?: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  link,
  className,
  onClick,
}) => {
  const { isOpen, isMobile, closeSidebar } = useSidebarContext();
  const showLabel = isOpen || isMobile;

  const handleClick = () => {
    // Only close sidebar on mobile when clicking a link
    if (isMobile) {
      closeSidebar();
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      to={link.href}
      onClick={handleClick}
      className={cn(
        "flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium relative ",
        " group",
        "hover:bg-sidebar-accent focus:outline-none",
        link.isActive
          ? "bg-sidebar-accent"
          : "bg-sidebar",
        className
      )}
    >




      <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
        {link.icon}
      </div>

      <AnimatePresence mode="wait">
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, x: -10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: -10, width: 0 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.4, 0, 0.2, 1],
            }}
            className="ml-3 flex-1 flex items-center justify-between min-w-0 overflow-hidden"
          >
            <span className="truncate">{link.label}</span>
            {link.badge && (
              <span
                className={cn(
                  "ml-2 px-2 py-0.5 text-xs rounded-full",
                  link.isActive
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {link.badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {!showLabel && (
        <div className="absolute left-full ml-2 px-2 py-1 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {link.label}
        </div>
      )}
    </Link>
  );
};

interface SidebarGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  label,
  children,
  className,
}) => {
  const { isOpen, isMobile } = useSidebarContext();
  const showLabel = isOpen || isMobile;

  return (
    <motion.div 
      className={cn("mb-4", className)}
      layout
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {label && showLabel && (
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.2,
            delay: 0.1,
          }}
          className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
        >
          {label}
        </motion.h3>
      )}
      <motion.div 
        className="space-y-1"
        layout
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Desktop Toggle Button (for use below header)
interface SidebarToggleProps {
  className?: string;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  className,
}) => {
  const { isOpen, toggleSidebar, isMobile } = useSidebarContext();

  // Don't show on mobile as we handle it differently
  if (isMobile) return null;

  return (
    <motion.div 
      className={cn("px-4 py-2", className)}
      layout
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <motion.button
        onClick={toggleSidebar}
        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </motion.div>
      </motion.button>
    </motion.div>
  );
};

// Mobile Menu Toggle Button (for use in top navigation)
interface MobileMenuToggleProps {
  className?: string;
}

export const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({
  className,
}) => {
  const { toggleSidebar, isMobile } = useSidebarContext();

  if (!isMobile) return null;

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        "p-2 rounded-lg hover:bg-gray-100 transition-colors",
        "text-gray-600 hover:text-gray-900 md:hidden",
        className
      )}
    >
      <Menu className="w-6 h-6" />
    </button>
  );
};
