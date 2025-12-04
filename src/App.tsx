import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { UseCasesSection } from './components/UseCasesSection';
import { ScreensShowcaseSection } from './components/ScreensShowcaseSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PricingSection } from './components/PricingSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
export function App() {
  return <div className="w-full min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <UseCasesSection />
      <ScreensShowcaseSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>;
}