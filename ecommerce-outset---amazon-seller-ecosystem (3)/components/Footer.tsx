
import React from 'react';
import { FOOTER_LINKS, SOCIAL_MEDIA_LINKS } from '../constants';
import { trackCTAClick } from '../utils/trackingUtils'; // Updated Import
import type { NavItem } from '../types';
import { LogoIcon } from './icons';
import Button from './Button';
import useVisitorStore from '../store/visitorStore'; // To potentially update subscriber status

interface FooterProps {
  showNewsletterSignup?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showNewsletterSignup = true }) => {
  const { setEmailSubscriberStatus } = useVisitorStore();

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailInput = (event.target as HTMLFormElement).elements.namedItem('email') as HTMLInputElement;
    const email = emailInput?.value;
    if (email) {
      trackCTAClick('Footer Newsletter Subscribe', { email });
      // Here you would typically call an API to subscribe the user
      console.log(`Subscribing ${email} to newsletter (Placeholder)`);
      setEmailSubscriberStatus(true); // Update visitor store
      alert(`Thanks for subscribing, ${email}! (Placeholder)`);
      emailInput.value = ''; // Clear input
    }
  };

  return (
    <footer id="contact" className="bg-gray-900 border-t border-gray-700 pt-16 pb-8 text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8 mb-12">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
            <div className="flex items-center mb-4">
              <LogoIcon className="h-10 w-10 text-orange-500" />
              <span className="ml-2 text-xl font-bold text-white">Ecommerce Outset</span>
            </div>
            <p className="text-sm mb-4">
              The complete Amazon ecosystem for sellers at every stage. Join our community and find your path to success.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_MEDIA_LINKS.map(link => (
                <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <link.Icon className="h-6 w-6" />
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {FOOTER_LINKS.map(section => (
            <div key={section.title}>
              <h5 className="font-semibold text-white mb-3">{section.title}</h5>
              <ul className="space-y-2">
                {section.items.map((item: NavItem) => (
                  <li key={item.label}>
                    <a href={item.href} className={`text-sm hover:text-orange-400 transition-colors ${item.accentColor || ''}`}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Signup */}
          {showNewsletterSignup && (
            <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
              <h5 className="font-semibold text-white mb-3">Stay Updated</h5>
              <p className="text-sm mb-3">Get the latest Amazon insights and EO updates directly to your inbox.</p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                  required
                />
                <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">Subscribe</Button>
              </form>
            </div>
          )}
          {!showNewsletterSignup && (
             <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
                <h5 className="font-semibold text-white mb-3">You're Subscribed!</h5>
                <p className="text-sm mb-3">Manage your <a href="#" className="text-orange-400 hover:underline">email preferences here</a>.</p>
             </div>
          )}

        </div>

        <div className="border-t border-gray-700 pt-8 mt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Ecommerce Outset. All rights reserved.</p>
          <p className="mt-1">Contact: support@ecommerceoutset.com | +1 (555) 123-4567</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
