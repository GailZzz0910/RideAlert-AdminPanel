import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Cpu,
  Building,
  Car,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";

interface AddIOTDeviceDialogProps {
  children: React.ReactNode;
  onAddDevice?: (deviceData: any) => void;
}

// Mock data for available companies and vehicles - replace with real API calls
const mockCompanies = [
  {
    id: 1,
    name: "City Transport Co.",
    vehicles: [
      { id: 1, plate: "NYC-001", model: "Mercedes Sprinter", status: "active" },
      { id: 2, plate: "NYC-002", model: "Ford Transit", status: "active" },
      { id: 3, plate: "NYC-003", model: "Iveco Daily", status: "maintenance" },
    ]
  },
  {
    id: 2,
    name: "Metro Bus Lines",
    vehicles: [
      { id: 15, plate: "MTR-015", model: "Volvo 9700", status: "active" },
      { id: 16, plate: "MTR-016", model: "Mercedes Citaro", status: "active" },
      { id: 17, plate: "MTR-017", model: "Scania Citywide", status: "inactive" },
    ]
  },
  {
    id: 3,
    name: "Urban Mobility Inc.",
    vehicles: [
      { id: 28, plate: "URB-028", model: "BYD K9", status: "active" },
      { id: 29, plate: "URB-029", model: "Proterra Catalyst", status: "active" },
      { id: 30, plate: "URB-030", model: "New Flyer Xcelsior", status: "maintenance" },
    ]
  }
];

const deviceModels = [
  "GPS-Tracker-Pro-X1",
  "GPS-Tracker-Lite-V2", 
  "GPS-Tracker-Advanced-Z3",
  "SmartTracker-Elite-S1",
  "NaviGuard-Pro-N2"
];

