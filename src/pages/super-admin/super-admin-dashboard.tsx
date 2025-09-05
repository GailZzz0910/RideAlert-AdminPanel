import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardCountCard } from "@/components/dashboard-count-card";
import {
  Building,
  Users,
  Car,
  Shield,
  Search,
  ChevronDown,
  ListFilter,
  TrendingUp,
  AlertTriangle,
  Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useFleetCounter } from "./utils/fleetCounter";
import { useUserCounter } from "./utils/userCounter";
import { useVehicleCounter } from "./utils/vehicleCounter";
import { useAllFleets } from "./utils/useAllFleets";
import { useUser } from "@/context/userContext";

export default function SuperAdminDashboard() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Companies");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //get user
  const { user, token } = useUser();

  useEffect(() => {
    console.log("Current user:", user);
    console.log("Current token:", token);
  }, [user, token]);

  //counter
  const fleetCount = useFleetCounter();
  const userCount = useUserCounter();
  const vehicleCount = useVehicleCounter();
  const fleets = useAllFleets();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Filter companies based on search and status
  const filteredCompanies = fleets.filter((company) => {
    const matchesSearch = company.company_name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter =
      selectedFilter === "All Companies" ||
      (selectedFilter === "Active" && company.is_active) ||
      (selectedFilter === "Inactive" && !company.is_active);
    return matchesSearch && matchesFilter;
  });

  // Fixed status color function to handle boolean values
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-gray-500";
  };

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "enterprise": return "bg-purple-500";
      case "premium": return "bg-blue-500";
      case "standard": return "bg-orange-500";
      case "basic": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin": return "text-green-400";
      case "superadmin": return "text-purple-400";
      case "user": return "text-blue-400";
      case "unverified": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">

        {/* System Overview Cards */}
        <div className="grid w-full gap-5 mb-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCountCard
            label="Total Companies"
            count={fleetCount}
            icon={<Building className="text-primary w-6 h-6" />}
            subtext={""}
          />
          <DashboardCountCard
            label="Total Users"
            count={userCount}
            icon={<Users className="text-primary w-6 h-6" />}
          />
          <DashboardCountCard
            label="Total Vehicles"
            count={vehicleCount}
            icon={<Car className="text-primary w-6 h-6" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Companies Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header with title and count */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                Companies
                <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {fleetCount}
                </span>
              </h2>
            </div>

            {/* Filter Section */}
            <div className="flex items-center justify-between gap-4 rounded-lg">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search companies"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="bg-card w-full pl-10 pr-4 py-2 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg bg-card text-foreground hover:bg-muted">
                    <ListFilter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedFilter}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setSelectedFilter("All Companies")}>
                    All Companies
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("Active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("Inactive")}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Companies List */}
            {loading ? (
              <div className="flex items-center justify-center h-[300px] w-full">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompanies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Building className="w-12 h-12 mb-2 opacity-50" />
                    <p>No companies found</p>
                    <p className="text-sm">
                      {searchValue 
                        ? `No companies match "${searchValue}"`
                        : "No companies registered yet"
                      }
                    </p>
                  </div>
                ) : (
                  filteredCompanies.map((company) => (
                    <Card
                      key={company._id || company.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        const companyId = company._id || company.id;
                        console.log("Navigating to company ID:", companyId);
                        navigate(`/super-admin/company/${companyId}`);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(company.is_active)}`} />
                              <h3 className="font-semibold text-foreground">{company.company_name}</h3>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className={`${getRoleColor(company.role)} text-md font-semibold`}>
                              {company.role || "N/A"}
                            </span>
                            <span>{company.max_vehicles || 0} vehicles max</span>
                            <span className={`px-2 py-1 rounded text-white text-xs ${getPlanColor(company.subscription_plan || 'Basic')}`}>
                              {company.subscription_plan || 'Basic'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}