"use client";

import Link from 'next/link'
import { Factory, Database, Truck } from 'lucide-react'
import Button from '@/components/ui/button'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Badge from '@/components/ui/badge'

export default function HomePage() {
  const features = [
    { icon: <Factory className="w-12 h-12" />, title: 'Production Management', description: 'Monitor and optimize hydrogen production', href: '/production', color: 'from-blue-500 to-cyan-500' },
    { icon: <Database className="w-12 h-12" />, title: 'Storage Solutions', description: 'Manage storage and monitoring', href: '/storage', color: 'from-purple-500 to-pink-500' },
    { icon: <Truck className="w-12 h-12" />, title: 'Transportation', description: 'Track transport and logistics', href: '/transportation', color: 'from-orange-500 to-red-500' }
  ]

  return (
    <div className="min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">Green Hydrogen</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Smart Hydrogen Production Platform</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">Design, simulate and optimize green hydrogen production from renewables.</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard"><Button className="bg-blue-600 text-white">Get Started</Button></Link>
            <Link href="/research"><Button className="bg-white text-gray-800">Research Papers</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link key={i} href={f.href} className="block">
              <Card className="p-6 hover:shadow-lg transition">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4`}>{f.icon}</div>
                  <CardTitle className="text-2xl">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
"use client";

import Link from 'next/link';
import { Factory, Database, Truck } from 'lucide-react';
import Button from '@/components/ui/button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Badge from '@/components/ui/badge';

export default function HomePage() {
  const features = [
    { icon: <Factory className="w-12 h-12" />, title: 'Production Management', description: 'Monitor and optimize hydrogen production', href: '/production', color: 'from-blue-500 to-cyan-500' },
    { icon: <Database className="w-12 h-12" />, title: 'Storage Solutions', description: 'Manage storage and monitoring', href: '/storage', color: 'from-purple-500 to-pink-500' },
    { icon: <Truck className="w-12 h-12" />, title: 'Transportation', description: 'Track transport and logistics', href: '/transportation', color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">Green Hydrogen</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Smart Hydrogen Production Platform</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">Design, simulate and optimize green hydrogen production from renewables.</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard"><Button className="bg-blue-600 text-white">Get Started</Button></Link>
            <Link href="/research"><Button className="bg-white text-gray-800">Research Papers</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link key={i} href={f.href} className="block">
              <Card className="p-6 hover:shadow-lg transition">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4`}>{f.icon}</div>
                  <CardTitle className="text-2xl">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
'use client';

import Link from 'next/link';
import { Zap, Wind, Droplets, Factory, Database, Truck, BarChart3, FlaskConical, BookOpen, ArrowRight, CheckCircle2, TrendingUp, Shield, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const features = [
    {
      icon: <Factory className="w-12 h-12" />,
      title: "Production Management",
      description: "Monitor and optimize hydrogen production from PEM, Alkaline, and SOEC electrolyzers with real-time efficiency tracking",
      color: "from-blue-500 to-cyan-500",
      href: "/production"
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: "Storage Solutions",
      description: "Manage compressed, liquid, and underground storage facilities with pressure and temperature monitoring",
      color: "from-purple-500 to-pink-500",
      href: "/storage"
    },
    {
      icon: <Truck className="w-12 h-12" />,
      title: "Transportation Logistics",
      description: "Track tube trailers, tankers, and pipeline networks for efficient hydrogen distribution",
      color: "from-orange-500 to-red-500",
      href: "/transportation"
    },
    {
      icon: <Wind className="w-12 h-12" />,
      title: "Renewable Integration",
      description: "Connect solar, wind, and hydropower sources to green hydrogen production systems",
      color: "from-green-500 to-emerald-500",
      href: "/renewable-sources"
    },
    {
      icon: <FlaskConical className="w-12 h-12" />,
      title: "Process Simulation",
      description: "Simulate production scenarios with different energy sources and electrolyzer configurations",
      color: "from-indigo-500 to-blue-500",
      href: "/simulation"
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Analytics & Reports",
      description: "Comprehensive analytics on efficiency, carbon offset, and system performance metrics",
      color: "from-teal-500 to-cyan-500",
      href: "/analytics"
    }
  ];

  const benefits = [
    { icon: <Leaf className="w-6 h-6 text-green-600" />, text: "Zero Carbon Emissions" },
    { icon: <TrendingUp className="w-6 h-6 text-blue-600" />, text: "85% Electrolyzer Efficiency" },
    { icon: <Shield className="w-6 h-6 text-purple-600" />, text: "Safe Storage & Transport" },
    { icon: <CheckCircle2 className="w-6 h-6 text-cyan-600" />, text: "Real-time Monitoring" }
  ];

  const stats = [
    { value: "10.5 kg", label: "CO₂ Offset per kg H₂", color: "text-green-600" },
    { value: "39.4 kWh", label: "Energy per kg H₂", color: "text-blue-600" },
    { value: "700 bar", label: "Max Storage Pressure", color: "text-purple-600" },
    { value: "90%", label: "SOEC Efficiency", color: "text-orange-600" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-teal-600/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
              Green Hydrogen Revolution
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Smart Hydrogen</span>
              <br />
              Production Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8">
              Design, simulate, and optimize green hydrogen production from renewable energy sources like solar, wind, and hydropower
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 glassmorphic px-4 py-2 rounded-full">
                  {benefit.icon}
                  <span className="font-medium text-gray-800">{benefit.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 transition-transform duration-300">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/research">
                <Button size="lg" variant="outline" className="hover:scale-105 transition-transform duration-300">
                  <BookOpen className="mr-2 w-5 h-5" />
                  Research Papers
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="glassmorphic-strong rounded-2xl p-6 text-center card-hover">
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Complete Ecosystem</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              End-to-end platform for green hydrogen production, storage, and distribution management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="glassmorphic-strong border-2 border-white/40 card-hover h-full cursor-pointer group">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-700">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Renewable Sources Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Powered by Renewables</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Integrate multiple renewable energy sources for sustainable hydrogen production
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glassmorphic-strong border-2 border-white/40 card-hover">
              <CardHeader>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white mb-4 mx-auto">
                  <Zap className="w-10 h-10" />
                </div>
                <CardTitle className="text-2xl text-center">Solar Energy</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 mb-4">Photovoltaic systems with 15-35% capacity factor for consistent hydrogen production</p>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">25% Avg. Capacity</Badge>
              </CardContent>