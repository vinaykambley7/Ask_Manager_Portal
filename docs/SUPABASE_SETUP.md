# Supabase Cloud Database & GitHub Setup Guide

This guide explains how to connect your **ASK EOD Manager** application to **Supabase** and push the project to **GitHub**.

---

## ⚡ 1. Supabase Setup (3 Easy Steps)

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Name your project: `ask-eod-manager`, choose a region (e.g. `ap-south-1 Mumbai` / `Singapore`), and set a database password.

### Step 2: Run the SQL Database Schema
1. In your Supabase project dashboard, open the **SQL Editor** tab (on the left menu).
2. Click **"New Query"**.
3. Open and copy all contents from [`supabase_schema.sql`](file:///C:/Users/DELL/Downloads/ASK_EOD_Manager_Source/supabase_schema.sql).
4. Paste it into the SQL Editor and click **"Run"**.
5. All 4 tables (`operators`, `assigned_work`, `work_done`, `eod_submissions`), storage buckets (`certificates`, `attachments`), and RLS policies are now created!

### Step 3: Connect the Web Portal
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) &rarr; **API**.
2. Copy your **Project URL** and **`anon` `public` Key**.
3. Open `src/js/supabase.js` and paste them:
   ```javascript
   const SUPABASE_CONFIG = {
     url: "https://your-project-id.supabase.co",
     anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
   };
   ```
4. Save the file! The web portal will now automatically sync all EOD reports, operators, and work logs directly to Supabase cloud!

---

## 🐙 2. Push to GitHub Repository

Your project is already initialized as a clean Git repository with an initial commit on the `main` branch.

To push it to your GitHub account:

### Step 1: Create a Repository on GitHub
1. Go to [https://github.com/new](https://github.com/new).
2. Set repository name (e.g. `ask-eod-manager`).
3. Keep it **Public** or **Private**.
4. **Do NOT check** "Initialize with README" (since you already have one).
5. Click **"Create repository"**.

### Step 2: Push your Code
Open your terminal / PowerShell in the project directory:
```bash
# 1. Link to your GitHub remote repository (replace with your repo URL):
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ask-eod-manager.git

# 2. Push to GitHub main branch:
git branch -M main
git push -u origin main
```

---

## 🚀 3. Firebase Deployment (Frontend)
When you are ready to deploy the frontend to Firebase:
```bash
# 1. Install Firebase CLI (if not installed)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Hosting
firebase init hosting

# 4. Deploy!
firebase deploy
```
