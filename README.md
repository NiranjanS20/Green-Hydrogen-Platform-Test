# 🌱 Green Hydrogen Platform

A comprehensive full-stack hydrogen management platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **HeroUI**, and **Supabase**. Designed for operational teams, researchers, and stakeholders to monitor, simulate, and optimize hydrogen production, storage, transportation, and analytics.

![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-4.0.0-blue)
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
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: HeroUI (NextUI v2) with glassmorphic design
- **Charts**: Recharts for interactive data visualization
- **Icons**: Lucide React (comprehensive icon library)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **State Management**: React hooks (useState, useEffect, custom hooks)

### **Backend & Database**
- **Database**: Supabase (PostgreSQL) with 11 optimized tables
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Storage**: Supabase Storage for file uploads
- **API**: Next.js API Routes with proper error handling
- **Real-time**: Supabase Realtime for live data updates
- **Security**: User isolation, RLS policies, input validation

### **Development & Deployment**
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode with comprehensive types
- **Build System**: Next.js optimized builds
- **Deployment**: Vercel (recommended) with automatic deployments
- **Version Control**: Git with structured commits

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
3. **Execute the complete database schema** (provided in implementation docs):
   - Creates all 11 required tables with proper structure
   - Sets up Row Level Security (RLS) policies
   - Adds indexes for performance optimization
   - Creates triggers for automatic timestamp updates
4. **Run the missing fields migration** to add optional fields:
   - Priority fields for deliveries and transport routes
   - Additional metadata fields for all tables
   - Computed columns for remaining capacity
5. Create a storage bucket named `hydrogen-data`
6. **Verify setup**: All tables should have proper user_id foreign keys and RLS policies

### **4. Authentication Setup**
The platform now requires user authentication to access core features:
- **Public Access**: Homepage and research papers are publicly viewable
- **Protected Features**: Production, Storage, Transportation, Analytics require sign-in
- **User Isolation**: Each user only sees their own facilities and data
- **Admin System**: Comprehensive admin panel with user management

### **5. Run Development Server**
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

The platform uses **11 optimized tables** with comprehensive relationships:

### **Core Tables**
- **`profiles`** - User profiles, organization info, and role management
- **`production_facilities`** - Hydrogen production facilities with energy source linking
- **`production_records`** - Daily production data with efficiency tracking
- **`storage_facilities`** - Storage tanks with safety monitoring and computed capacity
- **`storage_records`** - Storage transactions with operator tracking
- **`transport_routes`** - Transportation routes with real-time status and progress
- **`renewable_sources`** - Solar, wind, hydro sources with weather dependency
- **`research_papers`** - Research publications with file management
- **`deliveries`** - Delivery tracking with priority and ETA management
- **`vehicle_status`** - Vehicle fleet management with load tracking
- **`system_metrics`** - Aggregated performance analytics

### **Security & Performance**
- ✅ **Row Level Security (RLS)** on all tables for user data isolation
- ✅ **Foreign key relationships** ensuring data integrity
- ✅ **Optimized indexes** for fast queries
- ✅ **Computed columns** for real-time calculations
- ✅ **Automatic triggers** for timestamp updates
- ✅ **Input validation** with CHECK constraints

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
| **Authentication & Security** | ✅ Complete | Supabase Auth, RLS policies, user isolation, role management |
| **Production Management** | ✅ Complete | Facility CRUD, electrolyzer models, energy dependency, LCOH calculations |
| **Storage Management** | ✅ Complete | Tank monitoring, safety thresholds, capacity alerts, manual transfers |
| **Transportation & Logistics** | ✅ Complete | Vehicle tracking, route optimization, priority overrides, delivery management |
| **Renewable Energy Sources** | ✅ Complete | Solar/wind/hydro tracking, weather dependency, efficiency modeling |
| **Research Knowledge Base** | ✅ Complete | Paper management, file uploads, citation tracking, category filtering |
| **Real-Time Dashboard** | ✅ Complete | Live KPIs, system health monitoring, intelligent alerts, trend analysis |
| **Admin System** | ✅ Complete | User management, role assignment, system oversight, audit trails |
| **File Management** | ✅ Complete | Drag & drop uploads, Supabase Storage integration, file validation |
| **Simulation Engine** | ✅ Complete | 30-day predictive modeling, weather integration, scenario analysis |
| **Mobile Responsive** | ✅ Complete | Touch-friendly interface, adaptive layouts, cross-device compatibility |
| **Supply Chain Integration** | ✅ Complete | End-to-end workflow: Production → Storage → Transport → Delivery |
| **Smart Alerts & Notifications** | ✅ Complete | Production capacity, storage levels, transport delays, energy efficiency |
| **Vehicle Fleet Management** | ✅ Complete | Load tracking, capacity management, maintenance scheduling |
| **Analytics & Reporting** | ✅ Complete | CO₂ offset tracking, cost analysis, efficiency metrics, export capabilities |
| **Database Optimization** | ✅ Complete | 11 tables, RLS security, indexes, triggers, computed columns |
| **API Integration** | ✅ Complete | RESTful endpoints, error handling, input validation, rate limiting |
| **Deployment Infrastructure** | ✅ Complete | Vercel optimization, environment management, CI/CD ready |

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

