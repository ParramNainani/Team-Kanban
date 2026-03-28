"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Target,
  FileText,
  MessageCircle,
  Users,
  ArrowRight,
  Play,
  CheckCircle,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Send,
} from "lucide-react";
import type { Message, SchemeSummary } from "@/types";

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi, I'm Sahayak AI. Tell me about your situation and I'll help you find relevant schemes.",
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err?.error === "string" ? err.error : res.statusText
        );
      }

      const data = await res.json();
      const assistant = data.message as Message;
      if (!assistant || assistant.role !== "assistant") {
        throw new Error("Invalid response");
      }
      setMessages((prev) => [...prev, assistant]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            e instanceof Error
              ? `Something went wrong: ${e.message}`
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 sticky top-0 backdrop-blur-xl bg-slate-950/80 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-8 h-8 text-amber-400" />
              <span className="text-2xl font-bold text-white">Sahayak AI</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-amber-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-300 hover:text-amber-400 transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-slate-300 hover:text-amber-400 transition-colors">
                Benefits
              </a>
              <a href="#demo" className="text-slate-300 hover:text-amber-400 transition-colors">
                Demo
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-full font-medium hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg"
            >
              Try Demo
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-powered welfare discovery
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Discover the government
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {" "}support
              </span>
              <br />
              you may be missing
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Sahayak AI understands your unique situation through conversation and matches you with relevant government schemes, benefits, and support programs you might not know about.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-amber-400 hover:to-orange-500 transition-all shadow-xl"
              >
                Start Conversation
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
              >
                View Benefits
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                  <Target className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Smart Matching</h3>
                  <p className="text-slate-300 text-sm">AI analyzes your situation to find perfect scheme matches</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                  <TrendingUp className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Benefit Insights</h3>
                  <p className="text-slate-300 text-sm">See estimated benefits and requirements at a glance</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                  <FileText className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Clear Guidance</h3>
                  <p className="text-slate-300 text-sm">Step-by-step instructions for applying and next steps</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful AI-driven
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {" "}features
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built with advanced AI to make government welfare discovery simple, accurate, and accessible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Conversational AI",
                description: "Natural conversation to understand your unique situation and needs",
              },
              {
                icon: Target,
                title: "Smart Scheme Matching",
                description: "AI-powered matching finds schemes you qualify for based on your profile",
              },
              {
                icon: TrendingUp,
                title: "Benefit Estimation",
                description: "See potential financial benefits and support amounts you might receive",
              },
              {
                icon: FileText,
                title: "Document Guidance",
                description: "Clear requirements and step-by-step application instructions",
              },
              {
                icon: Users,
                title: "For Citizens & NGOs",
                description: "Designed for individuals and organizations helping communities",
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Your conversations are secure and used only to find relevant support",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-amber-500/30 transition-all group"
              >
                <feature.icon className="w-12 h-12 text-amber-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How it
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {" "}works
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Four simple steps to discover government support tailored to your situation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Describe Your Situation",
                description: "Tell Sahayak AI about your circumstances, income, family, or challenges you're facing.",
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our AI understands your context and identifies relevant government schemes and benefits.",
              },
              {
                step: "03",
                title: "Scheme Matching",
                description: "Get personalized recommendations for schemes you may qualify for with eligibility details.",
              },
              {
                step: "04",
                title: "Take Action",
                description: "See estimated benefits, required documents, and clear next steps to apply.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Section */}
      <section id="benefits" className="relative z-10 px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Real impact for
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {" "}real people
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Sahayak AI helps citizens access the support they're entitled to, making government welfare more accessible and effective.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                stat: "85%",
                title: "More Benefits Found",
                description: "Users discover schemes they didn't know existed",
              },
              {
                icon: Clock,
                stat: "60%",
                title: "Faster Access",
                description: "Reduce time spent researching and applying for support",
              },
              {
                icon: CheckCircle,
                stat: "95%",
                title: "Accuracy Rate",
                description: "Precise scheme matching based on user eligibility",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center hover:border-amber-500/30 transition-all"
              >
                <item.icon className="w-12 h-12 text-amber-400 mx-auto mb-6" />
                <div className="text-4xl font-bold text-white mb-2">{item.stat}</div>
                <h3 className="text-xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-slate-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="relative z-10 px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Try Sahayak AI
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {" "}now
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience how our AI understands your situation and finds relevant government support.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="border-b border-white/10 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Bot className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Sahayak AI Assistant</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="h-96 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MessageRow message={msg} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-800/80 border border-white/10 rounded-2xl px-6 py-4 shadow-lg">
                        <div className="flex items-center space-x-3">
                          <Bot className="w-5 h-5 text-amber-400" />
                          <div className="flex gap-1">
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="h-2 w-2 bg-amber-400 rounded-full"
                            />
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              className="h-2 w-2 bg-amber-400 rounded-full"
                            />
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              className="h-2 w-2 bg-amber-400 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-white/10 p-6">
                  <form
                    className="flex gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSend();
                    }}
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe your situation..."
                      disabled={loading}
                      className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
                      aria-label="Message"
                    />
                    <motion.button
                      type="submit"
                      disabled={loading || !input.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3 rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start discovering your
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {" "}eligible support
              </span>
              {" "}today
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Join thousands who have found government schemes and benefits they qualify for with Sahayak AI.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-12 py-4 rounded-full font-semibold text-lg hover:from-amber-400 hover:to-orange-500 transition-all shadow-xl"
            >
              Start Your Conversation
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bot className="w-6 h-6 text-amber-400" />
              <span className="text-lg font-semibold text-white">Sahayak AI</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 Sahayak AI. Helping citizens discover government support.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MessageRow({ message: msg }: { message: Message }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl px-6 py-4 text-white shadow-lg">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {msg.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-slate-800/80 border border-white/10 rounded-2xl px-6 py-4 text-slate-100 shadow-lg sm:max-w-[70%]">
        <div className="flex items-start space-x-3">
          <Bot className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {msg.content}
            </p>
            {msg.schemes && msg.schemes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4 border-t border-white/10 pt-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Matching Schemes
                </p>
                <div className="space-y-4">
                  {msg.schemes.map((s, index) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <SchemeCard scheme={s} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SchemeCard({ scheme: s }: { scheme: SchemeSummary }) {
  const benefit = s.estimatedBenefit.toLocaleString("en-IN");

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      className="bg-slate-900/80 border border-white/10 rounded-xl p-4 text-sm shadow-lg hover:border-amber-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white flex-1">{s.name}</h3>
        <div className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-xs font-medium">
          Relevant
        </div>
      </div>
      <p className="text-slate-300 mb-3 leading-relaxed">{s.benefits}</p>
      <div className="flex items-center justify-between">
        <p className="font-medium text-amber-400">
          Est. benefit: ₹{benefit}
        </p>
        {s.documents.length > 0 && (
          <div className="flex items-center text-xs text-slate-400">
            <FileText className="w-3 h-3 mr-1" />
            {s.documents.length} docs
          </div>
        )}
      </div>
    </motion.article>
  );
}
