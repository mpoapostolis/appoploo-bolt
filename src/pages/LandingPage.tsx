import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Ship,
  Shield,
  Zap,
  History,
  Users,
  CreditCard,
  Mail,
  Phone,
  Menu,
  X,
  ChevronRight,
  Globe,
  Award,
  Check,
  Anchor,
  Navigation2,
  Wind,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Parallax Ship Component
const ParallaxShip = ({ index }: { index: number }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 100 * (index % 2 ? 1 : -1)]);

  return (
    <motion.div
      style={{ y }}
      className="absolute opacity-[0.03] dark:opacity-[0.07]"
      initial={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        scale: 0.5,
        rotate: Math.random() * 360,
      }}
      animate={{
        rotate: Math.random() * 360,
        scale: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: Math.random() * 20 + 20,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <Ship className="w-24 h-24 text-primary" />
    </motion.div>
  );
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Navigation2 className="w-6 h-6" />,
      title: "Real-Time Tracking",
      description:
        "Monitor your vessel's location with precision GPS tracking updated every minute.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enhanced Security",
      description:
        "Get instant alerts for unauthorized movement and monitor vessel status 24/7.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Engine Monitoring",
      description:
        "Track engine performance, fuel levels, and battery status in real-time.",
    },
    {
      icon: <History className="w-6 h-6" />,
      title: "Route History",
      description:
        "Access detailed voyage history with interactive maps and analytics.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Crew Management",
      description:
        "Manage crew schedules, certifications, and documentation all in one place.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Coverage",
      description:
        "Stay connected anywhere with worldwide satellite coverage and data transmission.",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "150+", label: "Countries" },
    { value: "24/7", label: "Support" },
    { value: "50K+", label: "Vessels" },
  ];

  const plans = [
    {
      name: "Basic",
      price: "29",
      popular: false,
      features: [
        "Real-time GPS tracking",
        "Basic alerts",
        "Engine monitoring",
        "7-day history",
        "Email support",
        "Mobile app access",
      ],
    },
    {
      name: "Pro",
      price: "49",
      popular: true,
      features: [
        "Everything in Basic",
        "Advanced alerts",
        "Detailed analytics",
        "30-day history",
        "Priority support",
        "API access",
        "Multiple users",
      ],
    },
    {
      name: "Enterprise",
      price: "99",
      popular: false,
      features: [
        "Everything in Pro",
        "Custom alerts",
        "White-label option",
        "Unlimited history",
        "24/7 phone support",
        "Custom integrations",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 right-0 left-0 z-50 h-1 bg-primary"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg"
            : ""
        }`}
      >
        <nav className="container py-4 px-4 mx-auto">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 rounded-xl bg-primary/10">
                <Ship className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r to-blue-600 from-primary">
                Appoploo Tracker
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-8 md:flex">
              <a
                href="#features"
                className="text-gray-600 transition-colors dark:text-gray-300 hover:text-primary"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 transition-colors dark:text-gray-300 hover:text-primary"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-600 transition-colors dark:text-gray-300 hover:text-primary"
              >
                Pricing
              </a>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  isAuthenticated ? navigate("/dashboard") : navigate("/login")
                }
                className="px-6 premium-button"
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
                <ChevronRight className="ml-1 w-4 h-4" />
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg md:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <motion.div
            initial={false}
            animate={
              isMenuOpen
                ? { height: "auto", opacity: 1 }
                : { height: 0, opacity: 0 }
            }
            className="overflow-hidden mt-4 md:hidden"
          >
            <div className="py-2 space-y-2">
              <a
                href="#features"
                className="block py-2 px-4 text-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block py-2 px-4 text-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="block py-2 px-4 text-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Pricing
              </a>
              <button
                onClick={() =>
                  isAuthenticated ? navigate("/dashboard") : navigate("/login")
                }
                className="py-2 px-4 w-full text-left rounded-lg text-primary hover:bg-primary/5"
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
              </button>
            </div>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="overflow-hidden relative px-4 pt-32 pb-20">
        {/* Animated background ships */}
        <div className="overflow-hidden absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <ParallaxShip key={i} index={i} />
          ))}
        </div>

        <div className="container relative z-10 mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center py-2 px-4 mb-8 rounded-full bg-primary/10 text-primary"
            >
              <Award className="mr-2 w-4 h-4" />
              <span className="text-sm font-medium">
                Leading Maritime Technology
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 md:text-7xl dark:from-white dark:to-gray-300"
            >
              Sail Smarter, Safer, and Better
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-12 max-w-2xl text-xl text-gray-600 dark:text-gray-300"
            >
              Advanced vessel tracking and monitoring solution for yacht and
              leisure boat owners. Experience the future of maritime technology
              today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col justify-center items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  isAuthenticated ? navigate("/dashboard") : navigate("/login")
                }
                className="py-4 px-8 text-lg premium-button"
              >
                Get Started Now
                <ChevronRight className="ml-1 w-5 h-5" />
              </motion.button>
              <a
                href="#how-it-works"
                className="flex items-center text-gray-600 transition-colors dark:text-gray-300 hover:text-primary"
              >
                Learn More
                <ChevronRight className="ml-1 w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-8 mx-auto mt-20 max-w-4xl md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r to-blue-600 from-primary">
                  {stat.value}
                </div>
                <div className="mt-2 text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b to-white from-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/50"
      >
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 md:text-5xl dark:from-white dark:to-gray-300"
            >
              Powerful Features for Modern Vessels
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300"
            >
              Everything you need to manage your vessel efficiently and safely.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-8 mx-auto max-w-7xl md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 premium-card group"
              >
                <div className="p-3 mb-4 rounded-xl transition-colors bg-primary/10 w-fit dark:bg-primary/20 dark:group-hover:bg-primary/30 group-hover:bg-primary/20">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 md:text-5xl dark:from-white dark:to-gray-300"
            >
              Get Started in Minutes
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300"
            >
              Simple setup process to get your vessel connected and monitored.
            </motion.p>
          </div>

          <div className="grid relative grid-cols-1 gap-8 mx-auto max-w-4xl md:grid-cols-3">
            {/* Connecting line */}
            <div className="hidden absolute right-0 left-0 top-1/2 h-0.5 bg-gradient-to-r transform -translate-y-1/2 md:block from-primary/0 via-primary to-primary/0" />

            {[
              {
                step: "01",
                title: "Order Your Tracker",
                description:
                  "Choose your plan and receive your tracking device within days.",
                icon: <CreditCard className="w-6 h-6" />,
              },
              {
                step: "02",
                title: "Easy Installation",
                description:
                  "Follow our simple guide to install the tracker on your vessel.",
                icon: <Anchor className="w-6 h-6" />,
              },
              {
                step: "03",
                title: "Start Monitoring",
                description:
                  "Access real-time data through our mobile app or web dashboard.",
                icon: <Wind className="w-6 h-6" />,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative z-10 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex justify-center items-center mb-6 w-16 h-16 text-2xl font-bold text-white rounded-full bg-primary"
                >
                  {item.icon}
                </motion.div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-b to-white from-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/50"
      >
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 md:text-5xl dark:from-white dark:to-gray-300"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300"
            >
              Choose the perfect plan for your vessel monitoring needs.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-8 mx-auto max-w-6xl md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`premium-card p-8 relative ${
                  plan.popular
                    ? "border-primary/30 dark:border-primary/30 scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="py-1 px-4 text-sm font-medium text-white rounded-full bg-primary">
                      Most Popular
                    </div>
                  </div>
                )}

                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r to-blue-600 from-primary">
                    ${plan.price}
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    /month
                  </span>
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start text-gray-600 dark:text-gray-300"
                    >
                      <Check className="flex-shrink-0 mt-0.5 mr-3 w-5 h-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className={`w-full premium-button py-4 ${
                    plan.popular ? "bg-primary" : "bg-gray-900 dark:bg-gray-700"
                  }`}
                >
                  Get Started
                  <ChevronRight className="ml-1 w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white"
            >
              Need Help?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-8 text-xl text-gray-600 dark:text-gray-300"
            >
              Our support team is here to assist you 24/7.
            </motion.p>
            <div className="flex flex-col justify-center items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="mailto:support@appoploo.com"
                className="py-4 px-8 w-full sm:w-auto premium-button bg-primary"
              >
                <Mail className="mr-2 w-5 h-5" />
                Email Support
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="tel:+1234567890"
                className="py-4 px-8 w-full bg-gray-900 sm:w-auto dark:bg-gray-700 premium-button"
              >
                <Phone className="mr-2 w-5 h-5" />
                Call Us
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-white bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
            <div>
              <div className="flex items-center mb-6 space-x-3">
                <div className="p-2 rounded-xl bg-white/10">
                  <Ship className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Appoploo Tracker</span>
              </div>
              <p className="text-gray-400">
                Advanced vessel tracking and monitoring solution for the modern
                maritime industry.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-bold">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-bold">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-bold">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-12 text-center text-gray-400 border-t border-gray-800">
            <p>
              © {new Date().getFullYear()} Appoploo Tracker. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
