// import React from "react";
// import { cn } from "@/lib/utils";
// import createGlobe from "cobe";
// import { useEffect, useRef } from "react";
// import { motion } from "motion/react";
// import { IconBrandYoutubeFilled } from "@tabler/icons-react";


// export default function FeaturesSectionDemo() {
//   const features = [
//     {
//       title: "Real-Time Vehicle Tracking",
//       description:
//         "Monitor your vehicles live on the map and get instant location updates for every trip.",
//       skeleton: <SkeletonOne />,
//       className:
//         "col-span-1 lg:col-span-4 border-b lg:border-r border-neutral-800 ",
//     },
//     {
//       title: "Instant Alerts & Notifications",
//       description:
//         "Receive smart notifications for arrivals, departures, and important safety events.",
//       skeleton: <SkeletonTwo />,
//       className: "border-b col-span-1 lg:col-span-2 border-neutral-800",
//     },
//     {
//       title: "Trip & Capacity Management",
//       description:
//         "Easily manage trips, view vehicle capacity, and optimize routes for efficiency.",
//       skeleton: <SkeletonThree />,
//       className:
//         "col-span-1 lg:col-span-3 lg:border-r  border-neutral-800",
//     },
//     {
//       title: "Safety & Emergency Features",
//       description:
//         "Access emergency alerts, driver safety tools, and secure reporting for peace of mind.",
//       skeleton: <SkeletonFour />,
//       className: "col-span-1 lg:col-span-3 border-b lg:border-none",
//     },
//   ];
//   return (
//     <div className="relative z-20 w-full border-t min-h-screen border-neutral-800">
//       {/* Subtle dark gradient background, mostly dark with a hint of white at the top */}
//       <div
//         className="absolute inset-0 z-0 "
//         style={{
//           background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%,  15%, #000 40%, #000 100%)",
//         }}
//       />
//       <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto ">
//         <div className="px-8">
//           <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-white">
//             Smarter, Safer, and More Connected Public Transport
//           </h4>

//           <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-center font-normal text-neutral-300">
//             All-in-one platform for tracking, alerts and safety in public transport.
//           </p>
//         </div>

//         <div className="relative bg-black">
//           <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md border-neutral-800">
//             {features.map((feature) => (
//               <FeatureCard key={feature.title} className={feature.className}>
//                 <FeatureTitle>{feature.title}</FeatureTitle>
//                 <FeatureDescription>{feature.description}</FeatureDescription>
//                 <div className=" h-full w-full">{feature.skeleton}</div>
//               </FeatureCard>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const FeatureCard = ({
//   children,
//   className,
// }: {
//   children?: React.ReactNode;
//   className?: string;
// }) => {
//   return (
//     <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
//       {children}
//     </div>
//   );
// };

// const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
//   return (
//     <p className=" max-w-5xl mx-auto text-left tracking-tight text-white text-xl md:text-2xl md:leading-snug">
//       {children}
//     </p>
//   );
// };

// const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
//   return (
//     <p
//       className={cn(
//         "text-sm md:text-base  max-w-4xl text-left mx-auto",
//         " text-center font-normal text-neutral-300",
//         "text-left max-w-sm mx-0 md:text-sm my-2"
//       )}
//     >
//       {children}
//     </p>
//   );
// };

// export const SkeletonOne = () => {
//   return (
//     <div className="relative flex py-8 px-2 gap-10 h-full">
//       <div className="w-full  p-5  mx-auto bg-neutral-900 shadow-2xl group h-full">
//         <div className="flex flex-1 w-full h-full flex-col space-y-2  ">
//           <img
//             src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80"
//             alt="vehicle tracking"
//             width={800}
//             height={800}
//             className="h-full w-full aspect-square object-cover object-center rounded-sm"
//           />
//         </div>
//       </div>

//       <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-black via-black to-transparent w-full pointer-events-none" />
//       <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-black via-transparent to-transparent w-full pointer-events-none" />
//     </div>
//   );
// };

