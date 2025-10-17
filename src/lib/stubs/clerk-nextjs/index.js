// Minimal Clerk stub for build optimization and CI
export const useAuth = () => ({ userId: null, isLoaded: true, isSignedIn: false });
export const useUser = () => ({ user: null, isLoaded: true });
export const SignIn = () => null;
export const SignUp = () => null;
export const UserButton = () => null;
export const ClerkProvider = ({ children }) => children;
export const SignedIn = ({ children }) => null;
export const SignedOut = ({ children }) => children;
export const auth = async () => ({ userId: null });
export const currentUser = async () => null;

// Server helpers
export const clerkMiddleware = (fn) => async (_auth, _req) => {
  return await fn(async () => ({ userId: null }), _req)
}
export const createRouteMatcher = () => () => false
export const clerkClient = {}