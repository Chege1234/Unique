import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom"; // Add Link import
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle,
  Loader2,
  Ticket, // Add this
  LayoutDashboard // Add this
} from "lucide-react";
import { motion } from "framer-motion";

import DepartmentCard from "../Components/departments/DepartmentCard";
import ActiveTicketCard from "../Components/student/ActiveTicketCard"; // Add this

export default function TakeTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        // Redirect staff accounts immediately
        if (currentUser.role === 'staff') {
          navigate(createPageUrl("StaffDashboard"));
        }
      } else {
        // Optionally handle unauthenticated users, e.g., redirect to login
        // Assuming this page is generally protected by authentication.
      }
    };
    fetchUser();
  }, [navigate]); // Add navigate to dependency array

  const { data: myTickets = [], refetch: refetchMyTickets } = useQuery({
    queryKey: ['myTickets', user?.email],
    queryFn: () => base44.entities.QueueTicket.filter(
      { student_id: user?.email },
      '-created_date' // Order by most recent
    ),
    enabled: !!user && user.role === 'student', // Only fetch if user is a student
    refetchInterval: 5000 // Keep this updated to reflect real-time status changes
  });

  const activeTicket = myTickets.find(t => t.status === 'waiting' || t.status === 'in_progress');

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.filter({ is_active: true })
  });

  const { data: allTickets = [] } = useQuery({
    queryKey: ['allTickets'],
    queryFn: () => base44.entities.QueueTicket.list(),
    refetchInterval: 5000
  });

  const createTicketMutation = useMutation({
    mutationFn: async (departmentId) => {
      if (!user) {
        throw new Error("User not logged in to create a ticket.");
      }
      const department = departments.find(d => d.id === departmentId);
      if (!department) {
        throw new Error("Selected department not found.");
      }
      
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
        student_id: user.email,
        student_name: user.full_name,
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
      navigate(createPageUrl("StudentDashboard"));
    }
  });

  const getDepartmentStats = (deptId) => {
    const deptTickets = allTickets.filter(t => t.department_id === deptId);
    const waiting = deptTickets.filter(t => t.status === 'waiting' || t.status === 'in_progress').length; // Include in_progress in waiting count
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

  // --- Render logic based on user status and active tickets ---

  if (!user) {
    // Show a loading indicator while user data is being fetched
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="ml-2 text-lg text-gray-700">Loading user data...</p>
      </div>
    );
  }

  if (user.role === 'staff') {
    // Display a message for staff users if they reach this page
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-yellow-500 border-2 bg-yellow-50/50">
            <CardHeader>
              <LayoutDashboard className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-yellow-800">Access Denied</CardTitle>
              <CardDescription className="text-yellow-700">
                Staff accounts cannot take student queue tickets. Please navigate to your staff dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={createPageUrl("StaffDashboard")}>
                <Button>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Staff Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // If user is a student and has an active ticket, display it
  if (activeTicket) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-500 border-2 bg-red-50/50">
            <CardHeader>
              <Ticket className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-red-800">You Already Have an Active Ticket</CardTitle>
              <CardDescription className="text-red-700">
                Please wait for your current ticket to be served before taking a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveTicketCard ticket={activeTicket} onUpdate={refetchMyTickets} />
              <Link to={createPageUrl("StudentDashboard")} className="mt-6 inline-block">
                <Button variant="outline">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Default render for students without an active ticket
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(createPageUrl("StudentDashboard"))}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Take a Queue Ticket</h1>
          <p className="text-gray-600 mt-1">Select a department to get your ticket</p>
        </div>
      </div>

      {!selectedDept ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <Card className="border-none shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="text-2xl">Confirm Your Ticket</CardTitle>
              <CardDescription className="text-blue-100">
                Review the details before getting your ticket
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className={`w-16 h-16 bg-${selectedDept.color}-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                    {selectedDept.name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedDept.name}</h3>
                    <p className="text-gray-600">{selectedDept.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">People Waiting</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getDepartmentStats(selectedDept.id).waiting}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Est. Wait Time</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getDepartmentStats(selectedDept.id).estimatedWait} min
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedDept(null)}
                    disabled={createTicketMutation.isPending}
                  >
                    Go Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    onClick={handleConfirm}
                    disabled={createTicketMutation.isPending}
                  >
                    {createTicketMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm & Get Ticket
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
  );
}