// export const SkeletonThree = () => {
//   return (
//     <a
//       href="https://www.youtube.com/watch?v=RPa3_AD1_Vs"
//       target="__blank"
//       className="relative flex gap-10  h-full group/image"
//     >
//       <div className="w-full  mx-auto bg-transparent dark:bg-transparent group h-full">
//         <div className="flex flex-1 w-full h-full flex-col space-y-2  relative">
//           {/* TODO */}
//           <IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto " />
//           <img
//             src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
//             alt="city bus exterior"
//             width={800}
//             height={800}
//             className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
//           />
//         </div>
//       </div>
//     </a>
//   );
// };

// export const SkeletonTwo = () => {
//   const images = [
//     "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80", // bus interior
//     "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80", // bus exterior
//     "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80", // city traffic
//     "https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=800&q=80", // dashboard
//     "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=800&q=80", // road
//   ];

//   const imageVariants = {
//     whileHover: {
//       scale: 1.1,
//       rotate: 0,
//       zIndex: 100,
//     },
//     whileTap: {
//       scale: 1.1,
//       rotate: 0,
//       zIndex: 100,
//     },
//   };
//   return (
//     <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
//       {/* TODO */}
//       <div className="flex flex-row -ml-20">
//         {images.map((image, idx) => (
//           <motion.div
//             variants={imageVariants}
//             key={"images-first" + idx}
//             style={{
//               rotate: Math.random() * 20 - 10,
//             }}
//             whileHover="whileHover"
//             whileTap="whileTap"
//             className="rounded-xl -mr-4 mt-4 p-1 bg-neutral-800 border-neutral-700 border shrink-0 overflow-hidden"
//           >
//             <img
//               src={image}
//               alt="bali images"
//               width="500"
//               height="500"
//               className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
//             />
//           </motion.div>
//         ))}
//       </div>
//       <div className="flex flex-row">
//         {images.map((image, idx) => (
//           <motion.div
//             key={"images-second" + idx}
//             style={{
//               rotate: Math.random() * 20 - 10,
//             }}
//             variants={imageVariants}
//             whileHover="whileHover"
//             whileTap="whileTap"
//             className="rounded-xl -mr-4 mt-4 p-1 bg-neutral-800 border-neutral-700 border shrink-0 overflow-hidden"
//           >
//             <img
//               src={image}
//               alt="bali images"
//               width="500"
//               height="500"
//               className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
//             />
//           </motion.div>
//         ))}
//       </div>

//       <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-black to-transparent  h-full pointer-events-none" />
//       <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-black to-transparent h-full pointer-events-none" />
//     </div>
//   );
// };

// export const SkeletonFour = () => {
//   return (
//     <div className="h-60 md:h-60  flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
//       <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
//     </div>
//   );
// };

// export const Globe = ({ className }: { className?: string }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     let phi = 0;

//     if (!canvasRef.current) return;

//     const globe = createGlobe(canvasRef.current, {
//       devicePixelRatio: 2,
//       width: 600 * 2,
//       height: 600 * 2,
//       phi: 0,
//       theta: 0,
//       dark: 1,
//       diffuse: 1.2,
//       mapSamples: 16000,
//       mapBrightness: 6,
//       baseColor: [0.3, 0.3, 0.3],
//       markerColor: [0.1, 0.8, 1],
//       glowColor: [1, 1, 1],
//       markers: [
//         // longitude latitude
//         { location: [37.7595, -122.4367], size: 0.03 },
//         { location: [40.7128, -74.006], size: 0.1 },
//       ],
//       onRender: (state) => {
//         // Called on every animation frame.
//         // `state` will be an empty object, return updated params.
//         state.phi = phi;
//         phi += 0.01;
//       },
//     });

//     return () => {
//       globe.destroy();
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
//       className={className}
//     />
//   );
// };
