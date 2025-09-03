import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, Building, Users as UsersIcon, Car } from "lucide-react";
import { useState } from "react";

// Mock data for companies - replace with real API calls later
const mockCompanies = [
  { 
    id: 1, 
    name: "City Transport Co.", 
    contactEmail: "admin@citytransport.com",
    vehicles: 45, 
    users: 12, 
    status: "active", 
    plan: "Premium",
    createdAt: "2024-01-15",
    maxVehicles: 50
  },
  { 
    id: 2, 
    name: "Metro Bus Lines", 
    contactEmail: "contact@metrobus.com",
    vehicles: 32, 
    users: 8, 
    status: "active", 
    plan: "Standard",
    createdAt: "2024-02-20",
    maxVehicles: 40
  },
  { 
    id: 3, 
    name: "Urban Mobility Inc.", 
    contactEmail: "info@urbanmobility.com",
    vehicles: 28, 
    users: 6, 
    status: "active", 
    plan: "Premium",
    createdAt: "2024-03-10",
    maxVehicles: 35
  },
  { 
    id: 4, 
    name: "Express Transit", 
    contactEmail: "support@expresstransit.com",
    vehicles: 67, 
    users: 18, 
    status: "active", 
    plan: "Enterprise",
    createdAt: "2023-11-05",
    maxVehicles: 100
  },
  { 
    id: 5, 
    name: "Quick Ride Services", 
    contactEmail: "hello@quickride.com",
    vehicles: 23, 
    users: 5, 
    status: "inactive", 
    plan: "Basic",
    createdAt: "2024-04-18",
    maxVehicles: 25
  },
];

export default function CompanyManagement() {
  const [searchValue, setSearchValue] = useState("");

  const filteredCompanies = mockCompanies.filter((company) =>
    company.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    company.contactEmail.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Enterprise": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Premium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Standard": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Company Management</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bg-card w-full pl-10 pr-4 py-2 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 hover:bg-muted rounded">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{company.contactEmail}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status and Plan */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                    {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(company.plan)}`}>
                    {company.plan}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{company.vehicles}</p>
                      <p className="text-xs text-muted-foreground">Vehicles</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{company.users}</p>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Usage */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Vehicle Usage</span>
                    <span>{company.vehicles}/{company.maxVehicles}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(company.vehicles / company.maxVehicles) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(company.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-lg font-medium">
            No companies found
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
