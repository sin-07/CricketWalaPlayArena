'use client';

import React from 'react';
import Link from 'next/link';
import { GiCricketBat } from 'react-icons/gi';
import { ArrowRight, Zap, Trophy, Users, Calendar, Clock, Shield, MapPin, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30 mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">Book your cricket slots instantly</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Premium Cricket <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Turf Booking</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Reserve your perfect cricket turf for matches and practice sessions. Real-time availability, instant confirmation, and seamless booking experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all border border-white/20 backdrop-blur-sm">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-16 pt-12 border-t border-white/10">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-400">1000+</div>
              <div className="text-sm text-gray-400">Happy Players</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-cyan-400">24</div>
              <div className="text-sm text-gray-400">Hourly Slots</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-400">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the best cricket facilities with modern amenities and professional service</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Instant Booking", desc: "Book your slot in seconds with real-time availability" },
              { icon: Shield, title: "Secure Payment", desc: "Safe and secure payment methods for peace of mind" },
              { icon: Calendar, title: "90 Days Advance", desc: "Book up to 90 days in advance for flexibility" },
              { icon: Clock, title: "24/7 Availability", desc: "Access slots anytime, day or night, 365 days" },
              { icon: Trophy, title: "Professional Setup", desc: "State-of-the-art equipment and premium facilities" },
              { icon: Users, title: "Community", desc: "Join thousands of cricket enthusiasts" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                <feature.icon className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple 3-step process to book your perfect slot</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Select Date & Sport", desc: "Choose your preferred date and sport type - Match or Practice" },
              { num: "02", title: "Pick Your Slot", desc: "Browse available time slots and select the one that suits you" },
              { num: "03", title: "Confirm & Enjoy", desc: "Enter your details and get instant confirmation" }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-bold text-gray-100 mb-4">{step.num}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-8">{step.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 text-gray-300">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Affordable Pricing</h2>
            <p className="text-xl text-gray-600">Competitive rates for all types of bookings</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Match Booking</h3>
              <div className="text-4xl font-bold text-green-600 mb-6">₹1,500<span className="text-lg text-gray-600">/hour</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Professional setup</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Premium equipment</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">24/7 support</span>
                </li>
              </ul>
              <Link
                href="/booking"
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Book Now
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 shadow-lg text-white transform scale-105">
              <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold mb-4">Popular</div>
              <h3 className="text-2xl font-bold mb-4">Practice Booking</h3>
              <div className="text-4xl font-bold mb-6">₹1,200<span className="text-lg opacity-90">/hour</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Perfect for practice</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Quality facilities</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Flexible slots</span>
                </li>
              </ul>
              <Link
                href="/booking"
                className="w-full py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center block"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Book Your Slot?</h2>
          <p className="text-lg text-green-100 mb-8">Join thousands of cricket enthusiasts and book your perfect slot today</p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Book Your Slot Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
