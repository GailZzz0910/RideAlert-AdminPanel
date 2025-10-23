import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Car, BarChart3, Shield, Zap, Star, Building, CreditCard, Search, Filter, CheckCircle, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/utils/api";

// Interfaces
interface PlanFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlan {
  id?: string;
  name: string;
  price: number;
  maxVehicles: number;
  popular?: boolean;
  description: string;
  features: PlanFeature[];
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendSubscriptionPlan {
  id: string;
  plan_name: string;
  plan_code: string;
  description?: string;
  price: number;
  max_vehicles: number;
  features: Array<string | { name: string }>;
  is_active: boolean;
  created_at: string;
  last_updated: string;
}

const iconOptions = [
  { value: "Car", label: "Car", icon: <Car className="w-4 h-4" /> },
  { value: "BarChart3", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  { value: "Shield", label: "Shield", icon: <Shield className="w-4 h-4" /> },
  { value: "Zap", label: "Zap", icon: <Zap className="w-4 h-4" /> },
  { value: "Star", label: "Star", icon: <Star className="w-4 h-4" /> },
  { value: "Building", label: "Building", icon: <Building className="w-4 h-4" /> },
];

const defaultFeatures = [
  "Real-time GPS tracking",
];

// Transform backend data to component format
const transformPlanData = (backendPlan: BackendSubscriptionPlan): SubscriptionPlan => {
  return {
    id: backendPlan.id,
    name: backendPlan.plan_name,
    price: backendPlan.price,
    maxVehicles: backendPlan.max_vehicles,
    description: backendPlan.description || "",
    features: Array.isArray(backendPlan.features)
      ? backendPlan.features.map((f) => ({
          name: typeof f === "string" ? f : (f.name || ""),
          included: true,
        }))
      : [],
    icon: "Car",
    popular: false,
  };
};

// Skeleton component for loading states
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-border">
        <div className="py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-5 h-5 bg-muted rounded"></div>
            <div>
              <div className="h-4 bg-muted rounded w-32 mb-2"></div>
              <div className="h-3 bg-muted/60 rounded w-48"></div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-4 bg-muted rounded w-12"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SummaryCardSkeleton = () => (
  <div className="animate-pulse">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg"></div>
          <div>
            <div className="h-3 bg-muted rounded w-16 mb-2"></div>
            <div className="h-6 bg-muted rounded w-8"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [selectedPlanForFeatures, setSelectedPlanForFeatures] = useState<SubscriptionPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<SubscriptionPlan>({
    name: "",
    price: 0,
    maxVehicles: 0,
    popular: false,
    description: "",
    features: defaultFeatures.map((feature) => ({ name: feature, included: false })),
    icon: "Car",
  });

  // Fetch plans from backend
  const fetchPlans = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await api.get("/subscription-plans/");

      // Transform backend data to component format
      const transformedPlans = Array.isArray(response.data)
        ? response.data.map(transformPlanData)
        : [];
      setPlans(transformedPlans);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      setError("Failed to fetch subscription plans");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof SubscriptionPlan, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle feature toggle
  const handleFeatureToggle = (featureIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, index) =>
        index === featureIndex
          ? { ...feature, included: !feature.included }
          : feature
      ),
    }));
  };

  // Add new feature
  const addNewFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { name: "", included: false }],
    }));
  };

  // Remove feature
  const removeFeature = (featureIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, index) => index !== featureIndex),
    }));
  };

  // Update feature name
  const updateFeatureName = (featureIndex: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, index) =>
        index === featureIndex ? { ...feature, name } : feature
      ),
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      maxVehicles: 0,
      popular: false,
      description: "",
      features: defaultFeatures.map((feature) => ({ name: feature, included: false })),
      icon: "Car",
    });
    setEditingPlan(null);
  };

  // Open dialog for creating new plan
  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open dialog for editing plan
  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);

      // Validate form
      if (!formData.name.trim() || formData.price < 0 || formData.maxVehicles < -1) {
        setError("Please fill in all required fields correctly");
        return;
      }

      // Filter out empty feature names
      const validFeatures = formData.features
        .filter((feature) => feature.name.trim() !== "")
        .map((feature) => feature.name);

      // Transform to backend format
      const planData = {
        plan_name: formData.name,
        plan_code: formData.name.toUpperCase().replace(/\s+/g, "_"),
        description: formData.description,
        price: formData.price,
        max_vehicles: formData.maxVehicles,
        features: validFeatures,
        is_active: true,
      };

      if (editingPlan && editingPlan.id) {
        // Update existing plan
        await api.patch(`/subscription-plans/${editingPlan.id}`, planData);
      } else {
        // Create new plan
        await api.post("/subscription-plans/", planData);
      }

      // Refresh plans list
      await fetchPlans(true);

      // Close dialog and reset form
      setIsDialogOpen(false);
      resetForm();
      setError(null);
    } catch (err: any) {
      console.error("Error saving plan:", err);
      setError(err.response?.data?.detail || "Failed to save subscription plan");
    } finally {
      setSaving(false);
    }
  };

  // Handle plan deletion
  const handleDelete = async (planId: string) => {
    if (deleting) return;

    try {
      setDeleting(planId);
      setError(null);

      await api.delete(`/subscription-plans/${planId}`);
      await fetchPlans(true);
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      setError(err.response?.data?.detail || "Failed to delete subscription plan");
    } finally {
      setDeleting(null);
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find((option) => option.value === iconName);
    return iconOption ? iconOption.icon : <Car className="w-4 h-4" />;
  };

  // Filter plans based on search and filter criteria
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      (plan.name?.toLowerCase() || "").includes(searchValue.toLowerCase()) ||
      (plan.description?.toLowerCase() || "").includes(searchValue.toLowerCase()) ||
      (plan.features?.some((feature) =>
        (feature.name?.toLowerCase() || "").includes(searchValue.toLowerCase())
      ) ?? false);

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "popular" && plan.popular) ||
      (filterStatus === "basic" && !plan.popular && plan.price < 50) ||
      (filterStatus === "premium" && !plan.popular && plan.price >= 50);

    return matchesSearch && matchesFilter;
  });

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 pt-8 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscription Plans Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage subscription plans for fleet companies.
            </p>
          </div>
          {refreshing && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating data...
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loading ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Plans</p>
                      <p className="text-2xl font-bold text-foreground">{plans.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Popular Plans</p>
                      <p className="text-2xl font-bold text-foreground">
                        {plans.filter((p) => p.popular).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Price</p>
                      <p className="text-2xl font-bold text-foreground">
                        $
                        {plans.length > 0
                          ? Math.round(plans.reduce((sum, p) => sum + p.price, 0) / plans.length)
                          : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unlimited Plans</p>
                      <p className="text-2xl font-bold text-foreground">
                        {plans.filter((p) => p.maxVehicles === -1).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search plans, descriptions, or features..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            >
              <option value="all">All Plans</option>
              <option value="popular">Popular Plans</option>
              <option value="basic">Basic Plans (&lt;$50)</option>
              <option value="premium">Premium Plans ($50+)</option>
            </select>
          </div>

          <Button onClick={openCreateDialog} className="cursor-pointer" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Plan
          </Button>
        </div>

        {/* Subscription Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Plans {!loading && `(${filteredPlans.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Plan Details
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Max Vehicles
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Features
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <TableSkeleton />
                      </td>
                    </tr>
                  ) : filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <CreditCard className="w-8 h-8 text-muted-foreground" />
                          <div className="text-muted-foreground">
                            {searchValue || filterStatus !== "all"
                              ? "No plans match your search criteria"
                              : "No subscription plans created yet"}
                          </div>
                          {!searchValue && filterStatus === "all" && (
                            <Button
                              onClick={openCreateDialog}
                              variant="outline"
                              size="sm"
                              disabled={saving}
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4 mr-2" />
                              )}
                              Create First Plan
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedPlanForFeatures(plan);
                          setIsFeatureDialogOpen(true);
                        }}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {getIconComponent(plan.icon)}
                            <div>
                              <span className="font-medium text-foreground">{plan.name}</span>
                              <div className="text-sm text-muted-foreground">{plan.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-lg text-foreground">${plan.price}</span>
                            <span className="text-sm text-muted-foreground">per month</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-foreground">
                            {plan.maxVehicles === -1 ? "Unlimited" : plan.maxVehicles}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-green-600 font-medium">
                              {plan.features.filter((f) => f.included).length} included
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Click to view details
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {plan.popular && (
                            <Badge className="bg-blue-500 hover:bg-blue-600">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Most Popular
                              </div>
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              disabled={saving || deleting === plan.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(plan);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="cursor-pointer text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  disabled={saving || deleting === plan.id}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {deleting === plan.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the "{plan.name}" subscription plan?
                                    This action cannot be undone and may affect existing subscribers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={deleting === plan.id}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => plan.id && handleDelete(plan.id)}
                                    className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                    disabled={deleting === plan.id}
                                  >
                                    {deleting === plan.id ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete Plan"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Modify the subscription plan details below.' : 'Fill in the details to create a new subscription plan.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Basic, Premium, Enterprise"
                  disabled={saving}
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($/month) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  disabled={saving}
                  required
                />
              </div>

              <div>
                <Label htmlFor="maxVehicles">Max Vehicles *</Label>
                <Input
                  id="maxVehicles"
                  type="number"
                  min="-1"
                  value={formData.maxVehicles}
                  onChange={(e) => handleInputChange('maxVehicles', parseInt(e.target.value) || 0)}
                  placeholder="-1 for unlimited"
                  disabled={saving}
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Use -1 for unlimited vehicles
                </div>
              </div>

              <div>
                <Label htmlFor="icon">Icon</Label>
                <select
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  disabled={saving}
                  className="w-full p-2 border border-input bg-background rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the plan"
                disabled={saving}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="popular"
                checked={formData.popular}
                onChange={(e) => handleInputChange('popular', e.target.checked)}
                disabled={saving}
              />
              <Label htmlFor="popular">Mark as Popular Plan</Label>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-base font-medium">Features</Label>
                <Button type="button" onClick={addNewFeature} variant="outline" size="sm" disabled={saving}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Feature
                </Button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-background">
                    <input
                      type="checkbox"
                      checked={feature.included}
                      onChange={() => handleFeatureToggle(index)}
                      disabled={saving}
                      className="rounded border-input"
                    />
                    <Input
                      value={feature.name}
                      onChange={(e) => updateFeatureName(index, e.target.value)}
                      placeholder="Feature name"
                      disabled={saving}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      disabled={saving}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingPlan ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Features Detail Dialog */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedPlanForFeatures && getIconComponent(selectedPlanForFeatures.icon)}
              <span>{selectedPlanForFeatures?.name} - Features</span>
            </DialogTitle>
            <DialogDescription>
              Detailed feature breakdown for this subscription plan
            </DialogDescription>
          </DialogHeader>

          {selectedPlanForFeatures && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-600 flex items-center space-x-2">
                    <span className="text-lg">✓</span>
                    <span>Included Features ({selectedPlanForFeatures.features.filter(f => f.included).length})</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedPlanForFeatures.features
                      .filter(feature => feature.included)
                      .map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <span className="text-green-500 font-bold">✓</span>
                          <span>{feature.name}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-500 flex items-center space-x-2">
                    <span className="text-lg">✗</span>
                    <span>Not Included ({selectedPlanForFeatures.features.filter(f => !f.included).length})</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedPlanForFeatures.features
                      .filter(feature => !feature.included)
                      .map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-400 font-bold">✗</span>
                          <span className="text-gray-500">{feature.name}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  <strong>Plan Summary:</strong> {selectedPlanForFeatures.description}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <strong>Price:</strong> ${selectedPlanForFeatures.price}/month | 
                  <strong> Max Vehicles:</strong> {selectedPlanForFeatures.maxVehicles === -1 ? 'Unlimited' : selectedPlanForFeatures.maxVehicles}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsFeatureDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      </div>
    </ScrollArea>
  );
}