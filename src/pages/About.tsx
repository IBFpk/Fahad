import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Award, Users, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { cn } from '../lib/utils';

export const About = () => {
  const { brandSettings } = useSettings();
  const { businessName, businessSub, description, address, phone, email, bankAccounts } = brandSettings;

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
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">
              Leading the Way in <span className="text-brand-blue">Electronic Excellence</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {description}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-20">
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">Our Store & Office</h2>
              <div className="space-y-6">
                <div className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-brand-blue flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Business Address</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">Contact Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {phone && (
                  <a href={`tel:${phone}`} className="flex items-center gap-4 p-5 bg-blue-50 text-brand-blue rounded-2xl hover:bg-blue-100 transition-colors">
                    <Phone size={20} />
                    <span className="font-semibold text-sm">{phone}</span>
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="flex items-center gap-4 p-5 bg-red-50 text-brand-red rounded-2xl hover:bg-red-100 transition-colors">
                    <Mail size={20} />
                    <span className="font-semibold text-sm truncate">{email}</span>
                  </a>
                )}
              </div>
            </div>


          </div>

          <div className="space-y-10">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-brand-blue" size={24} />
                <h2 className="text-2xl font-black uppercase tracking-tight">Business Hours</h2>
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

        {/* Payment Methods */}
        <div className="pt-20 border-t border-gray-100">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-brand-blue rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <ShieldCheck size={14} />
              Secure Payments
            </div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Online Payment <span className="text-brand-blue">Bank Accounts</span></h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              For your convenience, we accept online transfers through several major banks in Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(bankAccounts && bankAccounts.length > 0 ? bankAccounts : []).map((account, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-8 rounded-3xl border-2 transition-all hover:shadow-lg relative overflow-hidden",
                  account.color || "bg-blue-50 border-blue-200"
                )}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{account.bank}</h3>
                    <div className="px-3 py-1 bg-white/80 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 border border-white">Online Payment</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Account Title</p>
                      <p className="font-bold text-gray-900">{account.title}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Account Number</p>
                      <p className="font-mono font-bold text-gray-900 break-all">{account.acc}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">IBAN</p>
                      <p className="font-mono text-xs font-bold text-gray-900 break-all">{account.iban}</p>
                    </div>
                    {account.branch && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Branch</p>
                        <p className="text-xs font-semibold text-gray-600">{account.branch}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Logo showText={false} className="scale-150 rotate-12" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
