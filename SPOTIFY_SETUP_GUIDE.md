# 🎵 VibeLux Spotify Integration Setup Guide

## ✅ Configuration Complete!

Your Spotify credentials have been successfully configured for VibeLux:

### **Credentials Added:**
- **Client ID:** `8c109821d5534a8b80968510ff97b3aa`
- **Client Secret:** `4b6c99b51d9847dca1e63339553b9cf1`

### **Environment Configuration:**
- ✅ Added to `.env.local` for local development
- ✅ Added to Vercel production environment
- ✅ Updated callback URLs in the code

---

## 🚀 **IMPORTANT: Spotify Developer Dashboard Setup**

### **You MUST now configure your Spotify App:**

1. **Go to:** https://developer.spotify.com/dashboard
2. **Find your app** (with Client ID: `8c109821d5534a8b80968510ff97b3aa`)
3. **Click "Edit Settings"**
4. **Add these Redirect URIs:**

```
http://localhost:3001/api/auth/spotify/callback
https://vibelux-k4nq0jn4b-think-sprout.vercel.app/api/auth/spotify/callback
```

5. **Save the settings**

---

## 🎧 **How to Use Spotify in VibeLux:**

### **Local Development (localhost:3001):**
1. Start your dev server: `npm run dev`
2. Navigate to any design page with 3D viewer
3. Look for the Spotify mini player
4. Click "Connect Spotify"
5. Authorize the app
6. Enjoy music while designing!

### **Production (Vercel):**
1. Visit: https://vibelux-k4nq0jn4b-think-sprout.vercel.app
2. Access any design tool
3. Connect Spotify via the mini player
4. Control music during your design sessions

---

## 🎨 **Where Spotify Appears:**

- **3D Design Viewer** - Autodesk Forge integration
- **Advanced Designer** (`/design/advanced`)
- **Design Studio** (`/design`)
- **Any page with Forge viewer enabled**

---

## 🎵 **Features Available:**

### **Mini Player:**
- Play/Pause controls
- Skip tracks
- Track information display
- Album art
- Progress bar

### **Full Panel:**
- Volume control
- Playlist selection
- Search functionality
- Mood playlists:
  - Peaceful Piano (Focus)
  - Lofi Beats (Relaxed)
  - Deep Focus (Productive)
  - Nature Sounds (Ambient)

---

## 🔧 **Troubleshooting:**

### **"Not authenticated" error:**
- Make sure you've added the redirect URIs in Spotify Developer Dashboard
- Clear cookies and reconnect

### **"No active device" error:**
- Open Spotify on your phone/computer first
- Start playing music, then pause
- Connect through VibeLux

### **Music won't play:**
- Spotify requires an active Premium account for Web API playback control
- Free accounts can only view current playback state

---

## 📱 **Spotify Premium Required:**

Note: Full playback control requires a **Spotify Premium** account. Free accounts can:
- View current playing track
- See playlists
- But cannot control playback

---

## 🚀 **Next Steps:**

1. **Add redirect URIs** to your Spotify app (REQUIRED)
2. **Deploy to Vercel** to get the latest changes: `vercel --prod`
3. **Test the integration** in both local and production
4. **Enjoy music** while designing greenhouses!

---

## 🎯 **Pro Tips:**

- Create custom playlists for different design moods
- Use nature sounds for biophilic design inspiration
- Share playlists with your team for collaborative sessions
- Lower volume during client calls (volume control in panel)

---

*Last Updated: August 7, 2025*
*Spotify Integration v1.0 for VibeLux Platform*