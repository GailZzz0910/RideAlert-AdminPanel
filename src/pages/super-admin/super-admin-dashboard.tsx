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
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Mock data for super admin dashboard - replace with real API calls later
const mockSuperAdminData = {
  totalCompanies: 15,
  totalUsers: 127,
  totalVehicles: 380,
  activeVehicles: 342,
  systemHealth: 98.5,
  recentActivity: [
    { id: 1, company: "City Transport Co.", action: "Added 5 new vehicles", time: "2 hours ago", type: "vehicle" },
    { id: 2, company: "Metro Bus Lines", action: "New user registered", time: "4 hours ago", type: "user" },
    { id: 3, company: "Urban Mobility Inc.", action: "System maintenance completed", time: "6 hours ago", type: "system" },
    { id: 4, company: "Express Transit", action: "Fleet capacity increased", time: "1 day ago", type: "fleet" },
  ],
  companies: [
    { id: 1, name: "City Transport Co.", vehicles: 45, users: 12, status: "active", plan: "Premium" },
    { id: 2, name: "Metro Bus Lines", vehicles: 32, users: 8, status: "active", plan: "Standard" },
    { id: 3, name: "Urban Mobility Inc.", vehicles: 28, users: 6, status: "active", plan: "Premium" },
    { id: 4, name: "Express Transit", vehicles: 67, users: 18, status: "active", plan: "Enterprise" },
    { id: 5, name: "Quick Ride Services", vehicles: 23, users: 5, status: "inactive", plan: "Basic" },
  ]
};

export default function SuperAdminDashboard() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Companies");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Filter companies based on search and status
  const filteredCompanies = mockSuperAdminData.companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = 
      selectedFilter === "All Companies" ||
      selectedFilter === "Active" && company.status === "active" ||
      selectedFilter === "Inactive" && company.status === "inactive";
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-500" : "bg-gray-500";
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Enterprise": return "bg-purple-500";
      case "Premium": return "bg-blue-500";
      case "Standard": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">

        {/* System Overview Cards */}
        <div className="grid w-full gap-5 mb-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCountCard 
            label="Total Companies" 
            count={mockSuperAdminData.totalCompanies} 
            icon={<Building className="text-primary w-6 h-6" />} 
            subtext={""} 
          />
          <DashboardCountCard 
            label="Total Users" 
            count={mockSuperAdminData.totalUsers} 
            icon={<Users className="text-primary w-6 h-6" />} 
            percent={85} 
          />
          <DashboardCountCard 
            label="Total Vehicles" 
            count={mockSuperAdminData.totalVehicles} 
            icon={<Car className="text-primary w-6 h-6" />} 
            percent={90} 
          />
          <DashboardCountCard 
            label="System Health" 
            count={mockSuperAdminData.systemHealth} 
            icon={<Activity className="text-primary w-6 h-6" />} 
            percent={mockSuperAdminData.systemHealth} 
            subtext="%" 
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
                  {mockSuperAdminData.totalCompanies}
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
                <div className="w-16 h-16 border-5 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompanies.map((company) => (
                  <Card 
                    key={company.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/super-admin/company/${company.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(company.status)}`} />
                            <h3 className="font-semibold text-foreground">{company.name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{company.vehicles} vehicles</span>
                          <span>{company.users} users</span>
                          <span className={`px-2 py-1 rounded text-white text-xs ${getPlanColor(company.plan)}`}>
                            {company.plan}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>


        </div>

      </div>
    </ScrollArea>
  );
}
