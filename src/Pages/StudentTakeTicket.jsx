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
    if (!studentNumber || !/^\d{8}$/.test(studentNumber)) {
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
    queryFn: () => base44.entities.QueueTicket.filter({ student_id: studentNumber }),
    enabled: !!studentNumber
  });

  const activeTicket = myTickets.find(t => t.status === 'waiting' || t.status === 'in_progress');

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
        student_id: studentNumber,
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
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/85 to-blue-800/90"></div>
        </div>
        <div className="w-full max-w-md relative z-10 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-red-500 bg-red-50 mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                You already have an active ticket. Please complete or cancel it before taking a new one.
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              className="w-full bg-white"
              onClick={() => navigate(createPageUrl("StudentTicketView") + `?student=${studentNumber}`)}
            >
              View My Active Ticket
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/85 to-blue-800/90"></div>
      </div>

      <div className="relative z-10 min-h-full">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("StudentEntry"))}
              className="bg-white/95 backdrop-blur-sm flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">Select Department</h1>
              <p className="text-blue-100 mt-1 text-xs sm:text-sm md:text-base">Student: {studentNumber}</p>
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
              <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 md:p-8">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">Confirm Your Ticket</CardTitle>
                  <CardDescription className="text-blue-100 text-sm sm:text-base">
                    Review the details before getting your ticket
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-${selectedDept.color}-500 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold shadow-lg flex-shrink-0`}>
                        {selectedDept.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">{selectedDept.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1">{selectedDept.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">Waiting</span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                          {getDepartmentStats(selectedDept.id).waiting}
                        </p>
                      </div>
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">Est. Wait</span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                          {getDepartmentStats(selectedDept.id).estimatedWait} min
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                        onClick={() => setSelectedDept(null)}
                        disabled={createTicketMutation.isPending}
                      >
                        Go Back
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                        onClick={handleConfirm}
                        disabled={createTicketMutation.isPending}
                      >
                        {createTicketMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
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
    </div>
  );
}
