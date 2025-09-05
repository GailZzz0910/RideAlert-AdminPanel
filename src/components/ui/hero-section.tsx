import { motion } from "framer-motion";
// import { World } from "../ui/globe";
import { FlipWords } from "../ui/flip-words";
// import { globeConfig, sampleArcs } from "../../data/globe-data";

export default function HeroSection() {
  // ...existing code...
  return (
    <section className="min-h-screen w-full py-0 pt-25 px-0 relative flex items-center justify-center" id="hero">
      {/* Grid Background for whole hero section */}
      <div
        className={`
          absolute inset-0 -z-10
          [background-size:40px_40px]
          [background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]
        `}
      />
      {/* Mask for faded effect */}
  <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative w-full h-[70vh] flex items-center justify-center">
        <div className="h-full w-full max-w-7xl mx-auto flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center overflow-visible w-full">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="px-10 text-center lg:text-left flex flex-col items-center lg:items-start"
            >
              <div className="mt-2 mb-6 w-full">
                <div className="font-bold text-whit
                  text-5xl sm:text-10xl md:text-6xl lg:text-1xl
                  leading-tight sm:leading-tight md:leading-tight lg:leading-tight
                  break-words w-full text-white  ">
                  Move 
                  <span className="inline-block  bg-neutral-800 bg-opacity-80 rounded-lg px-4 ml-2 text-white shadow-md align-middle border"><FlipWords words={["smarter", "safer", "easier", "together",]} /></span> <br />
                  with Ride Alert!
                </div>
                <div className="mt-4 text-neutral-300 text-lg sm:text-2xl font-normal w-full">
                  Track vehicles in real time and get instant alerts.
                  Manage trips and safety—all in one platform.
                </div>
              </div>
              <div className="flex flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
                <button className="bg-white text-black px-4 py-2 sm:px-8 sm:py-4 rounded-xl font-mediumshadow-sm w-auto text-sm sm:text-base cursor-pointer">
                  Start Tracking
                </button>
              </div>
            </motion.div>
            {/* Right Content - Mobile App Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center  w-full overflow-visible"
            >
              {/* Globe Visualization */}
              <div className="w-full h-[380px] sm:h-[300px] md:h-[400px] lg:h-[600px] overflow-visible">
                {/* <World data={sampleArcs} globeConfig={globeConfig} /> */}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
