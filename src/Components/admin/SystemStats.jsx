import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SystemStats({ tickets, departments }) {
  const departmentData = departments.map(dept => {
    const deptTickets = tickets.filter(t => t.department_id === dept.id);
    return {
      name: dept.name.substring(0, 10),
      total: deptTickets.length,
      completed: deptTickets.filter(t => t.status === 'completed').length,
      waiting: deptTickets.filter(t => t.status === 'waiting').length
    };
  });

  return (
    <Card className="glass-card border-none overflow-hidden group">
      <CardHeader className="p-8 border-b border-white/5 bg-white/5">
        <CardTitle className="text-lg font-black text-white uppercase tracking-widest">Network Throughput</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0118',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                  fontSize: '10px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="total" fill="url(#totalGradient)" radius={[6, 6, 0, 0]} name="AGGREGATE" />
              <Bar dataKey="completed" fill="url(#completedGradient)" radius={[6, 6, 0, 0]} name="RESOLVED" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
