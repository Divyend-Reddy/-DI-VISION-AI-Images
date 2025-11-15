
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const LandingPage: React.FC = () => {
  const { setPage } = useAppContext();

  return (
    <div className="space-y-32 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white">
          The Vision of AI, Distilled.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
          Welcome to DI-VISION, a professional AI image generation platform. Create stunning visuals from text with unparalleled speed, security, and privacy.
        </p>
        <button 
            onClick={() => setPage('generator')}
            className="px-8 py-4 text-lg font-bold text-white bg-primary rounded-lg shadow-lg hover:bg-primary-hover transform hover:scale-105 transition-all duration-300"
        >
          Start Generating for Free
        </button>
      </section>

      {/* Demo Gallery */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GalleryImage src="https://picsum.photos/seed/future-woman/500/800" alt="AI generated futuristic woman" className="row-span-2" />
            <GalleryImage src="https://picsum.photos/seed/neon-car/500/500" alt="AI generated neon car" />
            <GalleryImage src="https://picsum.photos/seed/space-city/500/500" alt="AI generated space city" />
            <GalleryImage src="https://picsum.photos/seed/robot-friend/500/800" alt="AI generated friendly robot" className="row-span-2" />
            <GalleryImage src="https://picsum.photos/seed/fantasy-world/500/500" alt="AI generated fantasy landscape" />
            <GalleryImage src="https://picsum.photos/seed/cyber-animal/500/500" alt="AI generated cybernetic animal" />
        </div>
      </section>
      
      {/* Features Section */}
      <section>
        <h2 className="text-4xl font-bold text-center mb-16">A Platform Built for Professionals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard title="Instant Generation" description="Leverage a state-of-the-art AI engine to produce high-quality images in mere seconds." />
          <FeatureCard title="Absolute Privacy" description="We never store your prompts or images. Your creative process is confidential and entirely your own." />
          <FeatureCard title="Creator-Friendly" description="Sign up and receive 25 free credits. No subscriptions, just a simple, secure credit-based system." />
        </div>
      </section>
      
      {/* How It Works */}
      <section>
        <h2 className="text-4xl font-bold text-center mb-16">Simple, Powerful Workflow</h2>
        <div className="relative flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-light-border dark:bg-dark-border hidden md:block" />
            <Step number="1" title="Create Account" description="Sign up to get 25 free credits instantly."/>
            <Step number="2" title="Describe Your Vision" description="Use our powerful generator to describe the image you want to create."/>
            <Step number="3" title="Generate & Download" description="Create and download your unique, high-resolution AI visual."/>
        </div>
      </section>
    </div>
  );
};

const GalleryImage: React.FC<{ src: string, alt: string, className?: string}> = ({ src, alt, className = '' }) => (
    <div className={`rounded-2xl overflow-hidden shadow-soft dark:shadow-soft-dark ${className}`}>
        <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
    </div>
);

const FeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="p-8 bg-light-card/80 dark:bg-dark-card/80 rounded-2xl shadow-soft dark:shadow-soft-dark border border-light-border dark:border-dark-border backdrop-filter backdrop-blur animate-slide-in-up">
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const Step: React.FC<{ number: string, title: string, description: string}> = ({number, title, description}) => (
    <div className="text-center max-w-xs z-10 animate-slide-in-up">
        <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center text-2xl font-bold bg-primary text-white rounded-full border-4 border-light-bg dark:border-dark-bg">
            {number}
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);


export default LandingPage;
