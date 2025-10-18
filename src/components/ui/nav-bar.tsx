import { Link } from "react-router-dom";
import { Car, Menu } from "lucide-react";
import { X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./dialog";
import { LoginForm } from "../login-form";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-black border-neutral-800" showCloseButton>
          <LoginForm />
        </DialogContent>
      </Dialog>
      <nav className={`w-full h-15 max-h-15 px-4 lg:px-6 py-0 fixed top-0 left-0 z-50 bg-black bg-opacity-90 backdrop-blur-md shadow-md${scrolled ? ' border-b border-gray-600/40' : ''}`}> 
        <div className="flex items-center max-w-7xl mx-auto h-full min-h-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group h-full">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center ">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="hidden sm:inline font-bold text-base sm:text-lg md:text-xl text-white leading-none">Ride Alert</span>
          </Link>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-7 ml-10 h-full">
            {["Features", "Trips", "Showcase"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 text-md font-medium hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
          {/* Desktop: Sign In and Download App Buttons */}
          <div className="hidden md:flex items-center gap-2 ml-auto h-full">
            <button
              className="text-gray-300 text-md font-medium hover:text-white cursor-pointer mr-2"
              onClick={() => setLoginOpen(true)}
            >
              Sign In
            </button>
            <button 
              onClick={() => window.open('https://drive.google.com/file/d/14YndAAm6Oej7FB80PldvphI2D04eO7jv/view?usp=sharing', '_blank')}
              className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer"
            >
              Download App
            </button>
          </div>
          {/* Mobile: Hamburger/Close Dropdown */}
          <div className="md:hidden ml-auto flex items-center h-full">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center p-2 rounded-lg text-white hover:bg-gray-800 cursor-pointer"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                  {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-5 bg-black text-white border">
                <div className="flex flex-col gap-2 py-2">
                  {["Features", "Trips", "Showcase"].map((item) => (
                    <DropdownMenuItem
                      key={item}
                      asChild
                      onClick={() => setMenuOpen(false)}
                    >
                      <a href={`#${item.toLowerCase()}`} className="text-lg font-medium hover:text-blue-400 transition-colors">
                        {item}
                      </a>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => { setMenuOpen(false); setLoginOpen(true); }}>
                    <span className="text-lg font-medium hover:text-blue-400 transition-colors cursor-pointer">
                      Sign In
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMenuOpen(false)}>
                    <button 
                      onClick={() => window.open('https://drive.google.com/file/d/14YndAAm6Oej7FB80PldvphI2D04eO7jv/view?usp=sharing', '_blank')}
                      className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-lg mt-2 w-full"
                    >
                      Download App
                    </button>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
}
