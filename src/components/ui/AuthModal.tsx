import React, { useState, useEffect } from "react";
import {
  X,
  Building,
  Mail,
  Lock,
  ShieldCheck,
  Phone,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { UserProfile } from "../../types";
import { validateSignInForm, validateSignUpForm } from "../../utils/validation";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login, signup } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(authModalTab);

  useEffect(() => {
    setTab(authModalTab);
  }, [authModalTab, isAuthModalOpen]);

  // Sign In fields
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInFieldErrors, setSignInFieldErrors] = useState<Record<string, string>>({});

  // Sign Up fields
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [gstin, setGstin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpFieldErrors, setSignUpFieldErrors] = useState<Record<string, string>>({});

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSignInFieldErrors({});

    const validation = validateSignInForm(signInIdentifier, signInPassword);
    if (!validation.isValid) {
      setSignInFieldErrors(validation.errors);
      setSignInError(Object.values(validation.errors)[0] || "Please fill all required fields correctly.");
      return;
    }

    const success = await login(signInIdentifier, signInPassword);
    if (!success) {
      setSignInError("Invalid credentials. Please check your Phone/Email and password.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpFieldErrors({});

    const validation = validateSignUpForm({
      company,
      name,
      email,
      phone,
      address,
      city,
      state,
      gstin,
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      setSignUpFieldErrors(validation.errors);
      setSignUpError(Object.values(validation.errors)[0] || "Please fix all errors in the form before proceeding.");
      return;
    }

    const profile: UserProfile = {
      company: company.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      gstin: gstin.trim().toUpperCase() || "UNREGISTERED",
      password: password,
    };

    const success = await signup(profile);
    if (!success) {
      setSignUpError("Registration failed. Email or phone might already exist.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={closeAuthModal}
      />

      <div className="relative w-full max-w-lg bg-gradient-to-br from-red-50 via-white to-red-50 border border-red-200 rounded-3xl shadow-2xl shadow-red-600/20 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-auto text-slate-900 ring-1 ring-white/50">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-red-200/60 flex items-start justify-between bg-gradient-to-r from-red-600/10 via-transparent to-red-600/5">
          <div className="flex flex-col gap-3">
            <img src="/images/siddhi-kabel-lockup.png" alt="Siddhi Kabel" className="h-8 w-auto object-contain self-start" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/siddhi-kabel-logo.png'; }} />
            <div>
              <p className="text-[11px] text-slate-500 pt-1">
                {tab === "signin"
                  ? "Sign in with Phone / Email & Password"
                  : "Create your corporate buyer account"}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-red-200/60 bg-white/40 p-1.5 gap-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setSignInError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "signin"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/20 border-transparent"
                : "text-red-800 hover:text-red-900 hover:bg-red-100/50"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setSignUpError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "signup"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/20 border-transparent"
                : "text-red-800 hover:text-red-900 hover:bg-red-100/50"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Tab 1: SIGN IN */}
        {tab === "signin" ? (
          <form onSubmit={handleSignIn} className="p-5 sm:p-6 space-y-4 text-xs">
            {signInError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{signInError}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Phone Number or Email ID *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. 9845012345 or procurement@company.com"
                  value={signInIdentifier}
                  onChange={(e) => {
                    setSignInIdentifier(e.target.value);
                    if (signInFieldErrors.identifier) {
                      setSignInFieldErrors((prev) => ({ ...prev, identifier: "" }));
                    }
                  }}
                  className={`w-full bg-slate-50 border ${
                    signInFieldErrors.identifier ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                  } rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                />
              </div>
              {signInFieldErrors.identifier && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">
                  {signInFieldErrors.identifier}
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => {
                    setSignInPassword(e.target.value);
                    if (signInFieldErrors.password) {
                      setSignInFieldErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  className={`w-full bg-slate-50 border ${
                    signInFieldErrors.password ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                  } rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                />
              </div>
              {signInFieldErrors.password && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">
                  {signInFieldErrors.password}
                </p>
              )}
            </div>

            {/* Quick Demo Sign Ins */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Demo Accounts (One-Click)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSignInIdentifier("procurement@apex-automation.in");
                    setSignInPassword("password123");
                    login("procurement@apex-automation.in", "password123");
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-red-50/60 border border-slate-200 hover:border-red-300 rounded-xl text-left transition-all"
                >
                  <div className="font-bold text-[11px] text-slate-800 truncate">
                    Test 1
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    procurement@apex-automation.in
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInIdentifier("9900000000");
                    setSignInPassword("password123");
                    login("9900000000", "password123");
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-red-50/60 border border-slate-200 hover:border-red-300 rounded-xl text-left transition-all"
                >
                  <div className="font-bold text-[11px] text-slate-800 truncate">
                    Test 2
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Phone: 9900000000
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
              >
                Sign In to Account
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: CREATE ACCOUNT */
          <form
            onSubmit={handleSignUp}
            className="p-5 sm:p-6 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto"
          >
            {signUpError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{signUpError}</span>
              </div>
            )}

            {/* 1. Company Name */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Company Name *
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Apex Switchgear & Automation Pvt Ltd"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (signUpFieldErrors.company) {
                      setSignUpFieldErrors((prev) => ({ ...prev, company: "" }));
                    }
                  }}
                  className={`w-full bg-slate-50 border ${
                    signUpFieldErrors.company ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                  } rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                />
              </div>
              {signUpFieldErrors.company && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">
                  {signUpFieldErrors.company}
                </p>
              )}
            </div>

            {/* 2. Contact Person & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Contact Officer / Person Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (signUpFieldErrors.name) {
                        setSignUpFieldErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    className={`w-full bg-slate-50 border ${
                      signUpFieldErrors.name ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    } rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                  />
                </div>
                {signUpFieldErrors.name && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    {signUpFieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Phone / Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="e.g. 9845012345"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (signUpFieldErrors.phone) {
                        setSignUpFieldErrors((prev) => ({ ...prev, phone: "" }));
                      }
                    }}
                    className={`w-full bg-slate-50 border ${
                      signUpFieldErrors.phone ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    } rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium font-mono`}
                  />
                </div>
                {signUpFieldErrors.phone && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    {signUpFieldErrors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Contact Email ID & GST Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Contact Email ID *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="procurement@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (signUpFieldErrors.email) {
                        setSignUpFieldErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    className={`w-full bg-slate-50 border ${
                      signUpFieldErrors.email ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    } rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                  />
                </div>
                {signUpFieldErrors.email && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    {signUpFieldErrors.email}
                  </p>
                )}
              </div>


            </div>

            {/* 4. Address */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Company Address *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Plot No 42, Peenya 2nd Stage, Industrial Area"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (signUpFieldErrors.address) {
                      setSignUpFieldErrors((prev) => ({ ...prev, address: "" }));
                    }
                  }}
                  className={`w-full bg-slate-50 border ${
                    signUpFieldErrors.address ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                  } rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                />
              </div>
              {signUpFieldErrors.address && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">
                  {signUpFieldErrors.address}
                </p>
              )}
            </div>

            {/* 5. City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="Bangalore"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (signUpFieldErrors.city) {
                      setSignUpFieldErrors((prev) => ({ ...prev, city: "" }));
                    }
                  }}
                  className={`w-full bg-slate-50 border ${
                    signUpFieldErrors.city ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                  } rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                />
                {signUpFieldErrors.city && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    {signUpFieldErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  State *
                </label>
                <input
                  type="text"
                  placeholder="Karnataka"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (signUpFieldErrors.state) {
                      setSignUpFieldErrors((prev) => ({ ...prev, state: "" }));
                    }
                  }}
                  className={`w-full bg-slate-50 border ${
                    signUpFieldErrors.state ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                  } rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                />
                {signUpFieldErrors.state && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    {signUpFieldErrors.state}
                  </p>
                )}
              </div>
            </div>

            {/* 6. Set Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Set Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (signUpFieldErrors.password) {
                        setSignUpFieldErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    className={`w-full bg-slate-50 border ${
                      signUpFieldErrors.password ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    } rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                  />
                </div>
                {signUpFieldErrors.password && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    {signUpFieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (signUpFieldErrors.confirmPassword) {
                        setSignUpFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    className={`w-full bg-slate-50 border ${
                      signUpFieldErrors.confirmPassword ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    } rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium`}
                  />
                </div>
                {signUpFieldErrors.confirmPassword && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    {signUpFieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Corporate Account &amp; Continue</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
