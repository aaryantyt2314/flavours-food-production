'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-cream mt-auto">
      {/* Celebration Banner */}
      <div className="bg-brand-maroon text-white text-center py-3 px-4">
        <p className="text-sm font-medium">
          🎉 We&apos;re available for all parties & celebrations!{' '}
          <Link href="/reservation" className="underline font-semibold hover:text-brand-gold transition-colors">
            Book Now
          </Link>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center">
                <span className="text-white font-bold text-sm">FF</span>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">FLAVOURS FOOD</h3>
                <p className="text-[10px] text-brand-tan leading-none">HAPPINESS IS FLAVOURS</p>
              </div>
            </div>
            <p className="text-sm text-brand-tan/80 leading-relaxed">
              Unlimited choice under one roof. Crafted with love, served with a smile.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-brand-tan/80">
              {[
                { href: '/menu', label: 'Our Menu' },
                { href: '/reservation', label: 'Reserve Table' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/login', label: 'My Account' },
                { href: '/admin', label: 'Admin Panel' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-brand-tan/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-gold" />
                <span>Pillar No. 834, Ground Floor, Near IGL CNG Pump, AsalatNagar, Muradnagar, UP</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-brand-gold" />
                <a href="tel:+917817878595" className="hover:text-white transition-colors">+91-7817878595</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-brand-gold" />
                <a href="mailto:flavoursfood2023@gmail.com" className="hover:text-white transition-colors break-all">flavoursfood2023@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-brand-gold" />
                <span>11:00 AM – 10:00 PM (Daily)</span>
              </li>
            </ul>
          </div>

          {/* Social & Map */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Follow Us</h4>
            <div className="flex items-center gap-3 mb-4">
              <a
                href="https://instagram.com/flavours.food.byakshay"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-brand-maroon flex items-center justify-center hover:bg-brand-gold transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://wa.me/917817878595"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center hover:bg-green-600 transition-colors text-white text-xs font-bold"
              >
                WA
              </a>
            </div>
            <div className="rounded-lg overflow-hidden border border-brand-maroon/50">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3497.9487233492114!2d77.49072067493579!3d28.750947875600186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf536990ec17b%3A0xc92b1a5141108e9a!2sFlavours%20Food!5e0!3m2!1sen!2sin!4v1782484121684!5m2!1sen!2sin"
                width="100%"
                height="120"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Flavours Food Location"
              />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-brand-maroon/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-tan/60">
          <p>&copy; {new Date().getFullYear()} Flavours Food. All rights reserved.</p>
          <p>Crafted with love, served with a smile</p>
        </div>
      </div>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/917817878595?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20your%20menu%2Forder."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </footer>
  );
}
