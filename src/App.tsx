

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { UserProvider } from "./context/userContext";

import Landing from "./pages/landing";
import NewDashboardLayout from "./layouts/sidebar-layout";
import Dashboard from "./pages/dashboard";
import AddVehicle from "./pages/add-vehicle";
import VehicleManagement from "./pages/vehicle-management";
import Settings from "./pages/settings";
import Map from "./pages/map";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
    return (
        <UserProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <NewDashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="add-vehicle" element={<AddVehicle />} />
                            <Route path="vehicle-management" element={<VehicleManagement />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="maps" element={<Map />} />
                        </Route>
                    </Routes>
                </Router>
            </ThemeProvider>
        </UserProvider>
    );
}

export default App;