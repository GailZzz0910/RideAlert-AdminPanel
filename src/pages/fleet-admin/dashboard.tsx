import { useUser } from "../../context/userContext";
import { DashboardCountCard } from "@/components/dashboard-count-card";
import { 
  Car, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Plus,
  MapPin,
  Route,
  Settings,
  Quote as QuoteIcon,
  Sun,
  Moon,
  Sunrise,
  ArrowRight,
  Sparkles,
  Building2,
  User,
  Activity,
  Wifi,
  Shield,
  Hash,
  Crown,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Globe,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useMemo } from "react";
import { useVehicleWebSocket } from "@/components/useVehicleWebsocket";
import { wsBaseURL } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

interface QuoteData {
  text: string;
  author: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentQuote, setCurrentQuote] = useState<QuoteData>({ text: "", author: "" });

  const fleetId = user?.id;
  const liveVehicles = useVehicleWebSocket(
    `${wsBaseURL}/ws/vehicles/all/${fleetId}`
  );

  // Get a new inspirational quote from the quotable API
  const getNewQuote = async (): Promise<QuoteData> => {
    try {
      const response = await fetch('https://api.quotable.io/quotes/random?minLength=50&maxLength=200&tags=motivational,inspirational,success,wisdom');
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          text: data[0].content,
          author: data[0].author
        };
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    }
    
    // Fallback quotes if API fails
    const fallbackQuotes = [
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
      { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
      { text: "Quality is not an act, it is a habit.", author: "Aristotle" }
    ];
    
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update quote every 30 seconds
  useEffect(() => {
    // Set initial quote
    const loadInitialQuote = async () => {
      const initialQuote = await getNewQuote();
      setCurrentQuote(initialQuote);
    };
    
    loadInitialQuote();

    // Set up interval to update quote every 30 seconds
    const timer = setInterval(async () => {
      const newQuote = await getNewQuote();
      setCurrentQuote(newQuote);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate vehicle statistics
  const vehicleStats = useMemo(() => {
    if (!Array.isArray(liveVehicles)) {
      return { total: 0, available: 0, full: 0, unavailable: 0 };
    }

    const stats = {
      total: liveVehicles.length,
      available: 0,
      full: 0,
      unavailable: 0
    };

    liveVehicles.forEach((vehicle: any) => {
      const status = vehicle.status?.toLowerCase();
      if (status === 'available') {
        stats.available++;
      } else if (status === 'full') {
        stats.full++;
      } else {
        stats.unavailable++;
      }
    });

    return stats;
  }, [liveVehicles]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Get time-based icon
  const timeIcon = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return Sun;
    if (hour >= 12 && hour < 18) return Sunrise;
    return Moon;
  }, [currentTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Modern Header */}
        <motion.div 
          className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-2xl">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    {getGreeting()}, {user?.company_name || 'Fleet Manager'}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                    Monitor your fleet performance and analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 overflow-y-auto">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <DashboardCountCard
                  label="Total Vehicles"
                  count={vehicleStats.total}
                  icon={<Car className="text-blue-600" />}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DashboardCountCard
                  label="Available"
                  count={vehicleStats.available}
                  icon={<CheckCircle className="text-green-600" />}
                  percent={vehicleStats.total > 0 ? Math.round((vehicleStats.available / vehicleStats.total) * 100) : 0}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <DashboardCountCard
                  label="Full"
                  count={vehicleStats.full}
                  icon={<Users className="text-orange-600" />}
                  percent={vehicleStats.total > 0 ? Math.round((vehicleStats.full / vehicleStats.total) * 100) : 0}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DashboardCountCard
                  label="Unavailable"
                  count={vehicleStats.unavailable}
                  icon={<XCircle className="text-red-600" />}
                  percent={vehicleStats.total > 0 ? Math.round((vehicleStats.unavailable / vehicleStats.total) * 100) : 0}
                />
              </motion.div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Quick Actions, Time & Date */}
              <div className="flex flex-col gap-6 h-full">
                {/* Quick Actions Panel */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-6 pb-6">
                      <div className="grid grid-cols-2 gap-6">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            onClick={() => navigate('/dashboard/add-vehicle')}
                            className="h-20 w-full flex flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg rounded-2xl"
                          >
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold">Add Vehicle</span>
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            onClick={() => navigate('/dashboard/vehicle-management')}
                            variant="outline"
                            className="h-20 w-full flex flex-col gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border-2 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 shadow-lg rounded-2xl"
                          >
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Car className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Manage Fleet</span>
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            onClick={() => navigate('/dashboard/tracking')}
                            variant="outline"
                            className="h-20 w-full flex flex-col gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-lg rounded-2xl"
                          >
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Live Tracking</span>
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            onClick={() => navigate('/dashboard/add-routes')}
                            variant="outline"
                            className="h-20 w-full flex flex-col gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 shadow-lg rounded-2xl"
                          >
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                              <Route className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Route Planning</span>
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Time and Date Row */}
                <div className="grid grid-cols-2 gap-6 flex-1">
                  {/* Current Time Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                          <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                          Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-4 pb-4 flex flex-col justify-center flex-1">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono mb-3">
                            {currentTime.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {currentTime.toLocaleDateString('en-US', { 
                              weekday: 'long'
                            })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Date Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                          <div className="p-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                            <Calendar className="w-3 h-3 text-white" />
                          </div>
                          Date
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-4 pb-4 flex flex-col justify-center flex-1">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                            {currentTime.toLocaleDateString('en-US', { 
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-lg text-emerald-600 dark:text-emerald-400 mb-2">
                            {currentTime.getFullYear()}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Week {Math.ceil(currentTime.getDate() / 7)} of {currentTime.toLocaleDateString('en-US', { month: 'long' })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              {/* Right Sidebar - Company Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col gap-6 h-full"
              >
                {/* Company Information */}
                <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      Company Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 px-6 pb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center gap-3 mb-1">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Company</span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">{user?.company_name || 'Fleet Company'}</p>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                      <div className="flex items-center gap-3 mb-1">
                        <Hash className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Fleet ID</span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white font-mono">{user?.company_code || 'FL001'}</p>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                      <div className="flex items-center gap-3 mb-1">
                        <Crown className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Subscription</span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white capitalize">{user?.subscription_plan || 'Standard'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Insight */}
                <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                        <QuoteIcon className="w-4 h-4 text-white" />
                      </div>
                      Daily Inspiration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-6 pb-6">
                    <blockquote className="text-sm font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed mb-2">
                      "{currentQuote.text}"
                    </blockquote>
                    <footer className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      — {currentQuote.author}
                    </footer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}