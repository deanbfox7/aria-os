import React from "react";
import {
  Diamond,
  LayoutGrid,
  Settings2,
  ArrowUpRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function LandingPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
      toast.success("Waitlist registration successful");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-inter selection:bg-[#D4AF37] selection:text-black">
      <Toaster theme="dark" position="bottom-center" />
      {/* Header / Logo */}
      <header className="pt-32 pb-16 flex flex-col items-center justify-center border-b border-[#111111]">
        <h1 className="text-7xl md:text-9xl font-crimson-text tracking-tight mb-6">
          ARIA<span className="text-[#D4AF37]">.</span>
        </h1>
        <p className="text-[10px] md:text-xs tracking-[0.5em] font-bold text-zinc-500 uppercase">
          Intelligent Business OS
        </p>
      </header>

      {/* Status Ticker */}
      <div className="bg-[#050505] border-b border-[#111111] py-5 overflow-hidden whitespace-nowrap">
        <div className="flex animate-scroll items-center gap-16 text-[9px] md:text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase">
          <StatusItem label="Sales Agents Enabled" />
          <StatusItem label="Predictive Engine Synced" />
          <StatusItem label="Operational Flux Stable" />
          <StatusItem label="Market Neural Net Active" />
          <StatusItem label="Enterprise Data Isolated" />
          {/* Repeat for continuous scroll */}
          <StatusItem label="Sales Agents Enabled" />
          <StatusItem label="Predictive Engine Synced" />
          <StatusItem label="Operational Flux Stable" />
          <StatusItem label="Market Neural Net Active" />
          <StatusItem label="Enterprise Data Isolated" />
          <StatusItem label="Sales Agents Enabled" />
          <StatusItem label="Predictive Engine Synced" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-32">
        <section className="mb-32">
          <div className="max-w-2xl mb-20">
            <span className="text-[10px] tracking-[0.4em] font-bold text-[#D4AF37] uppercase mb-6 block">
              Modules
            </span>
            <h2 className="text-5xl md:text-7xl font-crimson-text leading-[1.1] mb-8">
              The Intelligent Core
            </h2>
            <p className="text-zinc-500 text-xl leading-relaxed font-light">
              A unified operating system designed to automate, optimize, and
              scale every facet of your modern enterprise with surgical
              precision.
            </p>
          </div>

          {/* Grid of Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ModuleCard
              icon={<Diamond className="w-5 h-5 text-[#D4AF37]" />}
              title="Neural Marketing"
              status="Active"
              description="Generative campaigns that adapt in real-time to market sentiment and consumer behavioral patterns."
              features={[
                "Adaptive Content Generation",
                "Sentiment Flow Analysis",
                "Automated Channel Sync",
              ]}
            />
            <ModuleCard
              icon={<LayoutGrid className="w-5 h-5 text-[#D4AF37]" />}
              title="Sales Nexus"
              status="Beta"
              description="Autonomous sales agents that manage pipelines from initial outreach to contract execution."
              features={[
                "Cognitive Lead Scoring",
                "Agentic Outreach Sync",
                "Predictive Revenue Modeling",
              ]}
            />
            <ModuleCard
              icon={<Settings2 className="w-5 h-5 text-[#D4AF37]" />}
              title="Ops Automation"
              status="Active"
              description="Self-healing workflows that identify bottlenecks and reconfigure resources dynamically."
              features={[
                "Workflow Healing Engine",
                "Resource Elasticity Sync",
                "Constraint Optimization",
              ]}
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="pt-32 border-t border-[#111111] flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-crimson-text mb-3">
              Ready to evolve?
            </h3>
            <p className="text-zinc-500 text-sm tracking-widest font-medium uppercase">
              Secure your enterprise position for the next cycle.
            </p>
          </div>

          {submitted ? (
            <div className="flex items-center gap-4 text-[#D4AF37] font-bold tracking-widest uppercase text-sm">
              <CheckCircle2 className="w-6 h-6" />
              Access Pending
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto"
            >
              <input
                type="email"
                placeholder="ENTER EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value.toUpperCase())}
                className="bg-zinc-950 border border-[#111111] px-6 py-5 rounded-full text-xs tracking-widest focus:outline-none focus:border-[#D4AF37]/50 w-full md:w-80 transition-all duration-300"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center justify-center gap-6 bg-white text-black px-10 py-5 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-[#D4AF37] disabled:bg-zinc-800 disabled:text-zinc-500 transition-all duration-500 w-full md:w-auto"
              >
                {loading ? "Processing..." : "Request Early Access"}
                {!loading && (
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Floating Dot */}
      <div className="fixed bottom-10 right-10 w-4 h-4 bg-[#D4AF37] rounded-full cursor-pointer hover:scale-150 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)]" />

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

function StatusItem({ label }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
      <span className="shrink-0">{label}</span>
    </div>
  );
}

function ModuleCard({ icon, title, status, description, features }) {
  return (
    <div className="group relative p-10 bg-[#050505] border border-[#111111] hover:border-[#D4AF37]/30 transition-all duration-700 flex flex-col h-full">
      <div className="mb-10 flex items-start justify-between">
        <div className="p-4 bg-black border border-[#222222] rounded-2xl group-hover:border-[#D4AF37]/50 transition-colors duration-500">
          {icon}
        </div>
        <span className="text-[9px] tracking-[0.2em] font-black text-[#D4AF37] uppercase px-3 py-1.5 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-md">
          {status}
        </span>
      </div>

      <h3 className="text-3xl font-crimson-text mb-6 group-hover:text-[#D4AF37] transition-colors duration-500">
        {title}
      </h3>
      <p className="text-zinc-500 text-[15px] leading-relaxed mb-10 flex-grow font-light">
        {description}
      </p>

      <ul className="space-y-4 pt-8 border-t border-[#111111]">
        {features.map((feature, i) => (
          <li
            key={i}
            className="text-[10px] tracking-[0.2em] font-bold text-zinc-500 uppercase flex items-center gap-4 group/item cursor-default"
          >
            <div className="w-2 h-px bg-zinc-800 group-hover/item:w-4 group-hover/item:bg-[#D4AF37] transition-all duration-300" />
            <span className="group-hover/item:text-zinc-300 transition-colors">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
