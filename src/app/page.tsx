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
    description:
      "Collect reports from forms, uploads, and field notes. AI extracts structure from messy data automatically.",
  },
  {
    icon: Target,
    title: "Priority Scoring",
    description:
      "Transparent urgency ranking based on severity, affected population, recency, and location vulnerability.",
  },
  {
    icon: Users,
    title: "Volunteer Matching",
    description:
      "Multi-factor matching: skill fit, proximity, availability, workload balance, and category preference.",
  },
  {
    icon: Map,
    title: "Live Map View",
    description:
      "Real-time heatmap of community needs. Identify hotspots and coverage gaps at a glance.",
  },
  {
    icon: BarChart3,
    title: "Impact Analytics",
    description:
      "Track resolution rates, response times, and volunteer utilization with clear, actionable charts.",
  },
  {
    icon: Shield,
    title: "Audit Trail",
    description:
      "Every action logged. Full accountability and transparency for organizers and stakeholders.",
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">CivicFlow</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="cursor-pointer">
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            Community Intelligence Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Turn scattered reports into{" "}
            <span className="text-primary">structured action</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            CivicFlow transforms fragmented community-needs data into prioritized intelligence,
            and matches volunteers to the highest-impact tasks in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="cursor-pointer text-base px-8 h-12">
                Start Coordinating <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="cursor-pointer text-base px-8 h-12">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="h-5 w-5 text-primary mr-2" />
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Mission control for civic teams
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything an NGO needs to consolidate data, prioritize action, and coordinate
              volunteers — in one operational dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-200 cursor-pointer"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-card/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              From chaos to clarity
            </h2>
            <p className="text-muted-foreground text-lg">
              A simple yet powerful pipeline that turns raw field data into coordinated action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Collect", desc: "Submit reports from any source — forms, photos, or field notes" },
              { step: "02", title: "Structure", desc: "AI extracts categories, urgency, and location from raw inputs" },
              { step: "03", title: "Prioritize", desc: "Transparent scoring ranks needs by severity, impact, and recency" },
              { step: "04", title: "Deploy", desc: "Match and assign the best-fit volunteer for every task" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-extrabold text-primary/20 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to transform your community operations?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            CivicFlow gives your team the visibility and intelligence to act faster, smarter, and
            with greater impact.
          </p>
          <Link href="/signup">
            <Button size="lg" className="cursor-pointer text-base px-10 h-12">
              Get Started Free <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">CivicFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for the GDG Solution Challenge 2025. Community intelligence for social good.
          </p>
        </div>
      </footer>
    </div>
  );
}
