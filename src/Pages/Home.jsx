import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import {
  Ticket,
  MapPin,
  Clock,
  Smartphone,
  Users,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Zap,
  ShieldCheck,
  Circle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-8">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
              Skip the line. <br />
              <span className="text-white bg-primary px-4 py-1 rounded-lg">Join the queue</span> digitally.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium">
              Smart Queue allows students to take a queue ticket online and wait from anywhere instead of standing in line.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link to={createPageUrl("TakeTicket")}>
              <Button className="h-16 px-10 text-lg font-bold bg-primary hover:bg-slate-800 text-white rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                Get a Ticket
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="h-16 px-10 text-lg font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
              How It Works
            </Button>
          </motion.div>
        </div>

        {/* Realistic Ticket Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 w-full max-w-md"
        >
          <div className="university-card rounded-[2.5rem] overflow-hidden p-8 space-y-8 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Ticket className="w-32 h-32" />
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Queue Status</h3>
                <p className="text-slate-900 font-bold">Student Services Center</p>
              </div>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                Live Status
              </div>
            </div>

            <div className="text-center py-6 border-y border-slate-100">
              <span className="text-slate-400 text-sm font-medium">Your Number</span>
              <div className="text-7xl font-black text-primary tracking-tighter mt-1">
                A-142
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Position</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">4th</span>
                  <p className="text-slate-400 text-xs font-medium">in line</p>
                </div>
              </div>
              <div>
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Est. Wait</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">12</span>
                  <p className="text-slate-400 text-xs font-medium">mins</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-sm font-bold text-slate-700">Status: <span className="text-blue-600">Waiting in Queue</span></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. How It Works */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-500 font-medium">Complete the process in three simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "Step 1",
              title: "Choose a Service",
              desc: "Students select the office or service they need from the digital catalog.",
              icon: MapPin,
              color: "bg-blue-50 text-blue-600"
            },
            {
              step: "Step 2",
              title: "Receive a Ticket",
              desc: "The system generates a digital ticket and shows your current position.",
              icon: Ticket,
              color: "bg-indigo-50 text-indigo-600"
            },
            {
              step: "Step 3",
              title: "Wait Anywhere",
              desc: "Monitor your position in real-time and arrive when your number is called.",
              icon: Smartphone,
              color: "bg-emerald-50 text-emerald-600"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="university-card p-10 rounded-3xl space-y-6"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center`}>
                <item.icon className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{item.step}</span>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Key Benefits */}
      <section className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-5">
          <ShieldCheck className="w-96 h-96" />
        </div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight">University-Wide Benefits</h2>
            <div className="space-y-6">
              {[
                { title: "No Physical Lines", desc: "Students no longer need to stand in physical lines, freeing up halls and offices.", icon: CheckCircle2 },
                { title: "Live Queue Updates", desc: "Queue positions and wait times update in real time on any digital device.", icon: Zap },
                { title: "Faster Service", desc: "Staff can manage queues more efficiently with centralized digital controls.", icon: Users }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{benefit.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block space-y-4">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold">Staff Performance</h4>
                  <p className="text-xs text-slate-400">Real-time metrics dashboard</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-blue-500" />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span>Service Efficiency</span>
                  <span className="text-blue-400">80% Increase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Queue Preview Board */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Real-time Queue Board</h2>
            <p className="text-slate-500 font-medium">A visual representation of current campus services</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { dept: "Financial Aid", serving: "A-138", wait: "18m", status: "Active" },
            { dept: "Registrar's Office", serving: "R-022", wait: "5m", status: "Fast" },
            { dept: "IT Support Desk", serving: "T-045", wait: "12m", status: "Busy" }
          ].map((node, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="university-card rounded-3xl overflow-hidden"
            >
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-slate-900">{node.dept}</h4>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Now Serving</p>
                    <p className="text-4xl font-black text-primary tracking-tighter">{node.serving}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Wait</p>
                    <p className="text-xl font-bold text-slate-900">{node.wait}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["Next: " + node.serving.split('-')[0] + "-" + (parseInt(node.serving.split('-')[1]) + 1), node.serving.split('-')[0] + "-" + (parseInt(node.serving.split('-')[1]) + 2)].map((next, j) => (
                    <div key={j} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold text-slate-500">
                      {next}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="bg-primary rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
        <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            Take your queue ticket in seconds.
          </h2>
          <Link to={createPageUrl("TakeTicket")} className="inline-block">
            <Button className="h-16 px-12 text-lg font-bold bg-white text-primary hover:bg-slate-100 rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95">
              Get Your Ticket
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-white/40 text-sm font-medium">No account required for basic queue entry</p>
        </div>
      </section>
    </div>
  );
}
