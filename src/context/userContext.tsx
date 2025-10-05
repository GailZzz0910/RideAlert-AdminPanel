
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

interface FleetInfo {
  company_name?: string;
  [key: string]: any;
}

interface User {
	id: string;
	company_name: string;
	company_code: string;
	contact_info?: Array<any>;
	subscription_plan: string;
	is_active: boolean;
	max_vehicles: number;
	role: string;
	created_at: string;
	last_updated: string;

	fleet_id?: string;
	fleet?: FleetInfo;
}

interface UserContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<boolean>;
	signOut: () => void;
	loading: boolean;
	error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser must be used within UserProvider");
	return ctx;
};
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true); // Start with true to prevent premature redirects
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");
		if (storedToken && storedUser) {
			try {
				setToken(storedToken);
				setUser(JSON.parse(storedUser));
			} catch (err) {
				// If there's an error parsing stored user data, clear it
				localStorage.removeItem("token");
				localStorage.removeItem("user");
			}
		}
		setLoading(false); // Set loading to false after checking localStorage
	}, []);

	const login = async (email: string, password: string): Promise<boolean> => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.post("/fleets/login", { email, password });
			const { access_token, fleet } = res.data;

			if (!["admin", "superadmin"].includes(fleet.role)) {
				setError("User account is prohibited from logging in.");
				return false;
			}

			setToken(access_token);
			setUser(fleet);
			localStorage.setItem("token", access_token);
			localStorage.setItem("user", JSON.stringify(fleet));
			return true;
		} catch (err: any) {
			const status = err.response?.status;
			if (status === 403) {
				setError("User is not verified.");
			} else if (status === 401) {
				setError("Login failed. Please check your credentials.");
			}
			setToken(null);
			setUser(null);
			localStorage.removeItem("token");
			localStorage.removeItem("user"); // ✅ fix here
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signOut = () => {
		setToken(null);
		setUser(null);
		localStorage.removeItem("token");
		localStorage.removeItem("user"); // ✅ fix here
		window.location.href = "/";
	};


	return (
		<UserContext.Provider value={{ user, token, login, signOut, loading, error }}>
			{children}
		</UserContext.Provider>
	);
};
