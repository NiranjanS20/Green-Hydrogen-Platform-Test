# 🌱 Green Hydrogen Platform

A comprehensive full-stack hydrogen management platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Designed for operational teams, researchers, and stakeholders to monitor, simulate, and optimize hydrogen production, storage, transportation, and analytics.

![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🚀 Features

### **Core Modules**
- **🏭 Production Management**: Track hydrogen facilities, electrolyzer efficiency, and production metrics
- **🗄️ Storage Management**: Monitor tank levels, pressure, temperature, and safety status
- **🚛 Transportation Routes**: Manage tube trailers, pipelines, and tankers with cost optimization
- **⚡ Simulation Engine**: Run hydrogen production simulations with scientific accuracy
- **🌿 Renewable Sources**: Connect solar, wind, and hydro sources with capacity tracking
- **📊 Analytics Dashboard**: Visualize KPIs, trends, and performance metrics
- **📚 Research Papers**: Browse and manage hydrogen-related publications with file uploads
- **👤 User Authentication**: Secure login, signup, and profile management
- **📁 File Management**: Upload and manage documents, reports, and research papers

### **Advanced Features**
- **Scientific Calculations**: Research-based formulas for water consumption, carbon offset, and efficiency
- **Real-time Monitoring**: Live updates for facility status and performance metrics
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Secure Storage**: File uploads with Supabase Storage and RLS policies

---

## 🧱 Tech Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with Radix UI primitives
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### **Backend**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime (ready for implementation)

### **Development**
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Deployment**: Vercel (recommended)

---

## 📁 Project Structure

```
green-hydrogen-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/               # Authentication pages
│   │   └── signup/
│   ├── analytics/               # Analytics dashboard
│   ├── api/                     # API routes
│   │   ├── analytics/
│   │   ├── files/
│   │   ├── production/
│   │   ├── renewable-sources/
│   │   ├── research-papers/
│   │   ├── simulation/
│   │   ├── storage/
│   │   └── transportation/
│   ├── dashboard/               # Main dashboard
│   ├── production/              # Production management
│   ├── profile/                 # User profile
│   ├── renewable-sources/       # Renewable energy sources
│   ├── research/                # Research papers
│   ├── simulation/              # Simulation engine
│   ├── storage/                 # Storage management
│   ├── transportation/          # Transportation routes
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage
├── components/                  # Reusable components
│   ├── ui/                     # UI component library
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   ├── EnergySourceCard.tsx
│   ├── FileUpload.tsx          # File upload component
│   ├── Navigation.tsx
│   ├── ProductionMetrics.tsx
│   ├── SideMenu.tsx
│   ├── SimulationChart.tsx
│   └── StorageStatus.tsx
├── lib/                        # Utility libraries
│   ├── calculations.ts         # Scientific calculations
│   ├── constants.ts           # Physical constants
│   ├── storage.ts             # File storage utilities
│   ├── supabase.ts            # Supabase client
│   └── utils.ts               # Helper functions
├── types/                      # TypeScript definitions
│   └── index.ts               # Comprehensive type definitions
├── database-setup.sql          # Database schema and policies
├── DEPLOYMENT-CHECKLIST.md     # Deployment guide
└── README.md                   # This file
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account

### **1. Clone and Install**
```bash
git clone <your-repo-url>
cd green-hydrogen-platform
npm install
```

### **2. Environment Setup**
```bash
# Create environment file
cp env-example.txt .env.local

# Add your Supabase credentials to .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=hydrogen-data
```

### **3. Database Setup**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and execute the contents of `database-setup.sql`
4. Create a storage bucket named `hydrogen-data`

### **4. Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔌 API Routes

All API routes follow RESTful conventions and include proper error handling:

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/production` | GET, POST | Production facilities management |
| `/api/storage` | GET, POST | Storage facilities management |
| `/api/transportation` | GET, POST | Transportation routes |
| `/api/renewable-sources` | GET, POST, PUT, DELETE | Renewable energy sources |
| `/api/research-papers` | GET, POST | Research paper management |
| `/api/simulation` | POST | Run production simulations |
| `/api/analytics` | GET | Analytics summary via RPC |
| `/api/files` | GET, DELETE | File management |

### **Example API Usage**
```typescript
// Create a new production facility
const response = await fetch('/api/production', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Facility A',
    location: 'Gujarat, India',
    electrolyzer_type: 'PEM',
    capacity_kg_per_day: 1000,
    efficiency_percent: 70
  })
});
```

---

## 🧪 Database Schema

The platform uses the following main tables:

- **`profiles`** - User profiles and organization info
- **`production_facilities`** - Hydrogen production facilities
- **`production_records`** - Daily production data
- **`storage_facilities`** - Storage tanks and systems
- **`storage_records`** - Storage transactions
- **`transport_routes`** - Transportation routes and vehicles
- **`renewable_sources`** - Solar, wind, and hydro sources
- **`research_papers`** - Research publications and documents
- **`system_metrics`** - Aggregated system performance data

All tables include Row Level Security (RLS) policies for data isolation.

---

## 🧠 Scientific Calculations

The platform includes research-based calculations for:

- **Hydrogen Production**: Based on electrolyzer efficiency and energy input
- **Water Consumption**: Theoretical and practical water usage
- **Carbon Offset**: Comparison with gray hydrogen production
- **Compression Energy**: Energy required for different pressure levels
- **LCOH**: Levelized Cost of Hydrogen calculations
- **Electrolyzer Performance**: PEM, Alkaline, and SOEC efficiency models

All formulas are documented with DOI references to scientific papers.

---

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
npx vercel --prod
```

### **Environment Variables for Production**
Ensure these are set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`

---

## 📊 Features Status

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ Complete | Supabase Auth integration |
| Production Management | ✅ Complete | Full CRUD with metrics |
| Storage Management | ✅ Complete | Tank monitoring and transactions |
| Transportation | ✅ Complete | Route and vehicle management |
| Renewable Sources | ✅ Complete | Energy source tracking |
| Research Papers | ✅ Complete | Document management with uploads |
| Analytics | ✅ Complete | KPI dashboards and charts |
| File Upload | ✅ Complete | Drag & drop with Supabase Storage |
| Simulation Engine | ✅ Complete | Scientific calculation engine |
| Mobile Responsive | ✅ Complete | Tailwind CSS responsive design |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the `DEPLOYMENT-CHECKLIST.md` for setup help
- Review the `database-setup.sql` for database configuration

---

## 🏆 Acknowledgments

- Built with scientific accuracy using peer-reviewed research
- Designed for real-world hydrogen production operations
- Optimized for government and industrial stakeholders
- Ready for MVP deployment and stakeholder demonstrations

**Status: Production Ready** 🚀