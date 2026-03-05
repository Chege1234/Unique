import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Ticket,
  ArrowRight,
  Hash,
  Sparkles,
  Zap,
  Shield,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [studentNumber, setStudentNumber] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{8}$/.test(studentNumber)) {
      setError("Please enter a valid 8-digit student number");
      return;
    }

    navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
      {/* Background Glows for No-Layout Pages */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs sm:text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Next-Gen Queue Management
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none">
            Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">Queue</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100/70 max-w-2xl mx-auto font-medium leading-relaxed">
            Experience the future of campus services with our frictionless,
            real-time queueing ecosystem.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Main Action Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="glass-card border-none overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center p-8 sm:p-10 border-b border-white/5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 transform group-hover:rotate-6 transition-transform duration-300">
                  <Hash className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Get Your Ticket</CardTitle>
                <p className="text-blue-200/60 text-sm mt-2 font-medium">Enter your details to join the queue</p>
              </CardHeader>
              <CardContent className="p-8 sm:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="studentNumber" className="text-sm font-bold text-purple-300 uppercase tracking-widest">8-Digit Student ID</Label>
                    <div className="relative">
                      <Input
                        id="studentNumber"
                        type="text"
                        maxLength={8}
                        placeholder="00000000"
                        value={studentNumber}
                        onChange={(e) => {
                          setStudentNumber(e.target.value.replace(/\D/g, ''));
                          setError("");
                        }}
                        className="bg-white/5 border-white/10 text-3xl sm:text-4xl text-center tracking-[0.2em] h-16 sm:h-20 font-black text-white focus:ring-purple-500/50 focus:border-purple-500/50 rounded-2xl"
                        autoFocus
                      />
                      <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-500/20 group-hover:text-purple-500/60 transition-colors" />
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-red-400 font-bold text-center mt-2"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-16 sm:h-20 text-xl font-black rounded-2xl shadow-xl shadow-purple-900/40 relative overflow-hidden group/btn"
                    disabled={studentNumber.length !== 8}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      GET TICKET
                      <ArrowRight className="ml-3 w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={false}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                      style={{ x: '-100%' }}
                    />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features / How it works */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6"
          >
            {[
              { icon: Zap, title: "Instant Access", desc: "Join the queue from anywhere on campus instantly." },
              { icon: Shield, title: "Verified Identity", desc: "Secure authentication using your student credentials." },
              { icon: Ticket, title: "Smart Tracking", desc: "Real-time updates on your position and estimated wait time." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-5 p-6 rounded-3xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-blue-100/40 text-sm leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}

            <div className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10">
              <h3 className="font-black text-white mb-4 flex items-center gap-2">
                <Circle className="w-3 h-3 text-purple-500 fill-current" />
                HOW IT WORKS
              </h3>
              <ol className="space-y-4">
                {[
                  "Enter your 8-digit student number",
                  "Select your required department",
                  "Monitor your live queue status",
                  "Receive service notification"
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-blue-100/60 uppercase tracking-wide">
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-purple-400 border border-white/10 italic">0{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-blue-100/20 text-xs sm:text-sm mt-16 font-bold uppercase tracking-widest"
        >
          © 2025 SmartQueue • Redefining University Administration
        </motion.p>
      </div>
    </div>
  );
}
