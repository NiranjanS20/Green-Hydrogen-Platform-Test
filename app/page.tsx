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
    <main className="min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">Green Hydrogen</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Hydrogen Production Platform</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">Design, simulate and optimize green hydrogen production from renewables.</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard"><Button className="bg-blue-600 text-white">Get Started</Button></Link>
            <Link href="/research"><Button className="bg-white text-gray-800">Research Papers</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </main>
  )
}