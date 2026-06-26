import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import FeaturedDishes from '@/components/home/FeaturedDishes';
import AboutSection from '@/components/home/AboutSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedDishes />
      <AboutSection />
      <TestimonialsSection />
    </>
  );
}
