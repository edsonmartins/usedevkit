import Hero from '@/components/Hero';
import ProblemSolution from '@/components/ProblemSolution';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import CodeExamples from '@/components/CodeExamples';
import Comparison from '@/components/Comparison';
import Pricing from '@/components/Pricing';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-terminal-bg">
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <CodeExamples />
      <Comparison />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
