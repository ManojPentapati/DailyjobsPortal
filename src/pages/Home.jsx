import { useEffect } from "react";
import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import RecentJobs from "../components/home/RecentJobs";
import CategoriesSection from "../components/home/CategoriesSection";
import FAQSection from "../components/home/FAQSection";
import NewsletterSection from "../components/home/NewsletterSection";

export default function Home() {
  useEffect(() => {
    document.title = "Daily Jobs Portal – Find Your Next Tech Opportunity in India";
  }, []);

  return (
    <main id="main-content">
      <HeroSection />
      <RecentJobs />
      <HowItWorks />
      <CategoriesSection />
      <FAQSection />
      <NewsletterSection />
    </main>
  );
}
