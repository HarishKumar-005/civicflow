import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Map,
  Shield,
  Users,
  Zap,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Smart Intake",
    description: "Collect reports from forms, uploads, and field notes. AI extracts structure from messy data automatically.",
    span: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: Target,
    title: "Priority Scoring",
    description: "Transparent urgency ranking based on severity, affected population, recency, and vulnerability.",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    icon: Users,
    title: "Volunteer Matching",
    description: "Multi-factor matching: skill fit, proximity, availability, and category preference.",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    icon: Map,
    title: "Live Map View",
    description: "Real-time heatmap of community needs. Identify hotspots and coverage gaps at a glance.",
    span: "col-span-1 md:col-span-2 lg:col-span-2",
  },
];

const stats = [
  { value: "10x", label: "Faster Triage", icon: Clock },
  { value: "85%", label: "Match Accuracy", icon: Target },
  { value: "3min", label: "Avg Response", icon: Zap },
  { value: "60%", label: "Less Duplication", icon: TrendingUp },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium ambient backdrop */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-lg font-heading font-bold tracking-tight text-foreground">CivicFlow</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="font-semibold shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-4xl mx-auto text-center mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card shadow-sm text-primary text-sm font-semibold mb-8">
            <Shield className="h-4 w-4" />
            Official Community Intelligence Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight leading-[1.1] mb-6 text-primary">
            Turn scattered reports into <br />
            <span className="text-accent inline-block mt-2">structured action.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            CivicFlow transforms fragmented community-needs data into prioritized intelligence,
            matching volunteers to the highest-impact tasks in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 h-14 rounded-xl shadow-md hover:shadow-lg transition-all">
                Start Coordinating <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-base px-8 h-14 rounded-xl shadow-sm bg-card border-border hover:bg-muted transition-all">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bento */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center flex flex-col items-center justify-center">
                <div className="p-3 bg-primary/5 rounded-full mb-3 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-3xl font-heading font-extrabold text-foreground mb-1">
                  {stat.value}
                </span>
                <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary mb-4">
              Mission control for civic teams
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              Everything an NGO needs to consolidate data, prioritize action, and coordinate
              volunteers — perfectly organized in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`${feature.span} group bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between`}
              >
                <div className="p-3 rounded-xl bg-primary/5 text-primary w-fit group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-border mt-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary mb-4">
              From chaos to clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Collect", desc: "Submit reports from any source — forms, photos, or field notes" },
              { step: "02", title: "Structure", desc: "AI extracts categories, urgency, and location securely" },
              { step: "03", title: "Prioritize", desc: "Transparent scoring ranks needs by severity and impact" },
              { step: "04", title: "Deploy", desc: "Match and assign the best-fit volunteer for every task" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 bg-background rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-7xl font-heading font-extrabold text-primary/5 -z-10 select-none">
                  {item.step}
                </div>
                <h3 className="text-xl font-heading font-bold mb-2 text-primary">{item.title}</h3>
                <p className="text-sm font-medium text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-base font-heading font-bold">CivicFlow</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Built for the GDG Solution Challenge 2025.
          </p>
        </div>
      </footer>
    </div>
  );
}
