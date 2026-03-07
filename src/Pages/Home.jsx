import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Ticket,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Users,
  Clock,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [studentNumber, setStudentNumber] = useState("");
  const navigate = useNavigate();

  const handleGetTicket = () => {
    if (studentNumber.length === 8) {
      navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8"
      >
        {/* Header/Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl border border-primary/30 text-primary shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              SmartQueue
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              University Queue Management System
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-[2rem] overflow-hidden p-8 space-y-6 relative border border-white/10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/5 rounded-full text-slate-400">
              <span className="font-bold text-lg">#</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Get Your Queue Ticket
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Enter Your 8-Digit Student Number
              </label>
              <Input
                type="text"
                placeholder="12345678"
                maxLength={8}
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value.replace(/\D/g, ""))}
                className="h-14 bg-white/5 border-white/10 text-white text-center text-xl font-mono tracking-widest focus:ring-primary focus:border-primary rounded-xl"
              />
            </div>

            <Button
              onClick={handleGetTicket}
              disabled={studentNumber.length !== 8}
              className="w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
            >
              Get Ticket
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>

            <p className="text-[10px] text-center text-slate-600 font-medium">
              By joining, you agree to our Service Terms
            </p>
          </div>
        </div>

        {/* How it works list */}
        <div className="glass-card rounded-2xl p-6 bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              How it works:
            </h3>
          </div>
          <ul className="space-y-3">
            {[
              "Enter your 8-digit student number above",
              "Select the department you need service from",
              "Receive your digital queue ticket",
              "Track your position in real-time"
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-300">
                  {idx + 1}
                </span>
                <span className="text-[11px] text-slate-400 font-medium leading-tight">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
            © 2026 SMARTQUEUE - UNIVERSITY TECH
          </p>
        </div>
      </motion.div>
    </div>
  );
}
