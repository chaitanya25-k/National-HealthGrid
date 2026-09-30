# National HealthGrid — Federated Health Resource & Supply Chain Platform

> **A federated AI platform for national-scale health resource and supply chain management — providing real-time visibility into medicine stocks, bed availability, and medical personnel attendance across India's entire Primary Health Centre (PHC) and District Hospital network.**

---

## 1. Problem Statement & Executive Overview

India's public healthcare infrastructure encompasses more than 30,000 Primary Health Centres (PHCs), 6,000 Community Health Centres (CHCs), and 800+ District Hospitals across 28 states and 8 union territories. During seasonal epidemiological emergencies (monsoon-related vector-borne diseases, acute diarrheal surges, viral respiratory clusters) and regional disasters, individual PHCs and rural clinics frequently encounter severe localized stock-outs of life-saving medicines (IV normal saline, anti-snake venom vials, oral rehydration salts, broad-spectrum antibiotics), acute bed and ICU shortages, and critical workforce deficits. In many cases, neighboring district warehouses and tertiary hospitals hold surplus buffers that remain uncoordinated due to fragmented information silos.

### Core Challenges in Centralized Health Logistics:
1. **Patient Privacy & Statutory Compliance**: Direct centralization of patient-level hospital encounters across state borders breaches privacy mandates.
2. **Rural Connectivity Bottlenecks**: Sub-centre and rural PHC clinics experience intermittent network connectivity and cannot sustain heavy, synchronous cloud synchronization loops.
3. **Delayed Administrative Response**: Traditional supply replenishment requisitions take days to weeks through paper or hierarchical administrative chains.

### The Federated AI Solution:
**National HealthGrid** introduces a privacy-preserving federated architecture that:
- **Operates Edge Demand Projections**: Each healthcare facility calculates localized consumption run-rates, bed turnover velocity, and staff ratios on-premise.
- **Enforces Differential Privacy ($\epsilon = 1.25$)**: Edge gradient updates are perturbed with calibrated Gaussian noise before synchronization, guaranteeing that individual patient encounter telemetry cannot be reconstructed.
- **Enables Shared Multi-State Outbreak Modeling**: State health directorates share federated epidemic surge coefficients (e.g., Monsoon Vector-Borne Surge Multiplier: $1.48\times$). When an outbreak begins in one district, predictive multipliers automatically prime buffer thresholds in adjacent districts and neighboring states.
- **Recommends Automated Cross-District Redistribution**: Pairs surplus District Hospital warehouses with rural PHCs facing sub-48-hour stock-outs, calculating transit road distance, courier ETA, and one-click authorization.

```
                              ┌──────────────────────────────────────────────┐
                              │    MoHFW National Situation Room / Desk      │
                              │  (Centralized Consensus & Strategic Buffer)  │
                              └───────────────────────▲──────────────────────┘
                                                      │
                               Federated Model Gradients (FedAvg, ε = 1.25)
                                                      │
                      ┌───────────────────────────────┴──────────────────────────────┐
                      │                                                              │
            ┌───────────────────────┐                                      ┌───────────────────────┐
            │ State Health Hub (MH) │                                      │ State Health Hub (KA) │
            └───────────▲───────────┘                                      └───────────▲───────────┘
                        │                                                              │
                 ┌──────┴────────────────────────┐                              ┌──────┴──────────────┐
                 │                               │                              │                     │
           ┌──────────────┐             ┌──────────────┐                ┌──────────────┐     ┌──────────────┐
           │  Aundh DH    │             │  Junnar PHC  │                │ Kanakapura   │     │ Ramanagara   │
           │  (District)  │             │  (Primary)   │                │ CHC (Taluk)  │     │ District DH  │
           └──────────────┘             └──────────────┘                └──────────────┘     └──────────────┘
            [Edge Run-Rate]              [Edge Run-Rate]                 [Edge Run-Rate]      [Edge Run-Rate]
```

---

## 2. Platform Architecture & Modules

