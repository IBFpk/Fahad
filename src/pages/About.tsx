import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Award, Users, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';

export const About = () => {
  const businessHours = [
    { day: 'Monday', hours: '11:00 AM - 9:00 PM' },
    { day: 'Tuesday', hours: '11:00 AM - 9:00 PM' },
    { day: 'Wednesday', hours: '11:00 AM - 9:00 PM' },
    { day: 'Thursday', hours: '11:00 AM - 9:00 PM' },
    { day: 'Friday', hours: '11:00 AM - 9:00 PM (Closed 1-2 PM)' },
    { day: 'Saturday', hours: '11:00 AM - 9:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  return (
    <div className="pb-20">
      {/* Page Header */}
      <section className="bg-gray-100 py-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Logo className="justify-center mb-8 scale-150" showText={true} />
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">
              Leading the Way in <span className="text-brand-blue">Electronic Excellence</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Established with a vision to provide Karachi with the highest quality home appliances and corporate cooling solutions. 
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl"></div>
      </section>

      {/* Intro Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-brand-blue mb-4">
              <Award size={32} />
            </div>
            <h3 className="text-2xl font-black text-brand-blue">25+ Years</h3>
            <p className="text-gray-500">Industry Excellence</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-brand-red mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-black text-brand-red">10k+</h3>
            <p className="text-gray-500">Happy Customers</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-black text-green-600">Premium</h3>
            <p className="text-gray-500">Authorized Warranty</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-black mb-6">Our Store & Office</h2>
              <div className="space-y-6">
                <div className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-brand-blue flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Retail Outlet</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Shop # L-41, Hashoo Center, A.H. Road, Saddar, Karachi.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-brand-red flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Corporate Office</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      # 17, Beauty House, Abdullah Haroon Road, Saddar, Karachi. Near Bank Of Punjab.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black mb-6">Contact Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="tel:02132761001" className="flex items-center gap-4 p-5 bg-blue-50 text-brand-blue rounded-2xl hover:bg-blue-100 transition-colors">
                  <Phone size={20} />
                  <span className="font-semibold text-sm">021-32761001</span>
                </a>
                <a href="mailto:farhanmalikfahadelectronic@gmail.com" className="flex items-center gap-4 p-5 bg-red-50 text-brand-red rounded-2xl hover:bg-red-100 transition-colors">
                  <Mail size={20} />
                  <span className="font-semibold text-sm">farhanmalik@...</span>
                </a>
              </div>
            </div>

             <div className="bg-brand-blue p-8 rounded-3xl text-white">
              <h3 className="text-xl font-bold mb-4">Need Corporate Solutions?</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                We specialize in floor standing and cassette type air-conditioners for offices, halls, and large spaces. Contact our corporate manager directly.
              </p>
              <a href="https://wa.me/923350237370" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-brand-blue px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                Contact Corporate Manager <ArrowRight size={18} />
              </a>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-brand-blue" size={24} />
                <h2 className="text-2xl font-black">Business Hours</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {businessHours.map((bh, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 md:last:border-b sm:[&:nth-last-child(2)]:border-0">
                    <span className="font-semibold text-[10px] uppercase tracking-wider text-gray-400">{bh.day}</span>
                    <span className={cn(
                      "text-[10px] font-black px-2.5 py-1 rounded-md",
                      bh.hours === 'Closed' ? "bg-red-50 text-red-600" : "bg-blue-50 text-brand-blue"
                    )}>
                      {bh.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Map Placeholder / Frame */}
            <div className="rounded-3xl overflow-hidden shadow-xl h-[400px] bg-gray-200 relative border-4 border-white">
               <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src="https://maps.google.com/maps?q=Hashoo%20Center%20Saddar%20Karachi&t=&z=15&ie=UTF8&iwloc=&output=embed"
                title="Business Location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import { cn } from '../lib/utils';
