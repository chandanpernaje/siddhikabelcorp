import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserProfile, QuotationDocument } from "../types";
import { useToast } from "./ToastContext";
import { API_BASE_URL } from "../config/api";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "signin" | "signup";
  isAccountModalOpen: boolean;
  openAuthModal: (tab?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  openAccountModal: () => void;
  closeAccountModal: () => void;
  login: (identifier: string, password?: string) => Promise<boolean>;
  signup: (profile: UserProfile) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  savedQuotes: QuotationDocument[];
  saveQuote: (quote: QuotationDocument) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "siddhi_client_profile_v3";
const REGISTERED_USERS_KEY = "siddhi_registered_users_v3";
const QUOTES_STORAGE_KEY = "siddhi_saved_rfqs_v2";

const DEFAULT_USERS: UserProfile[] = [
  {
    name: "Rajesh Kumar",
    email: "procurement@apex-automation.in",
    company: "Apex Automation & Switchgear Pvt Ltd",
    phone: "9845012345",
    gstin: "29AABCU9603R1ZM",
    address: "Plot 42, Peenya Industrial Area, 2nd Stage",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560058",
    password: "password123",
  },
  {
    name: "Suresh Sharma",
    email: "purchase@lapp-partner.in",
    company: "LAPP Cable Partner OEM",
    phone: "9900000000",
    gstin: "29AABCS1234F1Z8",
    address: "Bommasandra Industrial Area",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560099",
    password: "password123",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (!token) return null;
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [savedQuotes, setSavedQuotes] = useState<QuotationDocument[]>(() => {
    try {
      const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      if (registeredUsers.length > 0) {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      }
    } catch (e) {
      console.error(e);
    }
  }, [registeredUsers]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(savedQuotes));
    } catch (e) {
      console.error(e);
    }
  }, [savedQuotes]);

  const openAuthModal = (tab: "signin" | "signup" = "signin") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openAccountModal = () => setIsAccountModalOpen(true);
  const closeAccountModal = () => setIsAccountModalOpen(false);

  const login = async (identifier: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (res.ok) {
        const { user: userData, token } = await res.json();
        localStorage.setItem('token', token);
        const profile: UserProfile = {
          name: userData.name,
          email: userData.email,
          company: userData.company || '',
          phone: userData.phone || '',
          gstin: userData.gstin || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
          password: userData.password
        };
        setUser(profile);
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${userData.name}!`, "success");
        return true;
      }
      const data = await res.json();
      showToast(data.error || 'Invalid credentials.', 'error');
      return false;
    } catch (err) {
      console.error('Login failed', err);
      showToast('Network error during login.', 'error');
      return false;
    }
  };

  const signup = async (profile: UserProfile): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const { user: userData, token } = await res.json();
        localStorage.setItem('token', token);
        setUser(profile);
        setIsAuthModalOpen(false);
        showToast("Corporate account created & signed in successfully!", "success");
        return true;
      }
      const data = await res.json();
      showToast(data.error || 'Registration failed', 'error');
      return false;
    } catch (err) {
      console.error('Signup failed', err);
      showToast('Network error during registration', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAccountModalOpen(false);
    localStorage.removeItem('token');
    showToast("Signed out of corporate portal", "info");
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...profile };
      // Also sync back to registeredUsers
      setRegisteredUsers((rUsers) =>
        rUsers.map((u) => (u.email === prev.email ? updated : u))
      );
      return updated;
    });
    showToast("Profile details updated successfully", "success");
  };

  const saveQuote = async (quote: QuotationDocument): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      showToast("Please log in or create an account to submit an RFQ.", "error");
      openAuthModal("signin");
      return false;
    }

    // Send to backend
    try {
      const res = await fetch(`${API_BASE_URL}/api/rfqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(quote),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          showToast(errData.error || "Session expired. Please log in again.", "error");
          openAuthModal("signin");
          return false;
        }
        throw new Error(errData.error || "Backend save failed");
      }
      
      // Save locally for UI immediately
      setSavedQuotes((prev) => [quote, ...prev.filter((q) => q.id !== quote.id)]);
      showToast(`Quotation ${quote.quoteNo} submitted to our team and archived in your portal`, "success");
      return true;
    } catch (err: any) {
      console.error("Failed to send RFQ to backend:", err);
      showToast(err.message || "Error submitting RFQ to Admin Panel. Please try again.", "error");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        isAccountModalOpen,
        openAuthModal,
        closeAuthModal,
        openAccountModal,
        closeAccountModal,
        login,
        signup,
        logout,
        updateProfile,
        savedQuotes,
        saveQuote,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

