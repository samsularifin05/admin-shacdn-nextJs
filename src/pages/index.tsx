import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  LayoutDashboard,
  Shield,
  Zap,
  BarChart3,
  Users,
  Settings,
  Smartphone,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/stores/theme-store";
import { SEO } from "@/components/seo";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      title: "Modern Dashboard",
      description:
        "A clean and intuitive interface built with the latest design principles of Shadcn UI.",
      icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
    },
    {
      title: "Real-time Analytics",
      description:
        "Monitor your data in real-time with beautiful charts and deep insights.",
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
    },
    {
      title: "Secured by Design",
      description:
        "Advanced security features to keep your sensitive data safe and protected.",
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      title: "Lightning Fast",
      description:
        "Optimized for performance to ensure smooth interactions and quick load times.",
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
    {
      title: "Team Collaboration",
      description:
        "Easily manage users and permissions with our built-in collaboration tools.",
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      title: "Highly Customizable",
      description:
        "Tailor every aspect of your dashboard to fit your specific business needs.",
      icon: <Settings className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <>
      <SEO title="Shadcn Admin - Modern Admin Dashboard" />
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
        {/* Navigation */}
        <nav
          className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled
            ? "border-b bg-background/80 backdrop-blur-md py-4"
            : "bg-transparent py-6"
            }`}
        >
          <div className="container mx-auto flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Admin<span className="text-primary">Next</span>
              </span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              <a
                href="#features"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Features
              </a>
              <a
                href="#"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Resources
              </a>
              <a
                href="#"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Link href="/auth/login" className="hidden md:block">
                <Button variant="ghost" className="font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button className="font-semibold shadow-lg shadow-primary/20">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
          {/* Background Decorations */}
          <div className="absolute top-0 -z-10 h-full w-full">
            <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
          </div>

          <div className="container mx-auto grid items-center gap-12 px-6 lg:grid-cols-2">
            <div className="flex flex-col gap-8 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  Now v2.0 is live with AI features
                </div>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl">
                Elevate Your{" "}
                <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Workflow
                </span>{" "}
                with AdminNext
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground lg:mx-0 mx-auto">
                Our powerful admin dashboard simplifies data management and team
                collaboration. Scale your business with tools built for
                performance and growth.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/admin/dashboard">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25"
                  >
                    Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base font-bold"
                >
                  View Live Demo
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 lg:justify-start">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 overflow-hidden rounded-full border-2 border-background bg-muted"
                    >
                      <Image
                        loading="lazy"
                        src={`https://i.pravatar.cc/150?u=${i}`}
                        alt="user"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Joined by{" "}
                  <span className="text-foreground font-bold">12,000+</span> users
                  worldwide
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-150 lg:max-w-none">
              <div className="relative rounded-3xl border bg-card p-2 shadow-2xl transition-transform hover:-translate-y-2 duration-500">
                <Image
                  src="/hero-illustration.png"
                  alt="Dashboard Preview"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="rounded-2xl shadow-inner"
                />
                <div className="absolute -bottom-6 -left-6 hidden animate-bounce rounded-2xl border bg-background p-4 shadow-xl md:block">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/20 p-2">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        System Health
                      </p>
                      <p className="text-sm font-bold">99.9% Robust</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-6 -top-6 hidden rounded-2xl border bg-background p-4 shadow-xl md:block">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Active Users
                      </p>
                      <p className="text-sm font-bold">1,429 Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need to Succeed
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Powerful features and professional tools designed to help
                entrepreneurs and engineers build better applications faster.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, idx) => (
                <Card
                  key={idx}
                  className="group border-none bg-background shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold">AdminNext</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Building the future of administrative dashboard management with
                  speed and elegance.
                </p>
              </div>
              <div>
                <h4 className="mb-4 font-bold">Product</h4>
                <ul className="grid gap-2 text-sm text-muted-foreground underline-offset-4">
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-bold">Company</h4>
                <ul className="grid gap-2 text-sm text-muted-foreground underline-offset-4">
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-bold">Legal</h4>
                <ul className="grid gap-2 text-sm text-muted-foreground underline-offset-4">
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground hover:underline">
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} AdminNext. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
