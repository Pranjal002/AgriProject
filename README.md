# Nepal Agriculture Machinery Subsidy Registry (NAMSR)
### नेपाल कृषि औजार तथा मेसिनरी अनुदान दर्ता प्रणाली

> **A central, anti-fraud agricultural machinery subsidy registry and duplicate prevention system for the Government of Nepal (Ministry of Agriculture and Livestock Development).**

---

## 🌾 Project Overview

Government offices across Nepal at three administrative tiers:
1. **Level 1 (Federal):** Ministry of Agriculture and Livestock Development (MoALD, Singha Durbar)
2. **Level 2 (Provincial):** Provincial Agriculture Development Directorates & Ministries (7 Provinces)
3. **Level 3 (Local):** Metropolitan Cities, Municipalities, and Rural Municipalities (753 Local Governments)

distribute heavy equipment and farm machinery (tractors, power tillers, reapers, threshers, etc.) under government subsidies.

### The Problem
Previously, corrupt dealers or individuals could purchase a subsidized machine in one municipality or province, alter invoice text (e.g., changing `"m-575 di-98214"` to `"M 575 DI 98214"`), and fraudulently claim another 50%–75% government subsidy in another office or subsequent fiscal year.

### The Solution
This registry enforces a **universal normalized engine registry** across all 7 provinces and 753 local governments:
1. **Automatic Normalization:** Engine numbers are normalized to uppercase alphanumeric characters with all whitespace, hyphens, and slashes stripped (e.g., `" ab- 1234 / X "` → `"AB1234X"`).
2. **Live Pre-Submission Verification:** As field officers type the engine number, the system conducts a live, debounced check against all national records.
3. **Instant Red Alert & Save Blocking:** If an engine number is already subsidized, the system immediately presents a red alert showing the original granting office, fiscal year, and beneficiary farmer name, blocks the save, and logs an entry to the **Duplicate Alerts** fraud watchlist.
4. **Row-Level Security (RLS):** Jurisdiction-based access control where Federal officers see all records in Nepal, Provincial officers see their province, and Local officers see their municipality, while allowing **any authenticated officer across Nepal** to run the universal engine number check.

---

## 🚀 Key Features

- **Government-Style UI:** Forest green & white agriculture theme with official typography, seals, and mobile responsiveness for field officers.
- **Full Bilingual Support:** Instant toggle between **English** and **नेपाली (Devanagari)** across all pages, forms, tables, alerts, and navigation.
- **Bikram Sambat (BS) Support:** Supports Nepali fiscal years (`2081/82`, `2080/81`, `2079/80`) and BS dates alongside AD.
- **3-Step Subsidy Entry Wizard:**
  - **Step 1 (Farmer):** Search existing farmer or create new with father/grandfather lineage and 10-digit Nepali phone validation.
  - **Step 2 (Machinery & Live Check):** Category, brand, model, normalized engine number with real-time green/red indicator, and photo upload with client-side canvas compression.
  - **Step 3 (Terms & Review):** Subsidy percentage, amount (NPR formatting), granting office, and audit log capture.
- **Universal Cross-Nepal Engine Checker:** Dedicated search portal for checking any machine's clearance status before procurement.
- **Duplicate Alerts Watchlist:** Dedicated review and investigation workflow for Federal and Office Admins to review duplicate attempts, update status (`Under Review`, `Confirmed Fraud`, `Resolved`), and log official notes.
- **Audit Trail:** Tamper-evident log recording all actions (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `DUPLICATE_FLAG`) with old vs. new JSON diffs.
- **Exporting:** One-click export to Excel/CSV (with UTF-8 BOM for Devanagari text) and print-friendly PDF report generation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, Vite 6, Tailwind CSS v3, Lucide Icons
- **Backend & Database:** Supabase (PostgreSQL 15+, Row Level Security, Triggers, RPC, Storage)
- **Dual Engine Architecture:**
  - **Live Supabase Mode:** Connects to live PostgreSQL tables, triggers, RPC, and Storage when `.env` credentials are provided.
  - **Local Demo Mode:** Runs with zero external dependencies out of the box with complete local storage persistence and simulation of all database triggers and RLS rules.

---

## 📁 Directory Structure

