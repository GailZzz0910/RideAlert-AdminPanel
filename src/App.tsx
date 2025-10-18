

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { UserProvider, useUser } from "./context/userContext";

import RegisterCompany from "./pages/register";
import Landing from "./pages/fleet-admin/landing";
import NewDashboardLayout from "./layouts/sidebar-layout";
import SuperAdminLayout from "./layouts/super-admin-layout";
import Dashboard from "./pages/fleet-admin/dashboard";
import AddVehicle from "./pages/fleet-admin/add-vehicle";
import VehicleManagement from "./pages/fleet-admin/vehicle-management";
import AddRoutes from "./pages/fleet-admin/add-routes";
import AssignRoute from "./pages/fleet-admin/assign-route";
import Settings from "./pages/fleet-admin/settings";
import Map from "./pages/fleet-admin/map";
import FleetAdminIOTManagement from "./pages/fleet-admin/iot-management";
import Tracking from "./pages/fleet-admin/tracking";
import SuperAdminDashboard from "./pages/super-admin/super-admin-dashboard";
import SuperAdminCompanies from "./pages/super-admin/super-admin-companies";
import SuperAdminFleetManagement from "./pages/super-admin/super-admin-fleet-management";
import SuperAdminCompanyDetails from "./pages/super-admin/super-admin-company-details";
import SuperAdminIOTManagement from "./pages/super-admin/super-admin-iot-management";
import SuperAdminAddRoutes from "./pages/super-admin/super-admin-add-routes.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { VehicleProvider } from "./context/vehicleContext";


function AppWithProviders() {
    const { user } = useUser();
    
    return (
        <VehicleProvider fleetId={user?.company_code || ""}>
            <ThemeProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/register" element={<RegisterCompany />} />
                        
                        {/* Regular Admin Dashboard - Only accessible by admin role */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <NewDashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="add-vehicle" element={<AddVehicle />} />
                            <Route path="vehicle-management" element={<VehicleManagement />} />
                            <Route path="assign-route/:vehicle_id" element={<AssignRoute />} />
                            <Route path="add-routes" element={<AddRoutes />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="maps" element={<Map />} />
                            <Route path="iot-management" element={<FleetAdminIOTManagement />} />
                            <Route path="tracking" element={<Tracking />} />
                        </Route>

                        {/* Super Admin Dashboard - Only accessible by superadmin role */}
                        <Route path="/super-admin" element={
                            <ProtectedRoute allowedRoles={["superadmin"]}>
                                <SuperAdminLayout />
                            </ProtectedRoute>
                                }>
                                    <Route index element={<SuperAdminDashboard />} />
                                    <Route path="companies" element={<SuperAdminCompanies />} />
                                    <Route path="company/:companyId" element={<SuperAdminCompanyDetails />} />
                                    <Route path="fleet-management" element={<SuperAdminFleetManagement />} />
                                    <Route path="iot-management" element={<SuperAdminIOTManagement />} />
                                    <Route path="add-routes" element={<SuperAdminAddRoutes />} />
                                    <Route path="add-user" element={<div className="p-6">Add User Page - Coming Soon</div>} />
                                    <Route path="all-vehicles" element={<div className="p-6">All Vehicles Page - Coming Soon</div>} />
                                    <Route path="system-data" element={<div className="p-6">System Data Page - Coming Soon</div>} />
                                    <Route path="settings" element={<div className="p-6">Super Admin Settings - Coming Soon</div>} />
                        </Route>
                    </Routes>
                </Router>
            </ThemeProvider>
        </VehicleProvider>
    );
}

function App() {
    return (
        <UserProvider>
            <AppWithProviders />
        </UserProvider>
    );
}

export default App;