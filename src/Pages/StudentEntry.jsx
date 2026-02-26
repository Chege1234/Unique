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

    // Validate 8-digit number
    if (!/^\d{8}$/.test(studentNumber)) {
      setError("Please enter a valid 8-digit student number");
      return;
    }

    // Navigate to ticket selection with student number
    navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`);
  };

  const handleCheckTicket = () => {
    if (!/^\d{8}$/.test(studentNumber)) {
      setError("Please enter a valid 8-digit student number");
      return;
    }
    navigate(createPageUrl("StudentTicketView") + `?student=${studentNumber}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to={createPageUrl("Home")} className="inline-block mb-6">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl border-none">
            <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl">Student Services</CardTitle>
              <CardDescription className="text-blue-100">
                Enter your 8-digit student number to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentNumber" className="text-lg">Student Number</Label>
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
                    className="text-2xl text-center tracking-wider h-14 font-mono"
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12 text-lg"
                  disabled={studentNumber.length !== 8}
                >
                  Take a Ticket
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12"
                onClick={handleCheckTicket}
                disabled={studentNumber.length !== 8}
              >
                <Search className="mr-2 w-5 h-5" />
                Check My Ticket Status
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can only have one active ticket at a time. Complete or cancel your current ticket before taking a new one.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}