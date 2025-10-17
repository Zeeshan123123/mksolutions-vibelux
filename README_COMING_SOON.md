# Coming Soon Mode Configuration

This guide explains how to use the Coming Soon page to hide the platform from public access while allowing admin access for demos.

## Enabling Coming Soon Mode

### Production
In production, the coming soon page is **enabled by default** through the environment variable:
```
NEXT_PUBLIC_COMING_SOON=true
```

### Development
In development, coming soon mode is **disabled by default** so you can work freely:
```
NEXT_PUBLIC_COMING_SOON=false
```

## Admin Access

### Adding Admin Emails

To grant admin access, edit the admin whitelist in `/src/components/ComingSoonPage.tsx`:

```typescript
const ADMIN_EMAILS = [
  'admin@vibelux.com',
  'blake@vibelux.com',
  'demo@vibelux.com',
  'your-email@example.com', // Add your email here
  // Add more admin emails as needed
];
```

### How Admin Access Works

1. **Email Whitelist**: Users with emails in the `ADMIN_EMAILS` array automatically bypass the coming soon page
2. **Role-Based Access**: Users with `role: 'ADMIN'` in their Clerk metadata also bypass the page
3. **Seamless Experience**: Admins see the full platform without any indication of the coming soon page

## Using for Demos

### Demo Workflow

1. **Share the URL**: Give potential customers the production URL (e.g., vibelux.ai)
2. **They See Coming Soon**: Non-admin visitors see a professional coming soon page
3. **Admin Login**: Click "Admin Access" at the bottom of the page
4. **Sign In**: Use your admin Clerk account to sign in
5. **Full Access**: After signing in, you'll have full access to demo the platform
6. **Persistent Session**: Once logged in, you won't see the coming soon page again until you log out

### Features of Coming Soon Page

- **Professional Design**: Clean, modern design with gradient effects
- **Feature Preview**: Shows key platform features to build interest
- **Email Collection**: Visitors can sign up for launch notifications
- **Admin Access**: Hidden admin login button at the bottom
- **Responsive**: Works perfectly on all devices

## Disabling Coming Soon Mode

When you're ready to launch publicly:

1. **Update Production Environment**: Set `NEXT_PUBLIC_COMING_SOON=false` in your production environment
2. **Redeploy**: Deploy the changes to your hosting platform
3. **Immediate Access**: The platform becomes publicly accessible

## Email Waitlist

The coming soon page collects emails in a waitlist. These are stored in the database and can be accessed for:
- Launch announcements
- Beta invitations
- Marketing campaigns

To view waitlist subscribers, query the `waitlist` table in your database.

## Security Notes

- Admin emails are hardcoded for security (not stored in database)
- Coming soon mode doesn't affect API routes or authentication
- Admin access is logged for audit purposes
- The coming soon check happens at the layout level for consistent enforcement

## Customization

You can customize the coming soon page by editing `/src/components/ComingSoonPage.tsx`:
- Change the headline and description
- Update feature highlights
- Modify colors and styling
- Add company branding
- Update the launch timeline