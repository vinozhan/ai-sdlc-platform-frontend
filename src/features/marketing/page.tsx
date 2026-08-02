import { LandingBackground } from "./components/LandingBackground";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ValueProp } from "./components/ValueProp";
import { HowItWorks } from "./components/HowItWorks";
import { Testimonials } from "./components/Testimonials";
import { Pricing } from "./components/Pricing";
import { Faq } from "./components/Faq";
import { FooterCta } from "./components/FooterCta";

export function Landing() {
  return (
    <div className="landing-page min-h-screen bg-white text-slate-900">
      <LandingBackground />
      <Navbar />
      <Hero />
      <ValueProp />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Faq />
      <FooterCta />
    </div>
  );
}

export default Landing;