```text
AgriProject/
├── supabase/
│   ├── migrations/
│   │   └── 20250101000000_init_schema.sql  # Complete PostgreSQL schema, triggers, RLS, storage
│   ├── seed.sql                            # Seed data (offices, users, farmers, deliberate duplicate records)
│   └── README.md                           # Supabase deployment instructions
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx                   # Jurisdiction & Status badges
│   │   │   ├── ConfirmDialog.jsx           # Soft delete confirmation modal
│   │   │   └── Modal.jsx                   # Reusable accessible modal dialog
│   │   ├── layout/
│   │   │   ├── Header.jsx                  # Top government banner, role switcher, bilingual toggle
│   │   │   ├── Sidebar.jsx                 # Role-filtered navigation menu
│   │   │   └── Footer.jsx                  # Official MoALD details
│   │   └── subsidy/
│   │       ├── LiveEngineCheck.jsx         # Real-time duplicate engine verification indicator
│   │       └── PhotoUpload.jsx             # Client-side canvas image compression & preview
│   ├── context/
│   │   ├── AuthContext.jsx                 # Session, role management, and demo persona switcher
│   │   ├── LanguageContext.jsx             # Complete English / Nepali dictionary & translations
│   │   └── ToastContext.jsx                # Toast notification system
│   ├── pages/
│   │   ├── AddSubsidy.jsx                  # 3-step subsidy registration wizard
│   │   ├── AuditLog.jsx                    # Admin audit trail with diff inspector
│   │   ├── Dashboard.jsx                   # Metrics, charts, red duplicate alert watchlist
│   │   ├── DuplicateAlerts.jsx             # Full fraud alert resolution & review page
│   │   ├── EngineChecker.jsx               # Universal national engine clearance scanner
│   │   ├── Farmers.jsx                     # Beneficiary farmers directory & subsidy history
│   │   ├── Login.jsx                       # Official portal login & quick persona picker
│   │   ├── OfficesUsers.jsx                # Admin office & user management
│   │   ├── Products.jsx                    # Machinery catalog & photo galleries
│   │   ├── Profile.jsx                     # Officer profile & settings
│   │   ├── SubsidyList.jsx                 # Search, filter, export to CSV & print
│   │   └── AccessDenied.jsx                # 403 Forbidden handler
│   ├── services/
│   │   ├── api.js                          # Core data repository & duplicate detection engine
│   │   ├── mockData.js                     # Realistic initial seed data (offices, farmers, products)
│   │   ├── nepaliDate.js                   # Bikram Sambat (BS) utilities & calendar helpers
│   │   └── supabaseClient.js               # Supabase JS SDK client
│   ├── utils/
│   │   ├── engineNormalizer.js             # Engine number normalization logic
│   │   ├── exportUtils.js                  # CSV/Excel export with UTF-8 BOM
│   │   └── nepaliValidators.js             # 10-digit phone, citizenship, NPR currency formatting
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tests/
│   └── registry.test.mjs                   # Automated test suite (6 test suites)
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚦 Getting Started

### 1. Installation

```bash
# Clone or navigate into directory
cd /Users/pranjaldahal/AgriProject

# Install dependencies
npm install
```

### 2. Run Automated Test Suite

```bash
npm test
```
Verifies engine normalization, 10-digit phone validation, currency formatting, universal engine check, duplicate blocking, automatic fraud alert logging, and dashboard statistics.

### 3. Run Development Server

```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🗄️ Supabase Backend Deployment

To connect the application to a live Supabase project:

1. Create a free project at [supabase.com](https://supabase.com/).
2. In Supabase Dashboard, open the **SQL Editor**.
3. Copy and run `supabase/migrations/20250101000000_init_schema.sql` (creates tables, normalization triggers, fraud alert triggers, RLS policies, and storage bucket).
4. Run `supabase/seed.sql` to populate sample government offices, farmers, products, and deliberate test alerts.
5. In project root, create or edit `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. Restart Vite (`npm run dev`). The top header will automatically display **"Supabase Live"**!

---

## 🔍 How to Test the Duplicate Warning Feature

1. Open the application and log in as any officer (default: **Super Admin** or **Local Field Officer**).
2. Go to **Register Subsidy** in the sidebar.
3. In Step 1, click **Select** next to any farmer (or enter a new farmer) and proceed to Step 2.
4. In Step 2, click the red button **"Test Duplicate Engine"** (or type `M575DI98214X` into the Engine Number field).
5. Notice that within milliseconds:
   - A prominent **red warning banner** appears immediately on the screen.
   - It displays the original granting office: `"Agriculture Development Section, Bharatpur Metropolitan City"`, the fiscal year `2081/82 BS`, and the beneficiary farmer `"Ram Bahadur Thapa"`.
   - The submission is blocked to protect public funds.
6. Open **Dashboard** or **Duplicate Alerts** from the sidebar to review the automatically logged alert on the national fraud watchlist!

---

## 🏛️ Government Personas (Demo Quick-Switch)

The application includes 5 pre-configured personas to test all administrative tiers and permissions:

| Persona | Name | Jurisdiction Tier | Role | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Federal Super Admin** | Dr. Hari Bahadur KC | Level 1: MoALD Central Office, Kathmandu | `super_admin` | View all Nepal records, resolve alerts, manage offices & users |
| 🏢 **Provincial Admin** | Prakash Chandra Adhikari | Level 2: Directorate of Agri Dev, Bagmati | `office_admin` | View province-wide records, resolve local alerts |
| 🚜 **Local Agriculture Officer** | Sushil Shrestha | Level 3: Bharatpur Metropolitan City | `data_entry` | Register subsidies, view local jurisdiction records |
| 📋 **Data Entry Operator** | Rita Bhattarai | Level 3: Damak Municipality, Jhapa | `data_entry` | Register subsidies in Damak |
| 👁️ **Central Auditor** | Gopal Krishna Regmi | Level 1: MoALD Central Office | `viewer` | Read-only inspection and audit trail review |

---

## 📄 License
Government of Nepal, Ministry of Agriculture and Livestock Development (MoALD). All rights reserved.

