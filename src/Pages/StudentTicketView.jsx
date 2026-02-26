import React, { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { 
  Home,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Ticket as TicketIcon,
  Bell
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function StudentTicketView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const previousStatusRef = useRef(null);
  const notificationShownRef = useRef(false);
  const audioRef = useRef(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const studentNumber = urlParams.get('student');

  // Initialize audio
  useEffect(() => {
    // Create a simple notification sound using Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Second beep
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.5);
      }, 200);
      
      // Third beep
      setTimeout(() => {
        const oscillator3 = audioContext.createOscillator();
        const gainNode3 = audioContext.createGain();
        
        oscillator3.connect(gainNode3);
        gainNode3.connect(audioContext.destination);
        
        oscillator3.frequency.value = 1200;
        oscillator3.type = 'sine';
        
        gainNode3.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
        
        oscillator3.start(audioContext.currentTime);
        oscillator3.stop(audioContext.currentTime + 0.7);
      }, 400);
    };
    
    audioRef.current = createNotificationSound;
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  React.useEffect(() => {
    if (!studentNumber || !/^\d{8}$/.test(studentNumber)) {
      navigate(createPageUrl("StudentEntry"));
    }
  }, [studentNumber, navigate]);

  const { data: myTickets = [], refetch } = useQuery({
    queryKey: ['myTickets', studentNumber],
    queryFn: () => base44.entities.QueueTicket.filter({ student_id: studentNumber }, '-created_date'),
    enabled: !!studentNumber,
    refetchInterval: 3000
  });

  const cancelMutation = useMutation({
    mutationFn: (ticketId) => base44.entities.QueueTicket.update(ticketId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myTickets']);
      refetch();
    }
  });

  const activeTicket = myTickets.find(t => t.status === 'waiting' || t.status === 'in_progress');
  const completedTickets = myTickets.filter(t => t.status === 'completed' || t.status === 'cancelled');

  // Monitor status changes and trigger notification
  useEffect(() => {
    if (activeTicket) {
      // Check if status changed to in_progress
      if (previousStatusRef.current === 'waiting' && activeTicket.status === 'in_progress' && !notificationShownRef.current) {
        // Play sound
        if (audioRef.current) {
          try {
            audioRef.current();
          } catch (error) {
            console.error('Error playing sound:', error);
          }
        }
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 It\'s Your Turn!', {
            body: `Ticket ${activeTicket.ticket_number} - Please proceed to ${activeTicket.department_name} counter now!`,
            icon: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=192&h=192&fit=crop',
            badge: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=96&h=96&fit=crop',
            tag: 'queue-notification',
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200]
          });
        }
        
        notificationShownRef.current = true;
      }
      
      // Update previous status
      previousStatusRef.current = activeTicket.status;
      
      // Reset notification flag if status changes away from in_progress
      if (activeTicket.status !== 'in_progress') {
        notificationShownRef.current = false;
      }
    }
  }, [activeTicket]);

  const getStatusBadge = (status) => {
    if (status === 'in_progress') {
      return <Badge className="bg-orange-500 text-lg px-4 py-1">🔔 NOW SERVING</Badge>;
    }
    if (status === 'waiting') {
      return <Badge className="bg-blue-500 text-lg px-4 py-1">⏳ Waiting</Badge>;
    }
    if (status === 'completed') {
      return <Badge className="bg-green-500 text-lg px-4 py-1">✓ Completed</Badge>;
    }
    return <Badge variant="secondary" className="text-lg px-4 py-1">Cancelled</Badge>;
  };

  if (!activeTicket && completedTickets.length === 0) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="text-center shadow-2xl">
            <CardContent className="p-8 sm:p-12">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Tickets Found</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Student {studentNumber} has no active or recent tickets.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`)}
                  className="w-full bg-blue-500 hover:bg-blue-600 h-11 sm:h-12"
                >
                  Take a New Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl("StudentEntry"))}
                  className="w-full h-11 sm:h-12"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 sm:p-6 md:p-8">
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

      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">My Ticket</h1>
            <p className="text-sm sm:text-base text-blue-100">Student: {studentNumber}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              title="Refresh"
              className="flex-shrink-0 bg-white/95"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("StudentEntry"))}
              className="flex-1 sm:flex-initial bg-white/95"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Notification Permission Alert */}
        {activeTicket && 'Notification' in window && Notification.permission === 'default' && (
          <Alert className="bg-yellow-50 border-yellow-300">
            <Bell className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Enable notifications</strong> to get alerted when it's your turn!
              <Button 
                size="sm" 
                variant="outline"
                className="ml-2"
                onClick={() => Notification.requestPermission()}
              >
                Enable
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {activeTicket && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className={`border-none shadow-2xl ${
              activeTicket.status === 'in_progress' 
                ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-4 border-orange-400 animate-pulse' 
                : 'bg-white/95 backdrop-blur-sm'
            }`}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-2xl sm:text-3xl mb-2">{activeTicket.department_name}</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Created {format(new Date(activeTicket.created_date), 'h:mm a')}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto">
                    {getStatusBadge(activeTicket.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Ticket Number */}
                  <div className="p-6 sm:p-8 bg-white rounded-2xl text-center shadow-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Your Ticket Number</p>
                    <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-wider font-mono break-all">
                      {activeTicket.ticket_number}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600">Queue Position</span>
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                        #{activeTicket.queue_position || 1}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600">Est. Wait</span>
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {activeTicket.estimated_wait_time || 15}
                        <span className="text-lg sm:text-xl">m</span>
                      </p>
                    </div>
                  </div>

                  {activeTicket.status === 'in_progress' && (
                    <Alert className="border-orange-400 bg-orange-50">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <AlertDescription className="text-orange-800 font-semibold text-sm sm:text-base md:text-lg">
                        🎉 It's your turn! Please proceed to the service counter now.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 sm:h-12"
                      onClick={() => navigate(createPageUrl("StudentEntry"))}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-11 sm:h-12"
                      onClick={() => cancelMutation.mutate(activeTicket.id)}
                      disabled={cancelMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Ticket
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent History */}
        {completedTickets.length > 0 && (
          <Card className="border-none shadow-lg bg-white/95 backdrop-blur-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Recent History</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {completedTickets.slice(0, 3).map((ticket) => (
                  <div key={ticket.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {ticket.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{ticket.department_name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {format(new Date(ticket.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <p className="font-semibold text-gray-900 text-sm">{ticket.ticket_number}</p>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
