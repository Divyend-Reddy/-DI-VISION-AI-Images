
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { SunIcon, MoonIcon, LogoIcon } from './Icons';

const Header: React.FC = () => {
  const { theme, toggleTheme, user, logout, setPage } = useAppContext();

  return (
    <header className="sticky top-0 z-50 bg-light-card/80 dark:bg-dark-card/80 backdrop-filter backdrop-blur border-b border-light-border dark:border-dark-border shadow-soft dark:shadow-soft-dark">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setPage(user?.isAdmin ? 'admin' : 'landing')}
        >
          <LogoIcon className="h-8 w-8 text-gray-800 dark:text-white group-hover:text-primary transition-colors"/>
          <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">DI-VISION</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <NavItem onClick={() => setPage('generator')}>Generator</NavItem>
          <NavItem onClick={() => setPage('credits')}>Credits</NavItem>
          {user?.isAdmin && <NavItem onClick={() => setPage('admin')}>Admin Dashboard</NavItem>}
          <NavItem onClick={() => window.open('mailto:divyendreddy1@gmail.com', '_blank')}>Contact</NavItem>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{user.credits} credits</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPage('auth')}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-all transform hover:scale-105"
            >
              Login / Sign Up
            </button>
          )}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </nav>
    </header>
  );
};

const NavItem: React.FC<{ onClick: () => void, children: React.ReactNode }> = ({ onClick, children }) => (
    <button onClick={onClick} className="font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
        {children}
    </button>
);


export default Header;
