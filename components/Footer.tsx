
import React from 'react';
import { LogoIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent">
      <div className="container mx-auto px-4 py-8 text-gray-500 dark:text-gray-400">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-6 w-6" />
            <span className="font-semibold">DI-VISION Images</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} DI-VISION Images. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm">
            <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">Privacy Policy</a>
            <span className="opacity-50">|</span>
            <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
