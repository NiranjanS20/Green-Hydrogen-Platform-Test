"use client";

import Link from 'next/link';
import { Factory, Database, Truck, Zap, Leaf, ArrowRight } from 'lucide-react';
import { Button } from '@heroui/react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Chip } from '@heroui/react';

export default function HomePage() {
  const features = [
    { 
      icon: <Factory className="w-8 h-8" />, 
      title: 'Production Management', 
      description: 'Monitor and optimize hydrogen production with real-time analytics',
      href: '/production', 
      color: 'primary' 
    },
    { 
      icon: <Database className="w-8 h-8" />, 
      title: 'Storage Solutions', 
      description: 'Advanced storage monitoring and capacity management',
      href: '/storage', 
      color: 'secondary' 
    },
    { 
      icon: <Truck className="w-8 h-8" />, 
      title: 'Transportation', 
      description: 'Efficient logistics and route optimization',
      href: '/transportation', 
      color: 'warning' 
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10" />
        <div className="relative max-w-6xl mx-auto text-center">
          <Chip color="primary" variant="flat" className="mb-6">
            🌿 Green Hydrogen Platform
          </Chip>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            Smart Hydrogen
            <br />
            Production Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Design, simulate and optimize green hydrogen production from renewable energy sources. 
            Monitor every aspect of your hydrogen ecosystem in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button 
              as={Link}
              href="/dashboard"
              color="primary"
              size="lg"
              endContent={<ArrowRight className="w-4 h-4" />}
              className="font-semibold"
            >
              Get Started
            </Button>
            <Button 
              as={Link}
              href="/research"
              variant="bordered"
              size="lg"
              className="font-semibold"
            >
              Research Papers
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">100% Green</h3>
              <p className="text-gray-600">Renewable energy powered</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">85% Efficiency</h3>
              <p className="text-gray-600">Advanced electrolysis technology</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Real-time</h3>
              <p className="text-gray-600">Live monitoring & analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Hydrogen Ecosystem
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage every aspect of your green hydrogen operations from a single, integrated platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card 
                key={i}
                as={Link}
                href={feature.href}
                isPressable
                isHoverable
                className="p-6 h-full transition-all duration-300 hover:scale-105"
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 flex items-center justify-center text-white mb-4 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center mt-4 text-blue-600 font-medium">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Hydrogen Production?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join the future of clean energy with our comprehensive platform
          </p>
          <Button 
            as={Link}
            href="/dashboard"
            size="lg"
            className="bg-white text-blue-600 font-semibold hover:bg-gray-100"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Start Your Journey
          </Button>
        </div>
      </section>
    </main>
  );
}