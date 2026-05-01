import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  ChevronRight,
  LayoutGrid
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function Home() {
  const [studentNumber, setStudentNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const handleGetTicket = () => {
    if (!/^20\d{6}$/.test(studentNumber)) {
      setError("Incorrect student number. Must be 8 digits starting with 20.");
      return;
    }
    setError("");
    navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`);
  };

  const handleCheckTicket = () => {
    if (!/^20\d{6}$/.test(studentNumber)) {
      setError("Incorrect student number. Must be 8 digits starting with 20.");
      return;
    }
    setError("");
    navigate(createPageUrl("StudentTicketView") + `?student=${studentNumber}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.2 : 0.35, ease: "easeOut" }}
        className="w-full max-w-[400px] space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/15 rounded-2xl border border-primary/40 text-primary">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              SmartQueue
            </h1>
            <p className="text-xs font-medium text-muted-foreground tracking-wide">
              University Queue Management System
            </p>
          </div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, delay: 0.06 }}
          className="glass-card rounded-[1.75rem] overflow-hidden p-8 space-y-6 relative"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-muted rounded-full text-muted-foreground">
              <span className="font-semibold text-lg">#</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Get Your Queue Ticket
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground tracking-wide ml-1">
                Enter Your 8-Digit Student Number
              </label>
              <Input
                type="text"
                placeholder="20xxxxxx"
                maxLength={8}
                value={studentNumber}
                onChange={(e) => {
                  setStudentNumber(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className="h-14 text-foreground text-center text-xl font-mono tracking-wider"
              />
              {error && (
                <p className="text-red-400 text-xs font-medium tracking-wide text-center mt-2">{error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleGetTicket}
                disabled={studentNumber.length !== 8}
                className="w-full h-14 text-base"
              >
                Get Ticket
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={handleCheckTicket}
                disabled={studentNumber.length !== 8}
                className="w-full h-14 text-base"
              >
                Check My Ticket
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By joining, you agree to our Service Terms
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, delay: 0.12 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wide">
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
                <span className="flex-shrink-0 w-5 h-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-semibold text-foreground/85">
                  {idx + 1}
                </span>
                <span className="text-[13px] text-foreground/85 font-normal leading-tight">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="text-center pt-4">
          <p className="text-[11px] font-medium text-muted-foreground tracking-wide">
            © 2026 SMARTQUEUE - UNIVERSITY TECH
          </p>
        </div>
      </motion.div>
    </div>
  );
}

