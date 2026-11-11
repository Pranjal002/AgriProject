# Supabase Setup Guide: Nepal Agriculture Machinery Subsidy Registry

This document guides you through setting up Supabase as the production PostgreSQL database, authentication, and file storage backend.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign in or create an account.
2. Click **New Project** and name it `nepal-agri-registry`.
3. Set a strong database password and select a region (e.g., `Singapore (ap-southeast-1)` or `Mumbai (ap-south-1)` for best latency in Nepal).

## 2. Apply Database Schema and Seed Data

In the Supabase Dashboard:
1. Navigate to the **SQL Editor** tab from the left sidebar.
2. Click **New Query**.
3. Open `supabase/migrations/20250101000000_init_schema.sql`, copy its entire content, paste into the editor, and click **Run**.
4. Create another query, copy `supabase/seed.sql`, and click **Run** to load initial government offices, sample farmers, machinery catalog, and test alerts.

## 3. Storage Bucket Configuration

The migration automatically creates a public storage bucket `product-photos`.
Verify in **Storage** -> **Buckets** that `product-photos` exists and has public read access enabled.

## 4. Connect Frontend to Supabase

1. In Supabase Dashboard, go to **Project Settings** -> **API**.
2. Copy:
   - **Project URL**
   - **Project API anon/public key**
3. In this project's root folder, create or update `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Start the frontend application:
```bash
npm run dev
```

The application detects your Supabase environment variables and connects directly to live Supabase Auth, PostgreSQL tables, RLS policies, and Storage!

