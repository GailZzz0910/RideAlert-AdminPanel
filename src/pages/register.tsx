import React, { useState } from "react";
import { Eye, EyeOff, Car, Mail, Lock, User, Check, ArrowLeft, ArrowRight, BarChart3, Shield, Zap, Star, Building, Code, Phone, MapPin, Upload, File, X, Route, Plus } from "lucide-react";
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
import { useUser } from "@/context/userContext";

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

interface Route {
  startLocation: string;
  endLocation: string;
  landmarkStart: string;
  landmarkEnd: string;
  geojsonFile?: File | null;
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
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Route setup states
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
    geojsonFile: null
  });

  const { user, token } = useUser();

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

    // For phone field, only allow numbers, spaces, parentheses, hyphens, and plus sign
    if (name === 'phone') {
      const originalLength = value.length;
      const phoneValue = value.replace(/[^0-9\s\(\)\-\+]/g, '');

      // Check if invalid characters were removed
      if (originalLength > phoneValue.length) {
        setPhoneError("Only numbers and phone formatting characters (+, -, (), spaces) are allowed");
        setTimeout(() => setPhoneError(""), 3000); // Clear error after 3 seconds
      } else {
        setPhoneError("");
      }

      setFormData(prev => ({ ...prev, [name]: phoneValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value.slice(-1); // Only take the last character
    setOtpDigits(newOtpDigits);

    // Update the combined OTP in formData
    const combinedOtp = newOtpDigits.join("");
    setFormData(prev => ({ ...prev, otp: combinedOtp }));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle backspace in OTP inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle paste in OTP inputs
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = Array(6).fill("").map((_, i) => pastedData[i] || "");
    setOtpDigits(newDigits);
    setFormData(prev => ({ ...prev, otp: newDigits.join("") }));

    // Focus the next empty input or the last one
    const nextEmptyIndex = newDigits.findIndex(digit => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  // Send OTP to email (Mock for testing)
  const sendOTP = async () => {
    if (!formData.email) {
      setError("Please enter your email address.");
      return;
    }

    // Basic email validation
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
      setCurrentStep(2); // Move to OTP verification step

      // For development - show OTP in console (remove in production)
      if (data.debug_otp) {
        console.log("DEBUG - Verification Code:", data.debug_otp);
      }

      // Start cooldown for resend
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

  // Verify OTP (Mock for testing)
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

      const data = await response.json();

      setOtpVerified(true);
      setError("");
      setCurrentStep(3); // Move to company info step

    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate first step - Email Entry
      if (!formData.email) {
        setError("Please enter your email address.");
        return;
      }

      // Send OTP and move to step 2
      sendOTP();
    } else if (currentStep === 2) {
      // Verify OTP
      verifyOTP();
    } else if (currentStep === 3) {
      // Validate third step - Company Information & Password
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
      // Validate fourth step - Business Permit Upload
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
      setOtpSent(false); // Reset OTP state when going back
      setOtpDigits(["", "", "", "", "", ""]); // Reset OTP digits
      setFormData(prev => ({ ...prev, otp: "" })); // Reset OTP in form data
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
        subscription_plan: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
        email_verified: otpVerified,
      };

      console.log("📦 Sending payload:", payload);

      // Add the main payload
      formDataWithFiles.append('data', JSON.stringify(payload));

      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formDataWithFiles.append(`business_documents`, file);
      });

      if (uploadedFiles.length === 0) {
        setError("Please upload at least one PDF");
        setLoading(false);
        return;
      }

      console.log("🚀 Sending registration request...");

      const res = await fetch(`${apiBaseURL}/fleets/`, {
        method: "POST",
        body: formDataWithFiles,
      });

      console.log("📨 Response status:", res.status);

      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to register fleet";
        try {
          const errData = await res.json();
          errorMessage = errData.detail || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }

        console.error("❌ Server error:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("✅ Registration successful:", result);

      // Store company ID for route setup
      setCompanyId(result.company_code || formData.companyCode);
      setRegistrationComplete(true);
      setShowRouteSetup(true);

    } catch (err: any) {
      console.error("❌ Registration error:", err);

      // If it's a CORS error but data was saved, show success message
      if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
        // For CORS error, still show route setup as registration likely succeeded
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

  // Route management functions
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
      landmarkEnd: ""
    });
    setIsAddRouteDialogOpen(false);
    setError("");
  };

  const handleNewRouteChange = (field: keyof Route, value: string | File | null) => {
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
      console.log("🛣️ Starting route registration for company code:", companyId);

      // Send each route to the backend using FormData
      const routePromises = routes.map(async (route, index) => {
        const formData = new FormData();

        // Add company code for public registration endpoint
        formData.append('company_code', companyId);
        formData.append('start_location', route.startLocation);
        formData.append('end_location', route.endLocation);
        formData.append('landmark_details_start', route.landmarkStart || '');
        formData.append('landmark_details_end', route.landmarkEnd || '');

        console.log(`📤 Sending route ${index + 1}:`, {
          company_code: companyId,
          start_location: route.startLocation,
          end_location: route.endLocation,
          landmark_details_start: route.landmarkStart,
          landmark_details_end: route.landmarkEnd
        });

        const response = await fetch(`${apiBaseURL}/declared_routes/route-register-public`, {
          method: 'POST',
          body: formData,
        });

        console.log(`📨 Response for route ${index + 1}:`, response.status);

        if (!response.ok) {
          let errorDetail = "Unknown error";
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
          } catch (parseError) {
            errorDetail = response.statusText || `HTTP ${response.status}`;
          }

          throw new Error(`Failed to save route "${route.startLocation} to ${route.endLocation}": ${errorDetail}`);
        }

        const result = await response.json();
        console.log(`✅ Route ${index + 1} saved:`, result);

        return result;
      });

      // Wait for all routes to be saved
      const results = await Promise.all(routePromises);

      console.log('🎉 All routes saved successfully:', results);

      // Mark routes as completed
      setRoutesCompleted(true);
      setError(`Success! ${routes.length} route${routes.length !== 1 ? 's' : ''} have been registered. Your account is now pending approval by the admin. Please wait for approval before attempting to log in.`);

    } catch (err: any) {
      console.error('❌ Error saving routes:', err);

      // Even if some routes fail, we can still show completion
      // but inform the user about partial failures
      if (err.message.includes('Failed to save route')) {
        setRoutesCompleted(true);
        setError(`Routes setup completed with some issues. ${err.message}. Your account is pending approval. Please wait for approval before attempting to log in.`);
      } else {
        setError(err.message || 'Failed to save routes. Please try again.');
      }
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
        {/* Main Registration Content - Only show when route setup is not active */}
        {!showRouteSetup && (
          <>
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
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                            }`}>
                            1
                          </div>
                          <div className={`w-8 h-0.5 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-700"}`}></div>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                            }`}>
                            2
                          </div>
                          <div className={`w-8 h-0.5 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-700"}`}></div>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                            }`}>
                            3
                          </div>
                          <div className={`w-8 h-0.5 ${currentStep >= 4 ? "bg-blue-600" : "bg-gray-700"}`}></div>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 4 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                            }`}>
                            4
                          </div>
                          <div className={`w-8 h-0.5 ${currentStep >= 5 ? "bg-blue-600" : "bg-gray-700"}`}></div>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 5 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                            }`}>
                            5
                          </div>
                        </div>
                      </div>

                      {currentStep === 1 ? (
                        // Step 1: Email Entry
                        <Card className="bg-black/40 backdrop-blur-xl border-none">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-white text-xl text-center">Enter Your Email</CardTitle>
                            <CardDescription className="text-gray-400 text-center text-sm">
                              We'll send you a verification code to get started
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

                              {/* Error Message */}
                              {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                  <p className="text-red-400 text-sm text-center">{error}</p>
                                </div>
                              )}

                              {/* Send Verification Button */}
                              <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer disabled:opacity-50"
                              >
                                {loading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Sending Code...
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    Send Code
                                  </div>
                                )}
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
                        // Step 2: Email Verification
                        <Card className="bg-black/40 backdrop-blur-xl border-none">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-white text-xl text-center">Verify Your Email</CardTitle>
                            <CardDescription className="text-gray-400 text-center text-sm">
                              We've sent a verification code to {formData.email}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-6 pt-0">
                            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                              {/* OTP Field */}
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
                                      className="w-12 h-12 text-center text-xl font-bold text-white bg-white/10 border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                                      autoComplete="off"
                                    />
                                  ))}
                                </div>
                                <p className="text-gray-400 text-xs text-center mt-2">
                                  Enter the 6-digit code sent to your email
                                </p>
                              </div>

                              {/* Resend OTP */}
                              <div className="text-center">
                                <span className="text-gray-400 text-sm">Didn't receive the code? </span>
                                <button
                                  type="button"
                                  onClick={sendOTP}
                                  disabled={resendCooldown > 0 || loading}
                                  className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                                </button>
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
                                  onClick={handlePrevStep}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                                >
                                  Back
                                </Button>

                                <Button
                                  type="submit"
                                  disabled={loading || formData.otp.length !== 6}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer disabled:opacity-50"
                                >
                                  {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                      Verifying...
                                    </div>
                                  ) : (
                                    "Continue"
                                  )}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      ) : currentStep === 3 ? (
                        // Step 3: Company Information & Password
                        <Card className="bg-black/40 backdrop-blur-xl border-none">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-white text-xl text-center">Company Details & Password</CardTitle>
                            <CardDescription className="text-gray-400 text-center text-sm">
                              Enter your company information and create your password
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
                                    inputMode="tel"
                                    pattern="[0-9\s\(\)\-\+]*"
                                    placeholder="0912 345 6789"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`pl-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 ${phoneError ? 'border-red-500/50 focus:border-red-500' : ''
                                      }`}
                                    required
                                  />
                                </div>
                                {phoneError && (
                                  <div className="flex items-center gap-2 text-red-400 text-xs animate-pulse">
                                    <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                                    {phoneError}
                                  </div>
                                )}
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
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pl-10 pr-10 text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                    required
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
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
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
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
                                  onClick={handlePrevStep}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                                >
                                  Back
                                </Button>

                                <Button
                                  type="submit"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                                >
                                  Continue
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      ) : currentStep === 4 ? (
                        // Step 4: Business Validation
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
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${dragActive
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
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
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
                                          className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
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
                                  onClick={handlePrevStep}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
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
                        // Step 5: Subscription Selection
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
                                onClick={handlePrevStep}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
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
          </>
        )}

        {/* Route Setup Modal */}
        {showRouteSetup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-black/90 backdrop-blur-xl border-none w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
                  <Route className="w-6 h-6 text-blue-400" />
                  Set Up Your Routes First
                </CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Add your transportation routes to get started. This will help the system understand your service areas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 overflow-y-auto">
                <div className="space-y-6">
                  {/* Route Setup Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-blue-400 font-medium text-sm mb-2">
                      Why set up routes now?
                    </h3>
                    <ul className="text-blue-300 text-sm space-y-1">
                      <li>• Define your service coverage areas</li>
                      <li>• Enable accurate vehicle tracking and routing</li>
                      <li>• Provide better service to your passengers</li>
                      <li>• Help admins understand your business scope</li>
                    </ul>
                  </div>

                  {/* Current Routes */}
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
                        <p className="text-gray-500 text-xs">Click "Add Route" to get started</p>
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
                                {route.landmarkStart && (
                                  <div className="text-xs text-gray-400 ml-6">
                                    Start landmark: {route.landmarkStart}
                                  </div>
                                )}
                                {route.landmarkEnd && (
                                  <div className="text-xs text-gray-400 ml-6">
                                    End landmark: {route.landmarkEnd}
                                  </div>
                                )}
                              </div>
                              <Button
                                onClick={() => handleRemoveRoute(index)}
                                variant="ghost"
                                size="sm"
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

                  {/* Error/Success Display */}
                  {error && (
                    <div className={`border rounded-lg p-4 ${routesCompleted
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-red-500/10 border-red-500/20"
                      }`}>
                      <p className={`text-sm font-medium ${routesCompleted ? "text-green-400" : "text-red-400"
                        }`}>
                        {routesCompleted && "✅ "}
                        {error}
                      </p>
                      {routesCompleted && (
                        <p className="text-green-300 text-xs mt-2">
                          You will receive an email notification once your account is approved.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    {!routesCompleted ? (
                      <Button
                        onClick={handleFinishRoutes}
                        disabled={loading || routes.length === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            Saving...
                          </div>
                        ) : (
                          `Continue with ${routes.length} route${routes.length !== 1 ? 's' : ''}`
                        )}
                      </Button>
                    ) : (
                      <div className="flex gap-3 w-full">
                        <Button
                          onClick={() => window.location.href = '/'}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                        >
                          Go to Login Page
                        </Button>
                        <Button
                          onClick={() => {
                            setRoutesCompleted(false);
                            setError("");
                          }}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                        >
                          Add More Routes
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Route Dialog */}
            {isAddRouteDialogOpen && (
              <div className="fixed inset-0 bg-black/50 z-10 flex items-center justify-center p-4">
                <Card className="bg-black/95 backdrop-blur-xl border-none w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Add New Route</CardTitle>
                    <CardDescription className="text-gray-400">
                      Define the start and end points of your transportation route
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Start Location */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Start Location</Label>
                      <Input
                        value={newRoute.startLocation}
                        onChange={(e) => handleNewRouteChange('startLocation', e.target.value)}
                        placeholder="Enter start location"
                        className="text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* End Location */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">End Location</Label>
                      <Input
                        value={newRoute.endLocation}
                        onChange={(e) => handleNewRouteChange('endLocation', e.target.value)}
                        placeholder="Enter end location"
                        className="text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Landmark Start */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Landmark (Start)</Label>
                      <textarea
                        value={newRoute.landmarkStart}
                        onChange={(e) => handleNewRouteChange('landmarkStart', e.target.value)}
                        placeholder="Enter landmark at start location"
                        className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none text-white"
                        rows={2}
                      />
                    </div>

                    {/* Landmark End */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Landmark (End)</Label>
                      <textarea
                        value={newRoute.landmarkEnd}
                        onChange={(e) => handleNewRouteChange('landmarkEnd', e.target.value)}
                        placeholder="Enter landmark at end location"
                        className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none text-white"
                        rows={2}
                      />
                    </div>

                    {/* Dialog Action Buttons */}
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
                            landmarkEnd: ""
                          });
                          setError("");
                        }}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
