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
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Department Activity Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3B82F6" name="Total Tickets" />
            <Bar dataKey="completed" fill="#10B981" name="Completed" />
            <Bar dataKey="waiting" fill="#F59E0B" name="Waiting" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}