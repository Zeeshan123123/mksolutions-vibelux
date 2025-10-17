// Minimal Clerk server stub for build optimization
export const auth = () => ({ userId: 'stub-user' });
export const currentUser = async () => ({ id: 'stub-user', emailAddresses: [{ emailAddress: 'stub@example.com' }] });
export const clerkClient = {
  users: {
    getUser: async () => ({ id: 'stub-user' }),
    getUserList: async () => ({ data: [] }),
    updateUser: async () => ({ id: 'stub-user' }),
    updateUserMetadata: async () => ({ id: 'stub-user' }),
  },
  organizations: {
    getOrganization: async () => ({ id: 'stub-org' }),
    getOrganizationList: async () => ({ data: [] }),
  }
};
export default {};