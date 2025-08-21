
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

interface User {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	gender: string;
	address: string;
	role: string;
	location: Record<string, any>;
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
			const res = await api.post("/users/login", { email, password });
			const { access_token, user } = res.data;
			setToken(access_token);
			setUser(user);
			localStorage.setItem("token", access_token);
			localStorage.setItem("user", JSON.stringify(user));
			return true; // Login successful
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
				"Login failed. Please check your credentials."
			);
			setToken(null);
			setUser(null);
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			return false; // Login failed
		} finally {
			setLoading(false);
		}
	};

	const signOut = () => {
		setToken(null);
		setUser(null);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		window.location.href = "/";
	};

	return (
		<UserContext.Provider value={{ user, token, login, signOut, loading, error }}>
			{children}
		</UserContext.Provider>
	);
};
