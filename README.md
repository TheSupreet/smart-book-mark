# Bookmark Manager App

A full-stack bookmark management app built using Next.js and Supabase.

## 🚀 Live Demo

https://your-project-name.vercel.app

## 🛠 Tech Stack

- Next.js (App Router)
- Supabase (Auth + Database + Realtime)
- Tailwind CSS
- Vercel (Deployment)

## ✨ Features

- Google Authentication
- Add bookmarks
- Delete bookmarks
- Realtime updates
- Protected dashboard

## ⚠️ Challenges I Faced

### 1. Google OAuth redirect_uri_mismatch

Problem: Google login failed after deployment.

Solution: Added the Vercel domain inside Supabase Auth → Redirect URLs.

---

### 2. Row Level Security (RLS) Error

Problem: "new row violates row-level security policy"

Solution: Created proper INSERT, SELECT, DELETE policies for authenticated users.

---

### 3. Realtime not updating UI

Problem: Changes didn’t reflect instantly.

Solution: Used Supabase `postgres_changes` subscription and refetched data on events.

---

## 🧠 What I Learned

- How Supabase Auth works with OAuth
- How to configure RLS policies
- Deploying Next.js securely
- Handling environment variables in production
