/**
 * Standard Form Validation Utilities for Siddhi Eshop
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Regular Expressions
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[0-9+\-\s()]{10,15}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

/**
 * Validate Email address format
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate Mobile / Phone number (at least 10 digits)
 */
export const isValidPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 13;
};

/**
 * Validate Indian GSTIN format (15 characters)
 */
export const isValidGSTIN = (gstin: string): boolean => {
  if (!gstin || !gstin.trim() || gstin.trim().toUpperCase() === "UNREGISTERED") {
    return true; // Optional or unregistered
  }
  return GSTIN_REGEX.test(gstin.trim());
};

/**
 * Validate Sign In form inputs
 */
export const validateSignInForm = (identifier: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!identifier || !identifier.trim()) {
    errors.identifier = "Please enter your Phone Number or Corporate Email ID";
  } else if (identifier.includes("@") && !isValidEmail(identifier)) {
    errors.identifier = "Please enter a valid email address";
  } else if (!identifier.includes("@") && !isValidPhone(identifier)) {
    errors.identifier = "Please enter a valid 10-digit phone number";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Sign Up / Registration form inputs
 */
export const validateSignUpForm = (data: {
  company: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstin?: string;
  password: string;
  confirmPassword?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.company || !data.company.trim()) {
    errors.company = "Company Name is required";
  } else if (data.company.trim().length < 2) {
    errors.company = "Company Name must be at least 2 characters";
  }

  if (!data.name || !data.name.trim()) {
    errors.name = "Contact Officer Name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.email || !data.email.trim()) {
    errors.email = "Corporate Email ID is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid corporate email address (e.g. name@company.com)";
  }

  if (!data.phone || !data.phone.trim()) {
    errors.phone = "Mobile / WhatsApp Phone Number is required";
  } else if (!isValidPhone(data.phone)) {
    errors.phone = "Please enter a valid 10-digit phone number";
  }

  if (!data.address || !data.address.trim()) {
    errors.address = "Company Address is required";
  }

  if (!data.city || !data.city.trim()) {
    errors.city = "City is required";
  }

  if (!data.state || !data.state.trim()) {
    errors.state = "State is required";
  }

  if (data.gstin && data.gstin.trim() && data.gstin.trim().toUpperCase() !== "UNREGISTERED") {
    if (!isValidGSTIN(data.gstin)) {
      errors.gstin = "Invalid Indian GSTIN format (e.g. 29AABCU9603R1ZM)";
    }
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Request for Quotation (RFQ) form inputs
 */
export const validateRFQForm = (data: {
  company: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  quantity: string;
  gstin?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.company || !data.company.trim()) {
    errors.company = "Company Name is required";
  }

  if (!data.name || !data.name.trim()) {
    errors.name = "Contact Person Name is required";
  }

  if (!data.email || !data.email.trim()) {
    errors.email = "Corporate Email ID is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.phone || !data.phone.trim()) {
    errors.phone = "Phone Number is required";
  } else if (!isValidPhone(data.phone)) {
    errors.phone = "Please enter a valid 10-digit phone number";
  }

  if (!data.city || !data.city.trim()) {
    errors.city = "Delivery City is required";
  }

  if (!data.quantity || !data.quantity.trim()) {
    errors.quantity = "Estimated Quantity is required";
  }

  if (data.gstin && data.gstin.trim() && data.gstin.trim().toUpperCase() !== "UNREGISTERED") {
    if (!isValidGSTIN(data.gstin)) {
      errors.gstin = "Invalid GSTIN format (e.g. 29AABCU9603R1ZM)";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
