export const clerkConfig = {
  // Clerk should not redirect to external domains for auth
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
  afterSignInUrl: "/",
  afterSignUpUrl: "/",

  // Custom domain configuration
  /*
  // v1
  appearance: {
    baseTheme: undefined,
    variables: {
      colorPrimary: "#8b5cf6",
    },
    elements: {
      formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
      card: "bg-gray-900 border border-gray-700 shadow-lg",
      headerTitle: "text-white",
      headerSubtitle: "text-gray-400",
      socialButtonsBlockButton: "bg-gray-800 text-white hover:bg-gray-700",
      formFieldInput: "bg-gray-800 text-white placeholder-gray-400",
      formFieldLabel: "text-gray-200 font-medium",
      formFieldError: "text-red-500 text-sm mt-1",
      formFieldSuccessText: "text-green-400 text-sm mt-1",
      formFieldHintText: "text-gray-300 text-xs mt-1", 
    },
  },
  */

  // V2
  appearance: {
    variables: {
      colorPrimary: "#8b5cf6",
      // Optional: make base text/background brighter on dark UI
      colorText: "#e5e7eb", // tailwind gray-200
      colorTextSecondary: "#cbd5e1", // gray-300
      colorInputText: "#f8fafc", // gray-50
      colorAlphaShade: "rgba(255,255,255,0.08)",
    },
    elements: {
      // Card + general
      card: "bg-gray-900 border border-gray-700 shadow-lg",
      headerTitle: "text-white",
      headerSubtitle: "text-gray-300",
      socialButtonsBlockButton: "bg-gray-800 text-white hover:bg-gray-700",

      // ✅ The two items you circled
      identityPreviewText: "text-gray-200", // make email clearly readable
      identityPreviewEditButton:
        "text-violet-400 hover:text-violet-300 focus:ring-2 focus:ring-violet-500 rounded",

      // ✅ OTP digit boxes
      otpCodeFieldInput:
        "bg-gray-800 text-white border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500",

      // Inputs/buttons (keep your existing ones)
      formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
      formFieldInput: "bg-gray-800 text-white placeholder-gray-400",
      formFieldLabel: "text-gray-200 font-medium",
      formFieldError: "text-red-500 text-sm mt-1",
      formFieldSuccessText: "text-green-400 text-sm mt-1",
      formFieldHintText: "text-gray-300 text-xs mt-1",
    },
  },

  // Prevent external redirects
  redirectUrl: (url: string) => {
    // Only allow redirects to our own domain
    const allowedHosts = [
      "localhost",
      "vibelux.ai",
      "www.vibelux.ai",
      "accounts.vibelux.ai",
      "clerk.vibelux.ai",
      // Removed clerk.vibelux.ai - using default Clerk domains
    ];

    try {
      const parsedUrl = new URL(url);
      if (allowedHosts.some((host) => parsedUrl.hostname.includes(host))) {
        return url;
      }
    } catch (e) {
      // If URL parsing fails, assume it's a relative path
      return url;
    }

    // Default to home page for any suspicious redirects
    return "/";
  },
};
