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
  Hash
} from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/85 to-blue-800/90"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Ticket className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 px-4 drop-shadow-lg">
            SmartQueue
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 px-4 drop-shadow-md">
            University Queue Management System
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl border-none bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg p-6 sm:p-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Hash className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Get Your Queue Ticket</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="studentNumber" className="text-base sm:text-lg">Enter Your 8-Digit Student Number</Label>
                  <Input
                    id="studentNumber"
                    type="text"
                    maxLength={8}
                    placeholder="12345678"
                    value={studentNumber}
                    onChange={(e) => {
                      setStudentNumber(e.target.value.replace(/\D/g, ''));
                      setError("");
                    }}
                    className="text-2xl sm:text-3xl text-center tracking-wider h-14 sm:h-16 font-mono"
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12 sm:h-14 text-lg sm:text-xl"
                  disabled={studentNumber.length !== 8}
                >
                  Get Ticket
                  <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </form>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">How it works:</h3>
                <ol className="text-xs sm:text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Enter your 8-digit student number above</li>
                  <li>Select the department you need service from</li>
                  <li>Receive your digital queue ticket</li>
                  <li>Track your position in real-time</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="text-center text-blue-200 text-xs sm:text-sm mt-6 sm:mt-8 px-4 drop-shadow-md">
          © 2025 SmartQueue - University Queue Management System
        </p>
      </div>
    </div>
  );
}