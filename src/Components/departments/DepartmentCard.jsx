import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Clock, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function DepartmentCard({ department, stats, onSelect, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="w-full h-full"
    >
      <Card className="border-none shadow-lg hover:shadow-2xl transition-all cursor-pointer group bg-white/95 backdrop-blur-sm h-full flex flex-col"
        onClick={() => onSelect(department)}
      >
        <CardHeader className="p-4 sm:p-5 md:p-6">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-${department.color}-500 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 group-hover:scale-110 transition-transform flex-shrink-0`}>
            {department.name[0]}
          </div>
          <CardTitle className="text-base sm:text-lg md:text-xl break-words leading-tight">{department.name}</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">{department.description}</p>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-5 md:p-6 pt-0 mt-auto">
          <div className="flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">Waiting</span>
            </div>
            <span className="font-semibold text-sm sm:text-base">{stats.waiting}</span>
          </div>
          <div className="flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">Est. Wait</span>
            </div>
            <span className="font-semibold text-sm sm:text-base whitespace-nowrap">{stats.estimatedWait} min</span>
          </div>
          <Button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 group-hover:bg-blue-600 h-9 sm:h-10 text-xs sm:text-sm">
            Select
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}