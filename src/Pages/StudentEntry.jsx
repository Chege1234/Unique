import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { ArrowLeft, ArrowRight, Hash, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function StudentEntry() {
  const navigate = useNavigate();
  const [studentNumber, setStudentNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!/^20\d{6}$/.test(studentNumber)) {
      setError("Incorrect student number. Must be 8 digits starting with 20.");
      return;
    }

    navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`);
  };

  const handleCheckTicket = () => {
    if (!/^20\d{6}$/.test(studentNumber)) {
      setError("Incorrect student number. Must be 8 digits starting with 20.");
      return;
    }
    navigate(createPageUrl("StudentTicketView") + `?student=${studentNumber}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-2xl">
        <div className="flex justify-start mb-10">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="text-blue-100/40 hover:text-white hover:bg-white/5 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl px-6 h-12 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-2 transition-transform" />
            Go Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card border-none overflow-hidden group">
            <CardHeader className="text-center pb-10 border-b border-white/5">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                <Hash className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-black text-white tracking-tight uppercase">Check <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">In</span></CardTitle>
              <CardDescription className="text-blue-100/30 font-medium text-lg mt-3">
                Enter your 8-digit student number to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-12 space-y-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="studentNumber" className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] ml-1">STUDENT NUMBER</Label>
                  <Input
                    id="studentNumber"
                    type="text"
                    maxLength={8}
                    placeholder="20xxxxxx"
                    value={studentNumber}
                    onChange={(e) => {
                      setStudentNumber(e.target.value.replace(/\D/g, ''));
                      setError("");
                    }}
                    className="text-4xl text-center tracking-[0.5em] h-20 font-black bg-white/5 border-white/10 text-white placeholder:text-white/5 rounded-3xl focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                    autoFocus
                  />
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 font-black uppercase tracking-widest text-center mt-4">{error}</motion.p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 h-20 text-white font-black uppercase tracking-[0.4em] text-sm rounded-3xl shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                  disabled={studentNumber.length !== 8}
                >
                  GET A TICKET
                  <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 bg-[#0B0118] text-blue-100/20 text-[10px] font-black uppercase tracking-[0.5em]">OR</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  className="w-full h-16 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all"
                  onClick={handleCheckTicket}
                  disabled={studentNumber.length !== 8}
                >
                  <Search className="mr-3 w-4 h-4" />
                  CHECK MY TICKET
                </Button>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed text-center">
                    <span className="text-blue-200">NOTE:</span> You can only hold one active ticket at a time. Cancel your current ticket before getting a new one.
                  </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