## 🆘 Support & Troubleshooting

### **Common Issues & Solutions**

**Database Connection Issues:**
- Verify Supabase URL and anon key in `.env.local`
- Check if RLS policies are properly configured
- Ensure all 11 tables exist with correct structure

**Authentication Problems:**
- Clear browser cache and cookies
- Verify Supabase Auth is enabled in project settings
- Check if user has proper role assignments

**Missing Data/Features:**
- Run the complete database schema SQL
- Execute the missing fields migration
- Verify user_id foreign key relationships

**Build/Deployment Errors:**
- Run `npm run build` locally to check for TypeScript errors
- Verify all environment variables are set in deployment platform
- Check Vercel build logs for specific error messages

### **Getting Help**
- **Documentation**: Review this README and inline code comments
- **Database Schema**: Check the comprehensive SQL provided in implementation
- **Issues**: Create detailed bug reports with error logs and steps to reproduce
- **Feature Requests**: Describe use case and expected behavior

### **Performance Optimization**
- Database indexes are automatically created for optimal query performance
- Images and files are optimized through Supabase Storage CDN
- Next.js build optimization handles code splitting and caching
- RLS policies ensure efficient user data isolation

---

## 🏆 Acknowledgments

- Built with scientific accuracy using peer-reviewed research
- Designed for real-world hydrogen production operations
- Optimized for government and industrial stakeholders
- Ready for MVP deployment and stakeholder demonstrations

**Status: Production Ready with Full Supply Chain Integration** 🚀

### **Latest Updates (v4.0.0) - Production Ready**
- ✅ **Complete Authentication System**: User isolation, role-based access, admin panel
- ✅ **11-Table Database Schema**: Optimized structure with RLS, indexes, and triggers
- ✅ **End-to-End Supply Chain**: Production → Storage → Transport → Delivery workflow
- ✅ **Real-Time Dashboard**: Live KPIs, system health monitoring, intelligent alerts
- ✅ **Smart Logistics Management**: Manual route selection, capacity constraints, priority overrides
- ✅ **Vehicle Fleet Tracking**: Real-time load monitoring, progress tracking, ETA calculations
- ✅ **Renewable Energy Integration**: Source linking, weather dependency, efficiency modeling
- ✅ **Advanced Storage Management**: Safety thresholds, utilization monitoring, overflow prevention
- ✅ **Production Optimization**: Electrolyzer efficiency models, energy consumption tracking
- ✅ **Analytics & Reporting**: CO₂ offset calculations, LCOH analysis, performance metrics
- ✅ **Research Knowledge Base**: Paper management, file uploads, citation tracking
- ✅ **Mobile-Responsive Design**: Touch-friendly interface, adaptive layouts
- ✅ **Enterprise Security**: Input validation, SQL injection prevention, data encryption
- ✅ **Deployment Ready**: Vercel optimization, environment configuration, error handling

**Ready for enterprise deployment and stakeholder demonstrations!** 🌟