### A. Real-Time Essential Medicines (NLEM) Management
Continuous physical stock auditing and run-rate projections for India's National List of Essential Medicines:
- **IV Normal Saline / Ringer's Lactate (500ml)**: Vital resuscitation fluids for acute gastroenteritis, trauma, and maternal hemorrhage.
- **Anti-Snake Venom (ASV) Vials**: Cold-chain emergency antivenom vital for agricultural and forest PHC regions.
- **Paracetamol 500mg Tablets**: Core antipyretic for primary outpatient fever clinics.
- **Oral Rehydration Salts (ORS Packets)**: First-line intervention for pediatric diarrheal clusters.
- **Amoxicillin 500mg**: Primary broad-spectrum antimicrobial capsules.
- **Medical Oxygen Cylinders (B & D Type)**: Continuous pressure manifold tracking for inpatient wards and emergency triage.

### B. Bed Capacity & Triage Census
- Real-time tally of sanctioned bed capacity vs. unoccupied available beds vs. occupied beds.
- Dedicated tracking of ICU ventilator beds for tertiary critical care transfers.
- Automated bed pressure threshold indicators triggering alerts when facility occupancy exceeds 85%.

### C. Clinical Workforce Attendance Tracking
- Real-time shift reporting for Medical Officers (MOs), Registered Staff Nurses (GNM), Auxiliary Nurse Midwives (ANMs), and Pharmacists.
- Instant calculation of on-duty staff-to-patient coverage ratios.

### D. Bayesian Demand Forecasting & Outbreak Early Warnings
- Local edge demand projections across 3, 7, 14, and 30-day forecast horizons.
- High-priority stock-out alerts when projected depletion occurs within the minimum emergency delivery window.

### E. Automated Cross-District Resource Redistribution
- Intelligent pairing algorithm connecting facilities facing acute deficits with nearby surplus district warehouses.
- Computes transit road distance, courier ETA, and batch dispatch numbers with one-click authorization and audit trails.

### F. Multi-State Federated Learning Hub
- Displays real-time federated consensus score, differential privacy budget ($\epsilon = 1.25$), and participating state clusters.
- Inter-state epidemic transmission vectors and cross-state supply coordination.

---

## 3. User Interface Design & Accessibility

The interface is built to deliver a clean, distraction-free command center experience:
- **Minimalist White Background**: Clean, high-legibility canvas (`#ffffff`) prioritizing clinical data, tabular figures, and critical indicators over heavy visual noise.
- **Native System UI Font**: Uses OS-optimized typography (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) for crisp rendering and instant load times.
- **Innovative Sliding Upper Navigation Bar**:
  - Positioned directly at the top of the interface for maximum vertical and horizontal data workspace.
  - Features an intuitive **Slide Key** on the left side (`[ ☰ Slide Bar ◀▶ ]`) that smoothly slides open the facility navigator and tier switcher drawer.
  - Horizontal sliding track with left/right navigation arrow controls for quick mouse, trackpad, or touch navigation across all 7 operational modules.
- **WCAG 2.1 AA/AAA Accessibility**:
  - High-contrast color ratios across light and dark modes.
  - Full keyboard accessibility with skip links, visible focus rings, and dedicated hotkeys (`1`–`7`, `Alt+N`, `Alt+T`, `Alt+S`, `?`, `Esc`).

---

## 4. Local Run & Installation Guide

Run the full-stack platform locally on your computer with a single command. The backend Express API and Vite React frontend run simultaneously on port `3000`.

### System Prerequisites
- **Node.js**: Version 18.0.0 or higher (Node 20+ LTS recommended).
- **npm**: Version 9.0.0 or higher (comes bundled with Node.js).
- **Git** (optional, for cloning the repository).

To verify your Node.js and npm versions:
```bash
node -v
npm -v
```

---

### Step-by-Step Local Setup

#### Step 1: Open Terminal in Project Directory
Navigate to the root directory where the project files are located:
```bash
cd national-healthgrid
```

#### Step 2: Install All Dependencies
Install the required packages:
```bash
npm install
```

#### Step 3: Configure Environment (Optional)
The project comes with sane defaults out-of-the-box. An `.env.example` file is included in the project root:
```env
PORT=3000
APP_URL="http://localhost:3000"
GEMINI_API_KEY=""
```
You can copy it to `.env` if you want to customize port or keys:
```bash
cp .env.example .env
```
*(Note: A Gemini API key is completely optional. The federated learning algorithms, demand forecasting heuristics, and cross-district redistribution engine run fully on-premise without external API requirements.)*

