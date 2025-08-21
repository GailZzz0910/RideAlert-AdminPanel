import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="w-full py-20 px-4" id="about">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                About Ride Alert
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Revolutionizing public transportation through intelligent monitoring and real-time data insights. 
                We're making commuting more predictable, efficient, and comfortable for millions of daily travelers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-gray-600">Daily Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">1200+</div>
                <div className="text-gray-600">Vehicles Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">25</div>
                <div className="text-gray-600">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To transform the daily commuting experience by providing real-time insights into public transportation, 
                helping people make informed decisions and reducing travel uncertainty.
              </p>
            </div>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Dashboard Mockup */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-gray-500 text-sm">Ride Alert Dashboard</div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-6">
                {/* Route Overview */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-900 font-semibold">Active Routes</h4>
                    <div className="text-blue-600 text-sm">Live</div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { route: "Route 42", status: "On Time", capacity: "Available", color: "green" },
                      { route: "Route 15", status: "2 min delay", capacity: "Moderate", color: "yellow" },
                      { route: "Route 23", status: "On Time", capacity: "Full", color: "red" }
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 ${
                            item.color === 'green' ? 'bg-green-400' :
                            item.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                          } rounded-full`}></div>
                          <span className="text-gray-900 text-sm">{item.route}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-700 text-xs">{item.status}</div>
                          <div className="text-gray-500 text-xs">{item.capacity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-blue-600 font-bold text-lg">12</div>
                    <div className="text-gray-600 text-sm">Vehicles Nearby</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <div className="text-green-600 font-bold text-lg">3 min</div>
                    <div className="text-gray-600 text-sm">Avg Wait Time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
