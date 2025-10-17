import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950/20 to-black">
      <SignIn 
        routing="hash"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#7C3AED",
            colorTextOnPrimaryBackground: "#ffffff",
            colorBackground: "rgba(15, 15, 30, 0.9)",
            colorInputBackground: "rgba(255, 255, 255, 0.1)",
            colorInputText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "#a0a0a0",
            borderRadius: "0.75rem"
          },
          elements: {
            rootBox: "mx-auto",
            card: "shadow-2xl bg-gray-900/90 border border-purple-500/30 backdrop-blur-sm",
            headerTitle: "text-white font-bold text-2xl",
            headerSubtitle: "text-gray-300",
            socialButtonsBlockButton: "bg-gray-800/50 border border-purple-500/30 text-white hover:bg-gray-700/50",
            socialButtonsBlockButtonText: "text-white font-medium",
            formFieldInput: "bg-gray-800/50 border border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400",
            formFieldLabel: "text-gray-200 font-medium",
            footerActionText: "text-gray-300",
            footerActionLink: "text-purple-400 hover:text-purple-300",
            formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white font-medium",
            dividerText: "text-gray-400",
            dividerLine: "bg-gray-600"
          }
        }}
      />
    </div>
  );
}