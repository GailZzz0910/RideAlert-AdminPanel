import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, ArrowRight, BarChart3, Shield, Star, Building, Code, Phone, MapPin, Upload, File, X, Route, Plus } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import BusAnimation from "../assets/Bus.json";
import { apiBaseURL } from "@/utils/api";

interface PlanFeature {
  name?: string;
}

interface SubscriptionPlan {
  id: string;
  plan_name: string;
  plan_code: string;
  price: number;
  max_vehicles: number;
  description: string;
  features: PlanFeature[];
  is_active: boolean;
}

interface Route {
  startLocation: string;
  endLocation: string;
  landmarkStart: string;
  landmarkEnd: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    companyName: "",
    companyCode: "",
    contactInfo: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showRouteSetup, setShowRouteSetup] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [routesCompleted, setRoutesCompleted] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false);
  const [newRoute, setNewRoute] = useState<Route>({
    startLocation: "",
    endLocation: "",
    landmarkStart: "",
    landmarkEnd: "",
  });

  // Fetch subscription plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await fetch(`${apiBaseURL}/subscription-plans/?active_only=true`);

        if (!response.ok) {
          throw new Error("Failed to fetch subscription plans");
        }

        const data = await response.json();
        setPlans(data);

        // Set the first plan as default
        if (data.length > 0) {
          setSelectedPlanCode(data[0].plan_code);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Failed to load subscription plans. Please refresh the page.");
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const originalLength = value.length;
      const phoneValue = value.replace(/[^0-9\s\(\)\-\+]/g, "");

      if (originalLength > phoneValue.length) {
        setPhoneError("Only numbers and phone formatting characters (+, -, (), spaces) are allowed");
        setTimeout(() => setPhoneError(""), 3000);
      } else {
        setPhoneError("");
      }

      setFormData(prev => ({ ...prev, [name]: phoneValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value.slice(-1);
    setOtpDigits(newOtpDigits);

    const combinedOtp = newOtpDigits.join("");
    setFormData(prev => ({ ...prev, otp: combinedOtp }));

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = Array(6).fill("").map((_, i) => pastedData[i] || "");
    setOtpDigits(newDigits);
    setFormData(prev => ({ ...prev, otp: newDigits.join("") }));

    const nextEmptyIndex = newDigits.findIndex(digit => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const sendOTP = async () => {
    if (!formData.email) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseURL}/auth/send-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to send verification code");
      }

      const data = await response.json();

      setOtpSent(true);
      setError("");
      setCurrentStep(2);

      if (data.debug_otp) {
        console.log("DEBUG - Verification Code:", data.debug_otp);
      }

      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseURL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          verification_code: formData.otp
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Invalid verification code");
      }

      setOtpVerified(true);
      setError("");
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.email) {
        setError("Please enter your email address.");
        return;
      }
      sendOTP();
    } else if (currentStep === 2) {
      verifyOTP();
    } else if (currentStep === 3) {
      if (!formData.companyName || !formData.companyCode || !formData.contactInfo || !formData.phone || !formData.address || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all required fields.");
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
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (uploadedFiles.length === 0) {
        setError("Please upload at least one business permit or validation document.");
        return;
      }

      setError("");
      setCurrentStep(5);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setOtpSent(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setFormData(prev => ({ ...prev, otp: "" }));
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      const maxSize = 10 * 1024 * 1024;

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
      const formDataWithFiles = new FormData();

      // Prepare payload matching FleetCreate schema
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
        subscription_plan: selectedPlanCode,
        email_verified: otpVerified,
      };

      console.log("Sending payload:", payload);

      formDataWithFiles.append("data", JSON.stringify(payload));

      uploadedFiles.forEach((file) => {
        formDataWithFiles.append("business_documents", file);
      });

      if (uploadedFiles.length === 0) {
        setError("Please upload at least one document");
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiBaseURL}/fleets/`, {
        method: "POST",
        body: formDataWithFiles,
      });

      if (!res.ok) {
        let errorMessage = "Failed to register fleet";
        try {
          const errData = await res.json();
          errorMessage = errData.detail || errorMessage;
        } catch (parseError) {
          errorMessage = res.statusText || errorMessage;
        }

        console.error("Server error:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("Registration successful:", result);

      setCompanyId(result.company_code || formData.companyCode);
      setRegistrationComplete(true);
      setShowRouteSetup(true);
    } catch (err: any) {
      if (err.message.includes("CORS") || err.message.includes("Failed to fetch")) {
        setCompanyId(formData.companyCode);
        setRegistrationComplete(true);
        setShowRouteSetup(true);
        setError("Registration completed! Please set up your routes.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = () => {
    if (!newRoute.startLocation || !newRoute.endLocation || !newRoute.landmarkStart || !newRoute.landmarkEnd) {
      setError("Please fill in all fields.");
      return;
    }

    setRoutes(prev => [...prev, { ...newRoute }]);
    setNewRoute({
      startLocation: "",
      endLocation: "",
      landmarkStart: "",
      landmarkEnd: "",
    });
    setIsAddRouteDialogOpen(false);
    setError("");
  };

  const handleNewRouteChange = (field: keyof Route, value: string) => {
    setNewRoute(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveRoute = (index: number) => {
    setRoutes(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinishRoutes = async () => {
    if (routes.length === 0) {
      setError("Please add at least one route before continuing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Starting route registration for company code:", companyId);

      const routePromises = routes.map(async (route, index) => {
        const routeData = new FormData();

        routeData.append("company_code", companyId);
        routeData.append("start_location", route.startLocation);
        routeData.append("end_location", route.endLocation);
        routeData.append("landmark_details_start", route.landmarkStart || "");
        routeData.append("landmark_details_end", route.landmarkEnd || "");

        const response = await fetch(`${apiBaseURL}/declared_routes/route-register-public`, {
          method: "POST",
          body: routeData,
        });

        if (!response.ok) {
          throw new Error(`Failed to save route ${index + 1}`);
        }

        return await response.json();
      });

      await Promise.all(routePromises);

      setRoutesCompleted(true);
      setError(`Success! ${routes.length} route${routes.length !== 1 ? "s" : ""} registered. Your account is pending admin approval.`);
    } catch (err: any) {
      console.error("Error saving routes:", err);
      setError(err.message || "Failed to save routes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showRouteSetup) {
    return (
      <div className="min-h-screen w-full bg-black relative">
        <div className="absolute inset-0 -z-10 [background-size:40px_40px] [background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                    Join thousands of companies that trust RideAlert for vehicle tracking and management.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((step, idx) => (
                        <React.Fragment key={step}>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}>
                            {step}
                          </div>
                          {idx < 4 && <div className={`w-8 h-0.5 ${currentStep >= step + 1 ? "bg-blue-600" : "bg-gray-700"}`}></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {currentStep === 1 && (
                    <Card className="bg-black/40 backdrop-blur-xl border-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Enter Your Email</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          We'll send you a verification code to get started
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
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

                          {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                          )}

                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 cursor-pointer disabled:opacity-50"
                          >
                            {loading ? "Sending Code..." : "Send Code"}
                          </Button>

                          <div className="text-center pt-4">
                            <span className="text-gray-400 text-sm">Already have an account? </span>
                            <a href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                              Sign in
                            </a>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {currentStep === 2 && (
                    <Card className="bg-black/40 backdrop-blur-xl border-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Verify Your Email</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          We've sent a code to {formData.email}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white text-sm font-medium text-center block">
                              Verification Code
                            </Label>
                            <div className="flex justify-center gap-3">
                              {otpDigits.map((digit, index) => (
                                <Input
                                  key={index}
                                  id={`otp-${index}`}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(index, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                  onPaste={handleOtpPaste}
                                  className="w-12 h-12 text-center text-xl font-bold text-white bg-white/10 border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                                  autoComplete="off"
                                />
                              ))}
                            </div>
                          </div>

                          {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                          )}

                          <div className="flex gap-3 mt-6">
                            <Button
                              type="button"
                              onClick={handlePrevStep}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              disabled={loading || formData.otp.length !== 6}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                            >
                              {loading ? "Verifying..." : "Continue"}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {currentStep === 3 && (
                    <Card className="bg-black/40 backdrop-blur-xl border-none max-h-[85vh] overflow-y-auto">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Company Details</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          Enter your company information and password
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-white text-sm font-medium">Company Name</Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="companyName"
                                name="companyName"
                                placeholder="Your Company Ltd."
                                value={formData.companyName}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="companyCode" className="text-white text-sm font-medium">Company Code</Label>
                            <div className="relative">
                              <Code className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="companyCode"
                                name="companyCode"
                                placeholder="COMP123"
                                value={formData.companyCode}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contactInfo" className="text-white text-sm font-medium">Contact Person</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="contactInfo"
                                name="contactInfo"
                                placeholder="John Doe"
                                value={formData.contactInfo}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white text-sm font-medium">Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="phone"
                                name="phone"
                                placeholder="0912 345 6789"
                                value={formData.phone}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20"
                                required
                              />
                            </div>
                            {phoneError && <div className="text-red-400 text-xs">{phoneError}</div>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address" className="text-white text-sm font-medium">Address</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="address"
                                name="address"
                                placeholder="123 Main St, City"
                                value={formData.address}
                                onChange={handleChange}
                                className="pl-10 text-white bg-white/10 border-white/20"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-10 pr-10 text-white bg-white/10 border-white/20"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400"
                                tabIndex={-1}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">Confirm Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="pl-10 pr-10 text-white bg-white/10 border-white/20"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-400"
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                          )}

                          <div className="flex gap-3 mt-6">
                            <Button
                              type="button"
                              onClick={handlePrevStep}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                              Continue
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {currentStep === 4 && (
                    <Card className="bg-black/40 backdrop-blur-xl border-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Business Validation</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          Upload your business permit or validation documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                          <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                              dragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600"
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                          >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <div className="text-white font-medium mb-2">Drag files here or click</div>
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
                              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                              onClick={() => document.getElementById('file-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Files
                            </Button>
                            <div className="text-xs text-gray-500 mt-2">
                              PDF, JPEG, PNG (Max 10MB each)
                            </div>
                          </div>

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
                                        <div className="text-white text-sm">{file.name}</div>
                                        <div className="text-gray-400 text-xs">
                                          {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(index)}
                                      className="text-red-400 hover:text-red-300 cursor-pointer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                          )}

                          <div className="flex gap-3 mt-6">
                            <Button
                              type="button"
                              onClick={handlePrevStep}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                              Back
                            </Button>
                            <Button
                              type="button"
                              onClick={handleNextStep}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentStep === 5 && (
                    <Card className="bg-black/40 backdrop-blur-xl border-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl text-center">Choose Your Plan</CardTitle>
                        <CardDescription className="text-gray-400 text-center text-sm">
                          Select the subscription plan for your fleet
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                          {plansLoading ? (
                            <div className="text-center py-8">
                              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                              <p className="text-gray-400 mt-2">Loading plans...</p>
                            </div>
                          ) : plans.length === 0 ? (
                            <div className="text-center py-8 text-red-400">
                              No subscription plans available
                            </div>
                          ) : (
                            plans.map((plan) => (
                              <div
                                key={plan.id}
                                className={`relative cursor-pointer transition-all p-4 rounded-lg border ${
                                  selectedPlanCode === plan.plan_code
                                    ? "bg-blue-600/20 border-blue-500"
                                    : "bg-white/5 border-gray-800/50 hover:border-gray-700"
                                }`}
                                onClick={() => setSelectedPlanCode(plan.plan_code)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        selectedPlanCode === plan.plan_code ? "bg-blue-600" : "bg-gray-800"
                                      }`}
                                    >
                                      <BarChart3 className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                      <h3 className="text-white font-semibold">{plan.plan_name}</h3>
                                      <p className="text-gray-400 text-sm">{plan.description}</p>
                                      <p className="text-blue-400 text-sm">
                                        {plan.max_vehicles === -1 ? "Unlimited vehicles" : `Up to ${plan.max_vehicles} vehicles`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                                    <span className="text-gray-400 text-sm">/month</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {error && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                          </div>
                        )}

                        <div className="flex gap-3 mt-6">
                          <Button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            disabled={loading || !selectedPlanCode}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                          >
                            {loading ? "Creating..." : "Create Account"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <p className="text-center text-gray-500 text-xs mt-6 px-4">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black relative">
      <div className="absolute inset-0 -z-10 [background-size:40px_40px] [background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative z-10 fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="bg-black/90 backdrop-blur-xl border-none w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
              <Route className="w-6 h-6 text-blue-400" />
              Set Up Your Routes
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Add your transportation routes to complete registration
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium text-sm mb-2">Why set up routes?</h3>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Define your service coverage areas</li>
                  <li>• Enable accurate vehicle tracking</li>
                  <li>• Help admins understand your business</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Your Routes ({routes.length})</h3>
                  <Button
                    onClick={() => setIsAddRouteDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Route
                  </Button>
                </div>

                {routes.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                    <Route className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No routes added yet</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {routes.map((route, index) => (
                      <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-green-400" />
                              <span className="text-white font-medium">From:</span>
                              <span className="text-gray-300">{route.startLocation}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-red-400" />
                              <span className="text-white font-medium">To:</span>
                              <span className="text-gray-300">{route.endLocation}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveRoute(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className={`border rounded-lg p-4 ${
                  routesCompleted
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}>
                  <p className={`text-sm font-medium ${routesCompleted ? "text-green-400" : "text-red-400"}`}>
                    {routesCompleted && "✓ "}
                    {error}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {!routesCompleted ? (
                  <Button
                    onClick={handleFinishRoutes}
                    disabled={loading || routes.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Saving..." : `Continue with ${routes.length} route${routes.length !== 1 ? 's' : ''}`}
                  </Button>
                ) : (
                  <Button
                    onClick={() => (window.location.href = '/')}
                    className="flex-1 bg-blue-700 hover:bg-blue-500 text-white cursor-pointer"
                  >
                    Go to Login
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isAddRouteDialogOpen && (
          <div className="fixed inset-0 bg-black/50 z-10 flex items-center justify-center p-4">
            <Card className="bg-black/95 backdrop-blur-xl border-none w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Add New Route</CardTitle>
                <CardDescription className="text-gray-400">
                  Define the start and end points of your route
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Start Location</Label>
                  <Input
                    value={newRoute.startLocation}
                    onChange={(e) => handleNewRouteChange('startLocation', e.target.value)}
                    placeholder="Enter start location"
                    className="text-white bg-white/10 border-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">End Location</Label>
                  <Input
                    value={newRoute.endLocation}
                    onChange={(e) => handleNewRouteChange('endLocation', e.target.value)}
                    placeholder="Enter end location"
                    className="text-white bg-white/10 border-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Landmark (Start)</Label>
                  <textarea
                    value={newRoute.landmarkStart}
                    onChange={(e) => handleNewRouteChange('landmarkStart', e.target.value)}
                    placeholder="Enter landmark at start"
                    className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none text-white"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Landmark (End)</Label>
                  <textarea
                    value={newRoute.landmarkEnd}
                    onChange={(e) => handleNewRouteChange('landmarkEnd', e.target.value)}
                    placeholder="Enter landmark at end"
                    className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none text-white"
                    rows={2}
                  />
                </div>

                {error && currentStep === undefined && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAddRoute}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Route
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAddRouteDialogOpen(false);
                      setNewRoute({
                        startLocation: "",
                        endLocation: "",
                        landmarkStart: "",
                        landmarkEnd: "",
                      });
                    }}
                    className="flex-1 border border-gray-600 text-white bg-transparent hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}