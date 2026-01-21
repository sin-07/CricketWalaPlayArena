'use client';

import React from 'react';
import Link from 'next/link';
import { GiCricketBat } from 'react-icons/gi';
import { ArrowRight, Zap, Trophy, Users, Calendar, Clock, Shield, MapPin, ChevronRight, CalendarDays, MousePointerClick, CheckCircle2, Sparkles, Star, Images, Hammer, Target } from 'lucide-react';
import OfferMarquee from '@/components/OfferMarquee';
import Gallery from '@/components/Gallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Offer Marquee Banner */}
      <OfferMarquee />
      
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 text-gray-900 overflow-hidden">
        {/* Grass Texture Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34, 197, 94, 0.15) 3px, rgba(34, 197, 94, 0.15) 6px),
                            repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(34, 197, 94, 0.15) 3px, rgba(34, 197, 94, 0.15) 6px)`,
            backgroundSize: '40px 40px'
          }}></div>
          <div className="absolute top-0 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-600/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-600/30 mb-4 sm:mb-6">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-700" />
            <span className="text-xs sm:text-sm font-semibold text-green-900">Book your cricket slots instantly</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2 text-gray-900">
            Premium Cricket <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Turf Booking</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
            Reserve your perfect cricket turf for matches and practice sessions. Real-time availability, instant confirmation, and seamless booking experience.
          </p>

          <div className="flex justify-center mb-8 sm:mb-12">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 md:px-10 py-4 sm:py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl shadow-green-500/30 text-base sm:text-lg transition-colors"
            >
              Click Me to Prove Your Skill at ₹200
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose Us?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">Experience the best cricket facilities with modern amenities and professional service</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { icon: Zap, title: "Instant Booking", desc: "Book your slot in seconds with real-time availability" },
              { icon: Shield, title: "Secure Payment", desc: "Safe and secure payment methods for peace of mind" },
              { icon: Calendar, title: "30 Days Advance", desc: "Book up to 30 days in advance for flexibility" },
              { icon: Clock, title: "24/7 Availability", desc: "Access slots anytime, day or night, 365 days" },
              { icon: Trophy, title: "Professional Setup", desc: "State-of-the-art equipment and premium facilities" },
              { icon: Users, title: "Community", desc: "Join thousands of cricket enthusiasts" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Easy Process
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Simple 3-step process to book your perfect slot</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { num: "01", icon: CalendarDays, title: "Select Date & Sport", desc: "Choose your preferred date and sport type - Match or Practice", color: "from-blue-500 to-blue-600" },
              { num: "02", icon: MousePointerClick, title: "Pick Your Slot", desc: "Browse available time slots and select the one that suits you", color: "from-purple-500 to-purple-600" },
              { num: "03", icon: CheckCircle2, title: "Confirm & Enjoy", desc: "Enter your details and get instant confirmation", color: "from-green-500 to-green-600" }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  {/* Step Number Badge */}
                  <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${step.color} text-white font-bold text-base sm:text-lg md:text-xl mb-4 sm:mb-6 shadow-lg`}>
                    {step.num}
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-3 sm:mb-4">
                    <step.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-700" />
                  </div>
                  
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
                
                {/* Arrow connector - only on larger screens */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Best Value
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Affordable Pricing</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Competitive rates for all types of bookings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto items-stretch">
            {/* Match Booking Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden group">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-green-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gray-100 text-gray-700 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Premium
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Match Booking</h3>
                <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">Perfect for competitive games</p>
                
                <div className="flex items-baseline gap-1 mb-5 sm:mb-8">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">₹1,200</span>
                  <span className="text-base sm:text-lg text-gray-500">/hour</span>
                </div>
                
                <ul className="space-y-2.5 sm:space-y-4 mb-5 sm:mb-8 flex-grow">
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">Professional match setup</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">Premium equipment included</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">24/7 customer support</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">Floodlit night sessions</span>
                  </li>
                </ul>
                
                <Link
                  href="/booking"
                  className="w-full py-3 sm:py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all text-center block group-hover:bg-green-600 text-sm sm:text-base"
                >
                  Book Match Slot
                </Link>
              </div>
            </div>

            {/* Practice Booking Card - Popular */}
            <div className="bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl text-white flex flex-col relative overflow-hidden md:scale-105 hover:scale-[1.08] transition-all duration-300">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-28 sm:w-40 h-28 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 border border-white/30">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Most Popular
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Practice Booking</h3>
                <p className="text-green-100 text-xs sm:text-sm mb-4 sm:mb-6">Ideal for training sessions</p>
                
                <div className="flex items-baseline gap-1 mb-5 sm:mb-8">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold">₹250</span>
                  <span className="text-base sm:text-lg text-green-100">/hour</span>
                </div>
                
                <ul className="space-y-2.5 sm:space-y-4 mb-5 sm:mb-8 flex-grow">
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-green-50">Perfect for skill practice</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-green-50">Quality practice facilities</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-green-50">Flexible time slots</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-green-50">Best value for money</span>
                  </li>
                </ul>
                
                <Link
                  href="/booking"
                  className="w-full py-3 sm:py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all text-center block shadow-lg text-sm sm:text-base"
                >
                  Book Practice Slot
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-purple-100 text-purple-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Our Facilities
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Gallery</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Take a look at our premium cricket facilities</p>
          </div>
          
          <Gallery />
          
          <div className="text-center mt-6 sm:mt-8">
            <Link
              href="/admin/gallery"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors text-sm sm:text-base"
            >
              View All Photos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Turf Construction - Coming Soon */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-yellow-400/30 mb-4 sm:mb-6">
            <Hammer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
            <span className="text-xs sm:text-sm font-semibold text-yellow-300">New Service</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 px-2">
            Turf <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Construction</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto px-4">
            We&apos;re expanding our services! Soon you&apos;ll be able to get professional turf construction for your cricket ground, school, or sports complex.
          </p>
          
          {/* Match & Practice Turf Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mb-6 sm:mb-10">
            <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-400/30 hover:border-green-400/50 transition-all hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2">Match Turf</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Professional-grade turf for competitive matches and tournaments</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-400/30 hover:border-blue-400/50 transition-all hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2">Practice Turf</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Durable practice nets and training facilities for skill development</p>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 px-5 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">Coming Soon</span>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              { title: "Professional Setup", desc: "Expert installation team" },
              { title: "Quality Materials", desc: "Premium grade turf & equipment" },
              { title: "Custom Designs", desc: "Tailored to your space" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/20">
                <h3 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
