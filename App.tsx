
import React from 'react';
import { useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import GeneratorPage from './pages/GeneratorPage';
import CreditsPage from './pages/CreditsPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  const { page, user } = useAppContext();

  const renderPage = () => {
    // Protected routes
    if (!user && (page === 'generator' || page === 'credits' || page === 'admin')) {
      return <AuthPage />;
    }
    
    // Admin route
    if (page === 'admin' && !user?.isAdmin) {
      // Redirect non-admins trying to access admin page
      return <LandingPage />;
    }

    switch (page) {
      case 'landing':
        return <LandingPage />;
      case 'auth':
        return <AuthPage />;
      case 'generator':
        return <GeneratorPage />;
      case 'credits':
        return <CreditsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-gray-800 dark:text-gray-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
