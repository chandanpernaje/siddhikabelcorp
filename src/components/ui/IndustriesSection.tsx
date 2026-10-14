import React from "react";
import {
  Factory,
  Cpu,
  Sun,
  Coffee,
  Flame,
  Building,
  Box,
  TestTube,
  Microscope,
  Scissors,
  HardHat,
  ClipboardList,
  Car,
  Bot,
  Stethoscope,
  Wrench,
  Anchor,
  Shield,
  CheckCircle2,
  Settings2,
  PackageSearch,
  Globe2,
  Clock,
  Layers
} from "lucide-react";

export const IndustriesSection: React.FC = () => {
  const industries = [
    { title: "OEM & Machine Manufacturers", desc: "Supporting machine builders with reliable cables, automation components and industrial electrical solutions.", icon: Factory, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Panel Builders & System Integrators", desc: "Solutions for control panels, automation systems, electrical integration and industrial installations.", icon: Cpu, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Renewable Energy – Solar & Wind", desc: "Products and components designed for solar, wind and other renewable energy applications.", icon: Sun, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Food & Beverage", desc: "Reliable solutions for processing, packaging, conveyor and automated production systems.", icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Oil, Gas, Chemical & Paint", desc: "Industrial electrical and automation solutions for demanding process environments.", icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Steel & Cement", desc: "Robust products for heavy-duty manufacturing, processing and material-handling applications.", icon: Building, color: "text-slate-500", bg: "bg-slate-500/10" },
    { title: "Packaging Machinery", desc: "Cables, automation and control solutions for high-speed packaging equipment.", icon: Box, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Pharmaceutical & Biotech", desc: "Supporting automated production, processing and laboratory equipment.", icon: TestTube, color: "text-teal-500", bg: "bg-teal-500/10" },
    { title: "Research & Development", desc: "Components and solutions for testing equipment, prototypes, automation systems and specialized applications.", icon: Microscope, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Garment & Textile", desc: "Electrical and automation solutions for textile machinery, production lines and material handling.", icon: Scissors, color: "text-pink-500", bg: "bg-pink-500/10" },
    { title: "Construction Industry", desc: "Products for construction equipment, electrical systems, automation and infrastructure projects.", icon: HardHat, color: "text-yellow-600", bg: "bg-yellow-600/10" },
    { title: "Contractors & Project Management", desc: "Supporting electrical contractors and project teams with industrial products and application-specific solutions.", icon: ClipboardList, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { title: "Automobile & Rail Transport", desc: "Solutions for automotive manufacturing, production automation, railway systems and material handling.", icon: Car, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Automation & Robotics", desc: "Cables and industrial components for robotics, motion control, automation and smart manufacturing.", icon: Bot, color: "text-violet-500", bg: "bg-violet-500/10" },
    { title: "Medical Equipment", desc: "Reliable components for medical equipment and specialized electrical applications.", icon: Stethoscope, color: "text-sky-500", bg: "bg-sky-500/10" },
    { title: "Mechanical & Plant Engineering", desc: "Solutions for machinery, plant equipment, production systems and industrial engineering projects.", icon: Wrench, color: "text-lime-600", bg: "bg-lime-600/10" },
    { title: "Marine Engineering", desc: "Electrical and automation products for marine and specialized engineering applications.", icon: Anchor, color: "text-blue-700", bg: "bg-blue-700/10" },
    { title: "Defence", desc: "Industrial electrical and specialized solutions for demanding defence-related applications.", icon: Shield, color: "text-slate-800", bg: "bg-slate-800/10" }
  ];

  const whyChoose = [
    { title: "Wide Product Range", desc: "Access to cables, wires, automation products and industrial electrical components from multiple product categories.", icon: Layers },
    { title: "Application-Focused Support", desc: "We help customers identify suitable products based on their technical and application requirements.", icon: PackageSearch },
    { title: "Industrial Experience", desc: "Experience supporting diverse industrial sectors and automation applications.", icon: Globe2 },
    { title: "Reliable Supply", desc: "Focused on dependable sourcing and timely supply for industrial requirements.", icon: Clock },
    { title: "Customized Solutions", desc: "Support for project-specific, machine-specific and application-specific requirements.", icon: Settings2 }
  ];

  return (
    <section id="industries" className="w-full scroll-mt-24 pt-16 lg:pt-24 pb-0 bg-slate-50 border-y border-slate-200">
      <div className="w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          <div className="lg:col-span-7 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-amber-600 font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Industries & Solutions
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Powering Industrial Automation <br className="hidden xl:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Across Diverse Industries</span>
            </h2>
            
            <div className="space-y-4 text-slate-600 font-medium text-sm sm:text-base leading-relaxed pt-2">
              <p>
                As industries move rapidly toward automation, Industry 4.0, robotics, IoT, and smart manufacturing, choosing the right electrical and automation components is essential for reliable, efficient, and future-ready operations.
              </p>
              <p>
                At <strong className="text-slate-900">Siddhi Kabel Corporation Private Limited</strong>, we support businesses across a wide range of industries with reliable cables, wires, automation products, electrical components, and industrial solutions.
              </p>
              <p>
                From machine builders and system integrators to large-scale manufacturing plants, our solutions are selected to meet the demanding requirements of modern industrial applications.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group">
            <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
            <img 
              src="/images/industries-hero.jpg" 
              alt="Industrial Automation and Cables" 
              className="w-full h-auto aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        {/* Industries Grid */}
        <div className="mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">
            Industries We Cater To
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {industries.map((ind, idx) => (
              <div 
                key={idx} 
                className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-slate-300 transition-all duration-500 relative overflow-hidden cursor-pointer"
              >
                {/* Expandable background blob */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${ind.bg} to-transparent rounded-full opacity-20 group-hover:scale-[2.5] group-hover:opacity-40 transition-all duration-700 ease-out`} />
                
                {/* Icon Container */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ind.bg} ${ind.color} mb-4 group-hover:-translate-y-1 group-hover:shadow-md transition-all duration-300 relative z-10`}>
                  <ind.icon strokeWidth={1.5} className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </div>

                <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors duration-300 text-sm sm:text-base mb-2 relative z-10 leading-tight">
                  {ind.title}
                </h4>
                
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed relative z-10 group-hover:text-slate-600 transition-colors duration-300">
                  {ind.desc}
                </p>
                
                {/* Subtle bottom border highlight */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-amber-400 to-orange-500 group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Value Proposition / Expertise */}
      <div className="bg-slate-900 p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300 via-transparent to-transparent"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-amber-500 text-sm font-mono uppercase tracking-widest font-bold mb-4">
                Industries • Applications • Solutions
              </h3>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-6 leading-tight">
                Our expertise goes beyond supplying products.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed mb-4">
                We understand that every industry has different operating conditions, technical requirements and application challenges.
              </p>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
                Our team works with OEMs, engineers, panel builders, system integrators, contractors and project teams to help identify suitable products for their applications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t border-slate-800">
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center mb-4">
                <h4 className="text-xl font-bold text-white">Why Industries Choose Siddhi Kabel</h4>
              </div>
              {whyChoose.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <item.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm mb-1">{item.title}</h5>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </section>
  );
};
