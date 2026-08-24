const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  const email = (value || "").trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL_RE.test(email)) return "That doesn’t look like an email address.";
  return null;
}

export function validatePassword(value) {
  const password = value || "";
  if (!password) return "Enter a password.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return "Mix uppercase and lowercase letters.";
  }
  return null;
}

export function validateRequired(value, message) {
  return (value || "").trim() ? null : message;
}

export function validatePostalCode(value) {
  const zip = (value || "").trim();
  if (!zip) return "Enter your ZIP code.";
  if (!/^\d{5}$/.test(zip)) return "Enter a 5-digit ZIP code.";
  return null;
}

export function compactErrors(errors) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message))
  );
}
