import Navbar from "@/components/landing/Navbar";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Footer from "@/components/landing/Footer";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <OnboardingWizard />
      </div>
      <Footer />
    </div>
  );
}
