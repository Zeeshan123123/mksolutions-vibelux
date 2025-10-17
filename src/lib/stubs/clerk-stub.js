// Minimal Clerk stub for build optimization
export const useAuth = () => ({ userId: 'stub-user' });
export const useUser = () => ({ user: { id: 'stub-user' } });
export const SignIn = () => null;
export const SignUp = () => null;
export const UserButton = () => null;
export const ClerkProvider = ({ children }) => children;
export const SignedIn = ({ children }) => children;
export const SignedOut = ({ children }) => null;
export const auth = () => ({ userId: 'stub-user' });
export const currentUser = () => ({ id: 'stub-user' });
export default {};