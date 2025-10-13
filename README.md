# 🌱 Green Hydrogen Platform

A comprehensive full-stack hydrogen management platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **HeroUI**, and **Supabase**. Designed for operational teams, researchers, and stakeholders to monitor, simulate, and optimize hydrogen production, storage, transportation, and analytics.

![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-3.0.1-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Mobile](https://img.shields.io/badge/Mobile-Responsive-green)
![Admin](https://img.shields.io/badge/Admin-System-red)
![Live Data](https://img.shields.io/badge/Live%20Data-Real%20Time-orange)
![Integrated](https://img.shields.io/badge/Supply%20Chain-Fully%20Integrated-purple)

---

## 🚀 Features

### **Core Modules**
- **🏭 Production Management**: Track hydrogen facilities, electrolyzer efficiency, and production metrics
- **🗄️ Storage Management**: Monitor tank levels, pressure, temperature, and safety status
- **🚛 Transportation Routes**: Advanced delivery management with real-time tracking and optimization
- **⚡ Simulation Engine**: Interactive 30-day simulations with weather conditions and economic analysis
- **🌿 Renewable Sources**: Connect solar, wind, and hydro sources with capacity tracking
- **📊 Analytics Dashboard**: Real-time data visualization with dynamic charts from Supabase
- **📚 Research Papers**: Browse and manage hydrogen-related publications with file uploads
- **👤 User Authentication**: Secure login, signup, and profile management with role-based access
- **🔒 Admin System**: Password-protected admin panel with user management and system monitoring

### **Advanced Features**
- **🔄 Fully Integrated Supply Chain**: Complete workflow from renewable energy → production → storage → transport
- **🚚 Smart Logistics Management**: Manual route selection, capacity constraints, priority overrides
- **📊 Real-Time Dashboard**: Live data updates every 30 seconds with system health monitoring
- **🚨 Intelligent Alerts**: Production capacity warnings, storage level alerts, transport notifications
- **⚡ Energy-Dependent Production**: H₂ production limited by actual renewable energy availability
- **🎯 Capacity Management**: Vehicle fill levels, storage utilization, production progress tracking
- **📱 Mobile Responsive**: Fully optimized for mobile devices with touch-friendly interface
- **🎮 Interactive Simulation**: Real-time 30-day simulation with variable speed and weather conditions
- **📈 Real Data Integration**: All dashboards show actual data from Supabase instead of mock data
- **🔐 Session Management**: Device-specific authentication - users stay logged in per device/browser
- **⚡ Route Optimization**: Efficiency-based route sorting and ETA calculations
- **🎨 Modern UI**: HeroUI components with glassmorphic design and smooth animations
- **🔒 Admin Controls**: Single admin system with approval workflow and user role management
- **📊 Live Charts**: Dynamic production, energy mix, and efficiency charts from real facility data
- **🚀 Production Ready**: Optimized for Vercel deployment with proper error handling

---

## 🧱 Tech Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: HeroUI (NextUI v2) with modern design system
- **Charts**: Recharts for interactive data visualization
- **Icons**: Lucide React
- **Animations**: Framer Motion for smooth transitions

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
4. **Run the transport migration**: Execute `database-migration-transport-fix.sql` for correct transport workflow
5. Create a storage bucket named `hydrogen-data`

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
| Authentication | ✅ Complete | Supabase Auth with device-specific sessions |
| Production Management | ✅ Complete | Full CRUD with real-time metrics and energy dependency |
| Storage Management | ✅ Complete | Tank monitoring, manual route selection, capacity alerts |
| Transportation | ✅ Complete | Vehicle fill levels, priority overrides, capacity management |
| Renewable Sources | ✅ Complete | Energy source tracking with production integration |
| Research Papers | ✅ Complete | Document management with uploads |
| Analytics Dashboard | ✅ Complete | Live data updates, system health, real-time alerts |
| Admin System | ✅ Complete | Password-protected admin panel |
| File Upload | ✅ Complete | Drag & drop with Supabase Storage |
| Simulation Engine | ✅ Complete | Interactive 30-day simulation with weather integration |
| Mobile Responsive | ✅ Complete | Fully optimized for mobile devices |
| Route Optimization | ✅ Complete | Efficiency-based routing and ETA |
| Real Data Integration | ✅ Complete | All charts show actual Supabase data (no mock data) |
| Delivery Tracking | ✅ Complete | Start/complete deliveries with progress |
| Supply Chain Integration | ✅ Complete | End-to-end workflow with real dependencies |
| Smart Alerts System | ✅ Complete | Production, storage, transport, and energy alerts |
| Capacity Management | ✅ Complete | Vehicle loads, storage utilization, production limits |
| Priority Override System | ✅ Complete | High/urgent priority can override capacity limits |

---

## 🔄 Integrated Supply Chain Workflow

The platform features a complete end-to-end hydrogen supply chain with real dependencies:

### **Workflow Steps**
1. **🌿 Renewable Energy Sources** → Generate power (solar, wind, hydro)
2. **⚡ Energy Availability** → Calculate daily renewable energy production
3. **🏭 Production Facilities** → H₂ production limited by available renewable energy
4. **📊 Production Alerts** → Notify when facilities reach 80%+ daily capacity
5. **🏪 Storage Transfer** → Manual selection of storage facility with capacity checking
6. **🚛 Vehicle Loading** → H₂ loads into transport vehicle (storage NOT updated yet)
7. **🎯 Priority System** → High/urgent priority can override vehicle capacity limits
8. **🚚 Transport Execution** → Real-time vehicle fill levels and progress tracking
9. **📦 Delivery Completion** → H₂ delivered to storage facility (storage updated now)
10. **📈 Live Dashboard** → System health monitoring and real-time alerts

### **Smart Features**
- **Correct Transport Flow**: H₂ flows Production → Vehicle → Transport → Delivery → Storage
- **Vehicle Load Tracking**: Real-time fill levels during transport (storage updates only on delivery)
- **Pending Delivery System**: Tracks H₂ amount being transported to destination storage
- **Energy Dependency**: Production automatically limited by renewable energy availability
- **Capacity Constraints**: Vehicles can't exceed capacity unless priority override is used
- **Real-Time Alerts**: Dashboard shows actual system issues (storage full, production ready, etc.)
- **Manual Control**: Users select specific routes and can override constraints for urgent deliveries
- **Live Updates**: All data refreshes every 30 seconds with timestamp indicators

### **Alert System**
- **🔴 Urgent**: Storage 95%+ full, production 95%+ complete
- **🟡 High**: Storage 85%+ full, production 80%+ complete, delayed deliveries
- **🔵 Medium**: Low storage levels, no production recorded today
- **🟢 Info**: Successful transfers, completed deliveries

---

## 📱 Mobile Responsiveness

The platform is fully optimized for mobile devices with:

- **Responsive Navigation**: Collapsible sidebar with smooth animations
- **Touch-Friendly Interface**: Optimized button sizes and spacing
- **Mobile Charts**: Responsive charts that adapt to screen size
- **Optimized Typography**: Scalable text sizes for different screen sizes
- **Mobile-First Design**: Built with mobile users in mind
- **Cross-Device Sessions**: Users stay logged in per device/browser

### **Breakpoints**
- **Mobile**: `< 640px` - Single column layout, compact navigation
- **Tablet**: `640px - 1024px` - Two column grids, expanded sidebar
- **Desktop**: `> 1024px` - Full multi-column layout, persistent sidebar

---

## 🔒 Admin System

Comprehensive admin panel with advanced user management:

### **Admin Features**
- **Password Protection**: Secure access with `M@nthan290719`
- **Session Timeout**: 1-minute auto-logout for security
- **Single Admin Control**: Only one active admin at a time
- **User Management**: Change roles, approve admin requests, remove users
- **System Monitoring**: View all facilities, routes, and user data
- **Data Export**: CSV/JSON export for all system data

### **Admin Workflow**
1. **Admin Request**: Users can request admin role from profile page
2. **Approval Process**: Existing admin approves/rejects requests
3. **Role Management**: Admin can change user roles (operator/manager/engineer/admin)
4. **User Removal**: Admin can remove users from the system
5. **Data Oversight**: Admin sees all data across all users

### **Security Features**
- Password-protected access
- Activity-based session timeout
- Single admin restriction
- Audit trail for admin actions

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

**Status: Production Ready with Full Supply Chain Integration** 🚀

### **Latest Updates (v3.0.1)**
- ✅ **Fixed Transport Workflow**: Proper H₂ flow through vehicles before storage update
- ✅ **Correct Delivery Process**: Storage only updates when delivery completes
- ✅ **Vehicle Load Tracking**: Real-time vehicle fill levels during transport
- ✅ **Pending Delivery System**: Tracks H₂ amount being transported to destination
- ✅ Complete supply chain integration with real dependencies
- ✅ Smart logistics management with manual route selection
- ✅ Real-time dashboard with live data updates (no mock data)
- ✅ Intelligent alert system based on actual facility status
- ✅ Vehicle capacity management with priority overrides
- ✅ Energy-dependent production limiting
- ✅ System health monitoring with color-coded status
- ✅ Enhanced storage management with production status display
- ✅ Transportation page with vehicle fill level indicators

**Ready for enterprise deployment and stakeholder demonstrations!** 🌟