import React, { useState } from "react";
import { Eye, EyeOff, Car, Mail, Lock, User, Check, ArrowLeft, ArrowRight, BarChart3, Shield, Zap, Star, Building, Code, Phone, MapPin, Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
import NavBar from "../components/ui/nav-bar";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import BusAnimation from "../assets/Bus.json";
import { apiBaseURL } from "@/utils/api";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxVehicles: number;
  popular?: boolean;
  description: string;
  features: PlanFeature[];
  icon: React.ReactNode;
}

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    companyCode: "",
    contactInfo: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 29,
      maxVehicles: 5,
      description: "Perfect for small fleets and startups",
      icon: <Car className="w-5 h-5" />,
      features: [
        { name: "Real-time GPS tracking", included: true },
        { name: "Basic reporting", included: true },
        { name: "Mobile app access", included: true },
        { name: "Email notifications", included: true },
        { name: "Up to 5 vehicles", included: true },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
        { name: "Custom integrations", included: false },
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 79,
      maxVehicles: 50,
      popular: true,
      description: "Ideal for growing businesses",
      icon: <BarChart3 className="w-5 h-5" />,
      features: [
        { name: "Real-time GPS tracking", included: true },
        { name: "Advanced reporting & analytics", included: true },
        { name: "Mobile app access", included: true },
        { name: "SMS & email notifications", included: true },
        { name: "Up to 50 vehicles", included: true },
        { name: "Route optimization", included: true },
        { name: "Driver behavior monitoring", included: true },
        { name: "Priority support", included: false },
        { name: "Custom integrations", included: false },
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 199,
      maxVehicles: -1,
      description: "For large fleets and enterprises",
      icon: <Shield className="w-5 h-5" />,
      features: [
        { name: "Real-time GPS tracking", included: true },
        { name: "Advanced reporting & analytics", included: true },
        { name: "Mobile app access", included: true },
        { name: "SMS & email notifications", included: true },
        { name: "Unlimited vehicles", included: true },
        { name: "Route optimization", included: true },
        { name: "Driver behavior monitoring", included: true },
        { name: "24/7 priority support", included: true },
        { name: "Custom integrations", included: true },
        { name: "White-label solutions", included: true },
        { name: "Dedicated account manager", included: true },
      ]
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate first step - Company Information
      if (!formData.companyName || !formData.companyCode || !formData.contactInfo || !formData.phone || !formData.address) {
        setError("Please fill in all company information fields.");
        return;
      }

      setError("");
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate second step - Account Credentials
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all account credential fields.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }

      setError("");
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validate third step - Business Permit Upload
      if (uploadedFiles.length === 0) {
        setError("Please upload at least one business permit or validation document.");
        return;
      }

      setError("");
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        setError("Only PDF, JPEG, and PNG files are allowed.");
        return false;
      }
      
      if (file.size > maxSize) {
        setError("File size must be less than 10MB.");
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setError("");
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create FormData to handle file uploads
      const formDataWithFiles = new FormData();
      
      const payload = {
        company_name: formData.companyName,
        company_code: formData.companyCode,
        contact_info: [
          {
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          },
        ],
        password: formData.password,
        subscription_plan:
          selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1), // e.g. "Premium"
      };

      // Add the main payload
      formDataWithFiles.append('data', JSON.stringify(payload));
      
      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formDataWithFiles.append(`business_documents`, file);
      });

      const res = await fetch(`${apiBaseURL}/fleets/`, {
        method: "POST",
        body: formDataWithFiles, // Send FormData instead of JSON
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to register fleet");
      }

      // Success → redirect to login
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative">
      {/* Modern Grid Background */}
      <div
        className={`
          absolute inset-0 -z-10
          [background-size:40px_40px]
          [background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]
        `}
      />
      {/* Radial Mask for Depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative z-10">
        {/* Main Content Grid */}
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Bus Animation */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-lg">
                  <Lottie
                    animationData={BusAnimation}
                    loop={true}
                    autoplay={true}
                    className="w-full h-auto"
                    style={{ maxWidth: "500px", maxHeight: "400px" }}
                  />
                </div>
                <div className="text-center mt-8 max-w-md">
                  <p className="text-gray-400 text-lg">
                    Join thousands of companies that trust RideAlert for their vehicle tracking and management needs.
                  </p>
                </div>
              </div>

              {/* Right Side - Registration Form */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">

                  {/* Step Indicator */}
                  <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                        }`}>
                        1
                      </div>
                      <div className={`w-12 h-0.5 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-700"}`}></div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                        }`}>
                        2
                      </div>
                      <div className={`w-12 h-0.5 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-700"}`}></div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                        }`}>
                        3
                      </div>
                      <div className={`w-12 h-0.5 ${currentStep >= 4 ? "bg-blue-600" : "bg-gray-700"}`}></div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 4 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                        }`}>
                        4
                      </div>
                    </div>
                  </div>

                  {currentStep === 1 ? (
                    // Step 1: Company Information
                    <Card className="bg-black/40 backdrop-blur-xl border-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Company Information</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          Enter your company details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                          {/* Company Name Field */}
                          <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-white text-sm font-medium">
                              Company Name
                            </Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="companyName"
                                name="companyName"
                                type="text"
                                placeholder="Your Company Ltd."
                                value={formData.companyName}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                required
                              />
                            </div>
                          </div>

                          {/* Company Code Field */}
                          <div className="space-y-2">
                            <Label htmlFor="companyCode" className="text-white text-sm font-medium">
                              Company Code
                            </Label>
                            <div className="relative">
                              <Code className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="companyCode"
                                name="companyCode"
                                type="text"
                                placeholder="COMP123"
                                value={formData.companyCode}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                required
                              />
                            </div>
                          </div>

                          {/* Contact Info Field */}
                          <div className="space-y-2">
                            <Label htmlFor="contactInfo" className="text-white text-sm font-medium">
                              Contact Person
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="contactInfo"
                                name="contactInfo"
                                type="text"
                                placeholder="John Doe"
                                value={formData.contactInfo}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                required
                              />
                            </div>
                          </div>

                          {/* Phone Field */}
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white text-sm font-medium">
                              Phone Number
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={formData.phone}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                required
                              />
                            </div>
                          </div>

                          {/* Address Field */}
                          <div className="space-y-2">
                            <Label htmlFor="address" className="text-white text-sm font-medium">
                              Address
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="address"
                                name="address"
                                type="text"
                                placeholder="123 Main St, City, State, ZIP"
                                value={formData.address}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                required
                              />
                            </div>
                          </div>

                          {/* Error Message */}
                          {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                          )}

                          {/* Next Button */}
                          <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                          >
                            <div className="flex items-center justify-center gap-2">
                              Continue
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </Button>

                          {/* Login Link */}
                          <div className="text-center pt-4">
                            <span className="text-gray-400 text-sm">Already have an account? </span>
                            <a
                              href="/"
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline transition-colors"
                            >
                              Sign in
                            </a>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  ) : currentStep === 2 ? (
                    // Step 2: Account Credentials
                    <Card className="bg-black/40 backdrop-blur-xl border-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Account Credentials</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          Set up your login credentials
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                          {/* Email Field */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-white text-sm font-medium">
                              Email Address
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                required
                              />
                            </div>
                          </div>

                          {/* Password Field */}
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-white text-sm font-medium">
                              Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-10 pr-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                required
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Confirm Password Field */}
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="pl-10 pr-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                required
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Error Message */}
                          {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                          )}

                          <div className="flex gap-3 mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePrevStep}
                              className="flex-1 border-gray-700 text-white hover:bg-gray-400 cursor-pointer"
                            >

                              Back
                            </Button>

                            <Button
                              type="submit"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                            >
                              <div className="flex items-center justify-center gap-2">
                                Continue

                              </div>
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  ) : currentStep === 3 ? (
                    // Step 3: Business Permit Upload
                    <Card className="bg-black/40 backdrop-blur-xl border-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Business Validation</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          Upload your business permit or validation documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                          {/* File Upload Area */}
                          <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                              dragActive 
                                ? "border-blue-500 bg-blue-500/10" 
                                : "border-gray-600 hover:border-gray-500"
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                          >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <div className="text-white font-medium mb-2">
                              Drag and drop your files here
                            </div>
                            <div className="text-gray-400 text-sm mb-4">
                              or click to browse
                            </div>
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(e.target.files)}
                              className="hidden"
                              id="file-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="border-gray-600 text-white hover:bg-gray-700 cursor-pointer"
                              onClick={() => document.getElementById('file-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Files
                            </Button>
                            <div className="text-xs text-gray-500 mt-2">
                              Supported formats: PDF, JPEG, PNG (Max 10MB each)
                            </div>
                          </div>

                          {/* Uploaded Files List */}
                          {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-white text-sm font-medium">
                                Uploaded Documents ({uploadedFiles.length})
                              </Label>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <File className="w-4 h-4 text-blue-400" />
                                      <div>
                                        <div className="text-white text-sm font-medium">{file.name}</div>
                                        <div className="text-gray-400 text-xs">
                                          {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(index)}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Requirements Info */}
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="text-blue-400 font-medium text-sm mb-2">
                              Required Documents:
                            </div>
                            <ul className="text-blue-300 text-xs space-y-1">
                              <li>• Business permit or registration certificate</li>
                              <li>• Tax identification document</li>
                              <li>• Operating license (if applicable)</li>
                              <li>• Other relevant business validation documents</li>
                            </ul>
                          </div>

                          {/* Error Message */}
                          {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                          )}

                          <div className="flex gap-3 mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePrevStep}
                              className="flex-1 border-gray-700 text-white hover:bg-gray-400 cursor-pointer"
                            >
                              Back
                            </Button>

                            <Button
                              type="button"
                              onClick={handleNextStep}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                            >
                              <div className="flex items-center justify-center gap-2">
                                Continue
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // Step 4: Subscription Selection
                    <Card className="bg-black/40 backdrop-blur-xl border-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Choose Your Plan</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          Select the perfect plan for your needs
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                          {plans.map((plan) => (
                            <div
                              key={plan.id}
                              className={`relative cursor-pointer transition-all duration-300 p-4 rounded-lg border ${selectedPlan === plan.id
                                ? "bg-blue-600/20 border-blue-500"
                                : "bg-white/5 border-gray-800/50 hover:border-gray-700"
                                }`}
                              onClick={() => setSelectedPlan(plan.id)}
                            >
                              {plan.popular && (
                                <div className="absolute -top-2 left-4">
                                  <Badge className="bg-blue-600 text-white px-2 py-1 text-xs flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    Most Popular
                                  </Badge>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedPlan === plan.id ? "bg-blue-600" : "bg-gray-800"
                                    }`}>
                                    <div className="text-white">
                                      {plan.icon}
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-white font-semibold">{plan.name}</h3>
                                    <p className="text-gray-400 text-sm">{plan.description}</p>
                                    <p className="text-blue-400 text-sm">
                                      {plan.maxVehicles === -1 ? "Unlimited vehicles" : `Up to ${plan.maxVehicles} vehicles`}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-2xl font-bold text-white">
                                    ${plan.price}
                                  </span>
                                  <span className="text-gray-400 text-sm">/month</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevStep}
                            className="flex-1 border-gray-700 text-white hover:bg-gray-400 cursor-pointer"
                          >

                            Back
                          </Button>

                          <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                          >
                            {loading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Creating...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">

                                Create Account
                              </div>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Terms & Privacy */}
                  <p className="text-center text-gray-500 text-xs mt-6 px-4">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
