import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Heart,
  Shield,
  Truck,
  Award,
  Clock
} from 'lucide-react';

const Footer = () => {
  
  const categories = [
    { name: 'Rings', path: '/products?category=engagement-rings' },
    { name: 'Earrings', path: '/products?category=wedding-bands' },
    { name: 'Necklaces', path: '/products?category=diamonds' },
    { name: 'Bracelets', path: '/products?category=gold' },
    { name: 'Anklets', path: '/products?category=silver' },
    
  ];

  const policies = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    
    
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  const trustBadges = [
    { icon: Shield, text: 'Secure Shopping' },
    { icon: Award, text: 'Certified Authentic' },
    { icon: Truck, text: 'Free Shipping' },
    { icon: Clock, text: '24/7 Support' }
  ];

  return (
    <footer className="bg-gradient-to-br from-[#523A28] to-[#A47551] text-white">
      
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <Crown className="h-12 w-12 mx-auto text-[#E4D4C8] mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Stay Connected with SváRIN
            </h3>
            <p className="text-[#E4D4C8] mb-6 max-w-2xl mx-auto">
              Be the first to know about new collections, exclusive offers, and jewelry care tips
            </p>
            
            
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              
              <span className="text-2xl font-bold">SváRIN</span>
            </div>
            
            <p className="text-[#E4D4C8] mb-6 leading-relaxed">
              Crafting timeless elegance . We specialize in creating exquisite jewelry pieces that celebrate life's most precious moments.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#E4D4C8] flex-shrink-0" />
                <span className="text-sm">123 Jewelry  Wardha, Maharashtra 400001</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#E4D4C8] flex-shrink-0" />
                <span className="text-sm">+91 67765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#E4D4C8] flex-shrink-0" />
                <span className="text-sm">info@SváRIN.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-white/10 hover:bg-[#E4D4C8] hover:text-[#523A28] p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Categories</h4>
            <ul className="space-y-3">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link
                    to={category.path}
                    className="text-[#E4D4C8] hover:text-white transition-colors duration-300 text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies & Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support & Policies</h4>
            <ul className="space-y-3">
              {policies.map((policy, index) => (
                <li key={index}>
                  <Link
                    to={policy.path}
                    className="text-[#E4D4C8] hover:text-white transition-colors duration-300 text-sm"
                  >
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>

           
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <badge.icon className="h-8 w-8 text-[#E4D4C8]" />
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#523A28]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-[#E4D4C8] text-center md:text-left">
              © 2025 SváRIN. All rights reserved. | Made with <Heart className="inline h-4 w-4 text-red-400 mx-1" /> in India
            </div>
            
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;