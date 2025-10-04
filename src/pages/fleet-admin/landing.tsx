import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../../components/ui/hero-section";
// import FeaturesSectionDemo from "../../components/features-section";
import Footer from "../../components/ui/footer";
import NavBar from "../../components/ui/nav-bar";
import { useUser } from "../../context/userContext";

import { ContainerScroll } from "../../components/ui/container-scroll-animation";
import carDashboardImg from "../../assets/home-demo.png";


export default function Landing() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated and not loading, redirect to appropriate dashboard
    if (!loading && user) {
      if (user.role === "superadmin") {
        navigate("/super-admin", { replace: true });
      } else if (user.role === "admin") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-sm text-white">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-black relative">
      {/* Black Basic Grid Background */}
      <div
        className="absolute inset-0 z-0"
      />
      {/* Your Content/Components */}
      <div className="relative z-10">
        <NavBar />
        <main
          className="min-h-screen w-full relative flex flex-col items-center justify-start overflow-x-hidden"
        >
          <HeroSection />
          {/* Scroll Animation Section */}
          <section className="w-full">
            <div className="relative flex flex-col overflow-hidden ">
              <ContainerScroll
                titleComponent={
                  <>
                    <h1 className="text-4xl font-semibold text-white">
                      Unleash the power of <br />
                      <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                        Smart Dashboard
                      </span>
                    </h1>
                  </>
                }
              >
                <img
                  src={carDashboardImg}
                  alt="hero"
                  height={720}
                  width={1400}
                  className="mx-auto rounded-2xl object-cover h-full object-left-top"
                  draggable={false}
                />
              </ContainerScroll>
            </div>
          </section>
          {/* <FeaturesSectionDemo /> */}
        </main>
        <Footer />
      </div>
    </div>
  );
}
