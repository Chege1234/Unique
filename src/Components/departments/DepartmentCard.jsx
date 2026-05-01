import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
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
      <Card className="glass-card border-none transition-all duration-300 cursor-pointer group h-full flex flex-col relative overflow-hidden"
        onClick={() => onSelect(department)}
      >
        <CardHeader className="p-6 relative z-10">
          <div className="w-14 h-14 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center text-primary text-2xl font-semibold mb-4 group-hover:scale-105 transition-all duration-300">
            {department.name[0]}
          </div>
          <CardTitle className="text-xl font-semibold text-foreground tracking-tight leading-tight">{department.name}</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed mt-2">{department.description}</p>
        </CardHeader>

        <CardContent className="space-y-4 p-6 pt-0 mt-auto relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-card rounded-xl border border-border">
              <Users className="w-5 h-5 text-primary mb-2 opacity-80" />
              <span className="text-xs font-medium text-muted-foreground mb-1">Waiting</span>
              <span className="text-xl font-semibold text-foreground">{stats.waiting}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-card rounded-xl border border-border">
              <Clock className="w-5 h-5 text-primary mb-2 opacity-80" />
              <span className="text-xs font-medium text-muted-foreground mb-1">Est. wait</span>
              <span className="text-xl font-semibold text-foreground">{stats.estimatedWait}<span className="text-xs ml-0.5 text-muted-foreground">m</span></span>
            </div>
          </div>

          <Button className="w-full h-11" variant="outline">
            Select Department
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
