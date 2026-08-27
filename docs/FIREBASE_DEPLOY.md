# Firebase Hosting Deployment Guide

Deploy your **ASK EOD Manager** web portal to Firebase Hosting with a free SSL certificate and global high-speed CDN.

---

## 🚀 Quick Deployment Steps

### 1. Install Firebase CLI
If you haven't installed Firebase CLI yet, run:
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```
This opens your browser to sign in with your Google account.

### 3. Deploy
Run the deploy command from this project directory:
```bash
firebase deploy --only hosting
```

Your portal will be live immediately at:
👉 **`https://ask-manager-portal.web.app`** or **`https://ask-manager-portal.firebaseapp.com`**

---

## ⚙️ Custom Project Name
If your Firebase project has a different project ID in your Firebase Console:
1. Run:
   ```bash
   firebase use --add
   ```
2. Select your Firebase project from the list.
3. Run `firebase deploy`.