export default function AddIOTDeviceDialog({ children, onAddDevice }: AddIOTDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    objectId: "",
    deviceModel: "",
    assignmentType: "unassigned", // "unassigned" or "assigned"
    selectedCompany: "",
    selectedVehicle: "",
    notes: ""
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      objectId: "",
      deviceModel: "",
      assignmentType: "unassigned",
      selectedCompany: "",
      selectedVehicle: "",
      notes: ""
    });
    setErrors({});
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!formData.objectId.trim()) {
        newErrors.objectId = "Device ID is required";
      } else if (formData.objectId.length < 3) {
        newErrors.objectId = "Device ID must be at least 3 characters";
      }
      
      if (!formData.deviceModel) {
        newErrors.deviceModel = "Device model is required";
      }
    }

    if (step === 2 && formData.assignmentType === "assigned") {
      if (!formData.selectedCompany) {
        newErrors.selectedCompany = "Company selection is required";
      }
      if (!formData.selectedVehicle) {
        newErrors.selectedVehicle = "Vehicle selection is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const newDevice = {
        id: Date.now(), // Temporary ID
        objectId: formData.objectId,
        deviceModel: formData.deviceModel,
        vehicleId: formData.assignmentType === "assigned" ? Number(formData.selectedVehicle) : null,
        vehiclePlate: formData.assignmentType === "assigned" 
          ? mockCompanies.find(c => c.id === Number(formData.selectedCompany))
              ?.vehicles.find(v => v.id === Number(formData.selectedVehicle))?.plate 
          : null,
        companyName: formData.assignmentType === "assigned" 
          ? mockCompanies.find(c => c.id === Number(formData.selectedCompany))?.name 
          : null,
        isActive: formData.assignmentType === "assigned",
        status: formData.assignmentType === "assigned" ? "online" : "unassigned",
        lastUpdate: new Date().toISOString(),
        batteryLevel: 100,
        signalStrength: formData.assignmentType === "assigned" ? 95 : 0,
        location: formData.assignmentType === "assigned" ? { lat: 40.7128, lng: -74.0060 } : null,
        assignedDate: formData.assignmentType === "assigned" ? new Date().toISOString() : null,
        notes: formData.notes
      };

      onAddDevice?.(newDevice);
      handleClose();
    }
  };

  const selectedCompany = mockCompanies.find(c => c.id === Number(formData.selectedCompany));
  const availableVehicles = selectedCompany?.vehicles.filter(v => v.status === "active") || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Add New IOT Device
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3: {
              currentStep === 1 ? "Device Information" :
              currentStep === 2 ? "Assignment Settings" :
              "Review & Confirm"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-px ${
                    step < currentStep ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Device Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Device ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g., IOT006, GPS-DEV-001"
                  value={formData.objectId}
                  onChange={(e) => setFormData({...formData, objectId: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent ${
                    errors.objectId ? "border-red-500" : "border-input"
                  }`}
                />
                {errors.objectId && (
                  <p className="text-sm text-red-600 mt-1">{errors.objectId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Device Model *
                </label>
                <select
                  value={formData.deviceModel}
                  onChange={(e) => setFormData({...formData, deviceModel: e.target.value})}
                  className={`text-foreground bg-card w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent ${
                    errors.deviceModel ? "border-red-500" : "border-input"
                  }`}
                >
                  <option value="">Select a device model</option>
                  {deviceModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                {errors.deviceModel && (
                  <p className="text-sm text-red-600 mt-1">{errors.deviceModel}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium">GPS Tracking</h4>
                  <p className="text-sm text-muted-foreground">Real-time location</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium">Status Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Device health</p>
                </div>
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-medium">Alert System</h4>
                  <p className="text-sm text-muted-foreground">Instant notifications</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Assignment Settings */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Assignment Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.assignmentType === "unassigned" 
                        ? "border-primary bg-primary/5" 
                        : "border-input hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({...formData, assignmentType: "unassigned", selectedCompany: "", selectedVehicle: ""})}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium">Unassigned</h3>
                        <p className="text-sm text-muted-foreground">Add to inventory for later assignment</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.assignmentType === "assigned" 
                        ? "border-primary bg-primary/5" 
                        : "border-input hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({...formData, assignmentType: "assigned"})}
                  >
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">Assign to Vehicle</h3>
                        <p className="text-sm text-muted-foreground">Assign to a specific vehicle immediately</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {formData.assignmentType === "assigned" && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Company *
                    </label>
                    <select
                      value={formData.selectedCompany}
                      onChange={(e) => setFormData({...formData, selectedCompany: e.target.value, selectedVehicle: ""})}
                      className={`bg-background text-foreground w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent ${
                        errors.selectedCompany ? "border-red-500" : "border-input"
                      }`}
                    >
                      <option value="">Choose a company</option>
                      {mockCompanies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name} ({company.vehicles.filter(v => v.status === "active").length} active vehicles)
                        </option>
                      ))}
                    </select>
                    {errors.selectedCompany && (
                      <p className="text-sm text-red-600 mt-1">{errors.selectedCompany}</p>
                    )}
                  </div>

                  {formData.selectedCompany && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Vehicle *
                      </label>
                      <div className="space-y-2">
                        {availableVehicles.length > 0 ? (
                          availableVehicles.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                formData.selectedVehicle === vehicle.id.toString()
                                  ? "border-primary bg-primary/5"
                                  : "border-input hover:border-primary/50"
                              }`}
                              onClick={() => setFormData({...formData, selectedVehicle: vehicle.id.toString()})}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Car className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{vehicle.plate}</p>
                                    <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-green-600">
                                  {vehicle.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No active vehicles available for this company
                          </p>
                        )}
                      </div>
                      {errors.selectedVehicle && (
                        <p className="text-sm text-red-600 mt-1">{errors.selectedVehicle}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-3">Device Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Device ID</span>
                      <p className="font-medium">{formData.objectId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Model</span>
                      <p className="font-medium">{formData.deviceModel}</p>
                    </div>
                  </div>
                </div>
              </div>

              {formData.assignmentType === "assigned" && formData.selectedCompany && formData.selectedVehicle ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h3 className="font-medium mb-3">Assignment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Company</span>
                        <p className="font-medium">{selectedCompany?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Vehicle</span>
                        <p className="font-medium">
                          {availableVehicles.find(v => v.id === Number(formData.selectedVehicle))?.plate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium">Unassigned Device</h3>
                      <p className="text-sm text-muted-foreground">
                        This device will be added to inventory and can be assigned later
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any additional notes about this device..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="cursor-pointer">
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="cursor-pointer">
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={handleNext} className="cursor-pointer">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Device
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
