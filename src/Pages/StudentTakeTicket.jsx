import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

import DepartmentCard from "../Components/departments/DepartmentCard";

export default function StudentTakeTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const studentNumber = urlParams.get('student');

  React.useEffect(() => {
    if (!studentNumber || !/^20\d{6}$/.test(studentNumber)) {
      navigate(createPageUrl("StudentEntry"));
    }
  }, [studentNumber, navigate]);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.filter({ is_active: true })
  });

  const { data: allTickets = [] } = useQuery({
    queryKey: ['allTickets'],
    queryFn: () => base44.entities.QueueTicket.list(),
    refetchInterval: 5000
  });

  const { data: myTickets = [] } = useQuery({
    queryKey: ['myTickets', studentNumber],
    queryFn: () => base44.entities.QueueTicket.filter({ student_email: `${studentNumber}@student.edu` }),
    enabled: !!studentNumber
  });

  const activeTicket = myTickets.find(t => t.status === 'waiting' || t.status === 'in_progress' || t.status === 'called');

  const createTicketMutation = useMutation({
    mutationFn: async (departmentId) => {
      const department = departments.find(d => d.id === departmentId);

      const todayTickets = allTickets.filter(t =>
        t.department_id === departmentId &&
        new Date(t.created_date).toDateString() === new Date().toDateString()
      );

      const ticketNumber = `${department.name.substring(0, 3).toUpperCase()}-${String(todayTickets.length + 1).padStart(3, '0')}`;

      const waitingTickets = allTickets.filter(t =>
        t.department_id === departmentId &&
        (t.status === 'waiting' || t.status === 'in_progress')
      );

      const queuePosition = waitingTickets.length + 1;
      const estimatedWaitTime = queuePosition * (department.average_service_time || 15);

      return base44.entities.QueueTicket.create({
        student_email: `${studentNumber}@student.edu`, // Use student_email for the number
        student_name: `Student ${studentNumber}`,
        department_id: departmentId,
        department_name: department.name,
        ticket_number: ticketNumber,
        status: 'waiting',
        queue_position: queuePosition,
        estimated_wait_time: estimatedWaitTime
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myTickets']);
      queryClient.invalidateQueries(['allTickets']);
      navigate(createPageUrl("StudentTicketView") + `?student=${studentNumber}`);
    }
  });

  const getDepartmentStats = (deptId) => {
    const deptTickets = allTickets.filter(t => t.department_id === deptId);
    const waiting = deptTickets.filter(t => t.status === 'waiting').length;
    const avgTime = departments.find(d => d.id === deptId)?.average_service_time || 15;

    return {
      waiting,
      estimatedWait: waiting * avgTime
    };
  };

  const handleSelectDepartment = (dept) => {
    setSelectedDept(dept);
  };

  const handleConfirm = () => {
    if (selectedDept) {
      createTicketMutation.mutate(selectedDept.id);
    }
  };

  if (activeTicket) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto relative z-10">
        <div className="w-full max-w-lg relative z-10 my-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-none p-10 text-center">
              <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/20">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">You Already Have a Ticket</h2>
              <p className="text-blue-100/40 font-medium text-lg leading-relaxed mb-10">
                You already have an active ticket. Please cancel it before getting a new one.
              </p>
              <Button
                variant="outline"
                className="w-full h-16 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-[0.3em] text-sm rounded-2xl transition-all"
                onClick={() => navigate(createPageUrl("StudentTicketView") + `?student=${studentNumber}`)}
              >
                VIEW ACTIVE TICKET
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-6 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(createPageUrl("StudentEntry"))}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white w-14 h-14 rounded-2xl transition-all active:scale-90"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-5xl font-black text-white tracking-tight">Choose a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Department</span></h1>
                <p className="text-blue-100/40 font-bold uppercase tracking-[0.25em] text-sm mt-3 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                  Student ID: {studentNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!selectedDept ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept, index) => {
              const stats = getDepartmentStats(dept.id);
              return (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  stats={stats}
                  onSelect={handleSelectDepartment}
                  delay={index * 0.1}
                />
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-none overflow-hidden relative group max-w-3xl mx-auto">
              <CardHeader className="text-center p-12 border-b border-white/5">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4">You're almost there!</p>
                <CardTitle className="text-4xl font-black text-white tracking-tight leading-none uppercase">Confirm Ticket</CardTitle>
              </CardHeader>
              <CardContent className="p-12">
                <div className="space-y-10">
                  <div className="flex items-center gap-8 p-10 bg-white/5 rounded-3xl border border-white/10">
                    <div className={`w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl flex-shrink-0`}>
                      {selectedDept.name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-white tracking-tight uppercase">{selectedDept.name}</h3>
                      <p className="text-blue-100/30 font-bold text-xs uppercase tracking-widest mt-2">{selectedDept.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                      <Users className="w-8 h-8 text-purple-400 mb-3 opacity-30" />
                       <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest mb-2">People waiting</span>
                      <p className="text-4xl font-black text-white">{getDepartmentStats(selectedDept.id).waiting}</p>
                    </div>
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                      <Clock className="w-8 h-8 text-blue-400 mb-3 opacity-30" />
                      <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest mb-2">Est. wait</span>
                      <p className="text-4xl font-black text-white">
                        {getDepartmentStats(selectedDept.id).estimatedWait}<span className="text-sm ml-1 text-blue-400">m</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-4">
                    <Button
                      variant="ghost"
                      className="flex-1 h-20 text-blue-100/20 hover:text-white hover:bg-white/5 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all"
                      onClick={() => setSelectedDept(null)}
                      disabled={createTicketMutation.isPending}
                    >
                      GO BACK
                    </Button>
                    <Button
                      className="flex-[2] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-20 text-white font-black uppercase tracking-[0.3em] text-sm rounded-2xl shadow-2xl shadow-purple-900/40 transition-all active:scale-[0.98]"
                      onClick={handleConfirm}
                      disabled={createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-4 animate-spin" />
                          PROCESSING...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6 mr-4" />
                          CONFIRM & GET TICKET
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
