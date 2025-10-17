// Minimal Clerk server stub for build optimization
export const auth = () => ({ userId: 'stub-user' });
export const getAuth = () => ({ userId: 'stub-user' });
export const currentUser = async () => ({ 
  id: 'stub-user', 
  emailAddresses: [{ emailAddress: 'stub@example.com' }],
  firstName: 'Stub',
  lastName: 'User',
  publicMetadata: {},
  privateMetadata: {},
  unsafeMetadata: {}
});

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

// Re-export everything as default as well
export default {
  auth,
  getAuth,
  currentUser,
  clerkClient
};