#### Step 4: Start the Full-Stack Server
Launch the unified server in development mode:
```bash
npm run dev
```

You will see the console confirmation:
```
✔ National HealthGrid Server running on http://0.0.0.0:3000
✔ Real-time PHC supply chain API and web interface active on port 3000
```

#### Step 5: Open in Your Web Browser
Open your browser (Chrome, Firefox, Safari, Edge) and navigate to:
```
http://localhost:3000
```

Both the REST API endpoints and the React frontend will be actively serving from this address.

---

### Building for Production

To create an optimized production build:
```bash
npm run build
npm start
```
The build output will be compiled into the `dist` directory and served by the Express production server.

---

## 5. Seeded Test Accounts & Demonstration Roles

The system comes pre-configured with realistic public healthcare accounts. You can sign in using the quick-login demo buttons or enter the credentials below:

| Role | Health Facility | District & State | Tier | Email Address | Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Health Officer** | Junnar Rural PHC | Pune, Maharashtra | PHC | `mo.junnar@healthgrid.gov.in` | `manager1234` |
| **Hospital Superintendent** | Aundh District Hospital | Pune, Maharashtra | DH | `ms.aundh@healthgrid.gov.in` | `manager1234` |
| **Civil Surgeon** | Nashik Civil Hospital | Nashik, Maharashtra | DH | `nashik.civil@healthgrid.gov.in` | `manager1234` |
| **National Situation Desk** | Central Monitoring Desk | MoHFW, New Delhi | National | `viewer@healthgrid.gov.in` | `viewer1234` |

*You can also register a new facility or viewer account anytime using the "Register New Facility" tab on the sign-in screen.*

---

## 6. Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `1` – `7` | Instant jump between operational modules (Command Center, Medicines, Beds, Personnel, Forecast, Transfers, Federated Models) |
| `Alt + N` / `N` | Open / close real-time Emergency Alert Notification Drawer |
| `Alt + T` / `T` | Toggle between Light and Dark visual modes |
| `Alt + S` / `S` | Trigger an Emergency Alert Simulation Drill |
| `Alt + M` / `M` | Slide out the left facility and tier switcher drawer |
| `?` | Open keyboard shortcuts modal |
| `Esc` | Close any active modal, slide drawer, or toast notification |
| `Tab` / `Shift + Tab` | Navigate focus through all interactive elements |

---

## 7. API Endpoints Reference

All endpoints are hosted locally under `http://localhost:3000`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check, active nodes count, and database state |
| `POST` | `/auth/manager/login` | Authenticate PHC / Hospital Medical Officer |
| `POST` | `/auth/viewer/login` | Authenticate National Situation Room officer |
| `GET` | `/facility/dashboard` | Retrieve composite telemetry for active facility |
| `POST` | `/inventory` | Record physical stock counts for NLEM medicines |
| `POST` | `/capacity` | Update total, available, and ICU beds census |
| `POST` | `/personnel` | Record on-duty attendance for doctors, nurses, and ANMs |
| `POST` | `/ai/predict` | Generate localized demand forecast and early warnings |
| `GET` | `/api/federated/models` | Retrieve multi-state federated model rounds & consensus scores |
| `GET` | `/api/notifications/stream` | Server-Sent Events (SSE) live push alert stream |
| `GET` | `/api/national/overview` | Aggregated statewide metrics for national oversight |
| `POST` | `/api/redistribution/dispatch` | Authorize and record cross-district stock transfer |

---

## 8. Technology Stack

- **Runtime & Backend**: Node.js, Express.js, TypeScript
- **Frontend Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS (Minimalist System UI design, clean white background, high-contrast dark mode)
- **Real-Time Communication**: Server-Sent Events (SSE) with automatic client-side reconnection
- **Iconography**: Lucide React
- **Data Persistence**: Atomic JSON storage engine (`data/healthgrid.json`) with auto-seeding

---

## 9. Troubleshooting & FAQ

- **Port 3000 already in use**: If port 3000 is occupied by another process, you can set `PORT=3001 npm run dev` or change the port in `.env`.
- **Reset database to defaults**: Simply delete the `data/healthgrid.json` file and restart the server; it will automatically re-seed with clean default data.
- **Node version error**: Ensure you are running Node.js version 18.0.0 or higher via `node -v`.
