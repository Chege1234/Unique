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
import { motion, AnimatePresence } from "framer-motion";
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
    queryFn: () => base44.entities.QueueTicket.filter({ student_email: `${studentNumber}@student.edu` }, '-created_date'),
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

  const activeTicket = myTickets.find(t => t.status === 'waiting' || t.status === 'in_progress' || t.status === 'called');
  const completedTickets = myTickets.filter(t => t.status === 'completed' || t.status === 'cancelled');

  // Monitor status changes and trigger notification
  useEffect(() => {
    if (activeTicket) {
      // Check if status changed to in_progress or called
      if (previousStatusRef.current === 'waiting' && (activeTicket.status === 'in_progress' || activeTicket.status === 'called') && !notificationShownRef.current) {
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
    if (status === 'in_progress' || status === 'called') {
      return <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-black tracking-widest uppercase px-6 py-2 rounded-full text-xs">ENGAGED</Badge>;
    }
    if (status === 'waiting') {
      return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black tracking-widest uppercase px-6 py-2 rounded-full text-xs">BUFFERING</Badge>;
    }
    if (status === 'completed') {
      return <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black tracking-widest uppercase px-6 py-2 rounded-full text-xs">RESOLVED</Badge>;
    }
    return <Badge className="bg-white/5 text-blue-100/30 border border-white/5 font-black tracking-widest uppercase px-6 py-2 rounded-full text-xs">ABORTED</Badge>;
  };

  if (!activeTicket && completedTickets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="glass-card border-none p-12 text-center">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <AlertCircle className="w-10 h-10 text-blue-100/20" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-4 uppercase">No Session Found</h2>
              <p className="text-blue-100/40 font-medium text-lg leading-relaxed mb-10">
                Identification key {studentNumber} has no active cycles or recent terminations.
              </p>
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`)}
                  className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.3em] text-sm rounded-2xl shadow-2xl shadow-purple-500/20 transition-all active:scale-[0.98]"
                >
                  INITIALIZE NEW SESSION
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(createPageUrl("StudentEntry"))}
                  className="w-full h-16 text-blue-100/30 hover:text-white hover:bg-white/5 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all"
                >
                  <Home className="w-4 h-4 mr-3" />
                  RETURN TO BASE
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 px-4 py-12 md:py-20">
      <AnimatePresence>
        {(activeTicket?.status === 'in_progress' || activeTicket?.status === 'called') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030014]/95 backdrop-blur-3xl px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  filter: ["drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))", "drop-shadow(0 0 50px rgba(168, 85, 247, 0.8))", "drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-2xl relative"
              >
                <TicketIcon className="w-16 h-16 sm:w-24 sm:h-24 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-[40px] animate-ping opacity-20" />
              </motion.div>

              <motion.h1
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-5xl sm:text-8xl font-black text-white tracking-tighter mb-8 uppercase italic"
              >
                PROCEED TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">COUNTER</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-8 px-10 py-6 bg-white/5 border border-white/10 rounded-[30px] backdrop-blur-md"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2">Identification Key</p>
                  <p className="text-4xl font-black text-white tracking-widest">{activeTicket.ticket_number}</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Engaged Terminal</p>
                  <p className="text-4xl font-black text-white truncate max-w-[250px] uppercase">{activeTicket.department_name}</p>
                </div>
              </motion.div>

              <div className="mt-16">
                <Button
                  variant="ghost"
                  onClick={() => navigate(createPageUrl("Home"))}
                  className="text-blue-100/30 hover:text-white font-black uppercase tracking-[0.4em] text-[10px] transition-all hover:bg-white/5 px-8 h-12 rounded-full"
                >
                  TERMINATE NOTIFICATION
                </Button>
              </div>
            </motion.div>

            {/* Immersive Background Effects */}
            <div className="absolute inset-0 z-[-1] overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-600/20 rounded-full blur-[150px]"
              />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tight uppercase">Session <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Status</span></h1>
            <p className="text-blue-100/40 font-bold uppercase tracking-[0.25em] text-sm mt-3 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
              Authenticated Node: {studentNumber}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white w-14 h-14 rounded-2xl transition-all active:scale-90"
            >
              <RefreshCw className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("StudentEntry"))}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
              <Home className="w-4 h-4 mr-3" />
              RETURN
            </Button>
          </div>
        </div>

        {/* Notification Permission Alert */}
        {activeTicket && 'Notification' in window && Notification.permission === 'default' && (
          <Alert className="bg-purple-500/10 border-purple-500/20 rounded-3xl p-6">
            <Bell className="h-6 w-6 text-purple-400" />
            <AlertDescription className="text-purple-300 ml-4 font-bold uppercase tracking-wider text-xs flex items-center justify-between w-full">
              <span>Enable neural alerts for live engagement updates.</span>
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-purple-500/20 text-purple-400 font-black uppercase tracking-widest text-[10px]"
                onClick={() => Notification.requestPermission()}
              >
                AUTHORIZE
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {activeTicket && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-none overflow-hidden relative group">
              {(activeTicket.status === 'in_progress' || activeTicket.status === 'called') && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent animate-pulse" />
              )}
              <CardHeader className="p-10 border-b border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Processing Node</p>
                    <CardTitle className="text-4xl font-black text-white tracking-tight uppercase leading-none">{activeTicket.department_name}</CardTitle>
                    <p className="text-[10px] font-bold text-blue-100/30 uppercase tracking-[0.2em] mt-3">
                      INITIATED {format(new Date(activeTicket.created_date), 'h:mm a')}
                    </p>
                  </div>
                  {getStatusBadge(activeTicket.status)}
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="space-y-10">
                  {/* Ticket Number */}
                  <div className="p-12 bg-white/5 rounded-[40px] text-center border border-white/10 shadow-inner group-hover:border-purple-500/30 transition-colors">
                    <p className="text-[10px] font-black text-blue-100/20 uppercase tracking-[0.4em] mb-6">Identification Key</p>
                    <p className="text-8xl font-black text-white tracking-widest leading-none bg-clip-text bg-gradient-to-b from-white to-white/60">
                      {activeTicket.ticket_number}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                      <Users className="w-8 h-8 text-purple-400 mb-3 opacity-30" />
                      <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest mb-2">Queue Index</span>
                      <p className="text-4xl font-black text-white tracking-tighter">#{activeTicket.queue_position || 1}</p>
                    </div>
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                      <Clock className="w-8 h-8 text-blue-400 mb-3 opacity-30" />
                      <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest mb-2">Est. Latency</span>
                      <p className="text-4xl font-black text-white tracking-tighter">
                        {activeTicket.estimated_wait_time || 15}<span className="text-sm ml-1 text-blue-400">m</span>
                      </p>
                    </div>
                  </div>

                  {(activeTicket.status === 'in_progress' || activeTicket.status === 'called') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-10 bg-green-500/20 border border-green-500/30 rounded-[40px] text-center backdrop-blur-md"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <p className="text-2xl font-black text-green-300 tracking-tight leading-tight uppercase">
                        ACTIVE ENGAGEMENT<br />
                        <span className="text-[10px] font-bold text-green-400/60 tracking-[0.3em] opacity-80">Proceed to Designated Terminal</span>
                      </p>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <Button
                      variant="ghost"
                      className="flex-1 h-16 text-blue-100/20 hover:text-white hover:bg-white/5 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all"
                      onClick={() => navigate(createPageUrl("Home"))}
                    >
                      BACK TO HOME
                    </Button>
                    <Button
                      className="flex-[2] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-500 h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-900/20"
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this ticket?")) {
                          cancelMutation.mutate(activeTicket.id);
                        }
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      <XCircle className="w-5 h-5 mr-3" />
                      CANCEL TICKET
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent History */}
        {completedTickets.length > 0 && (
          <Card className="glass-card border-none overflow-hidden relative group">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-lg font-black text-white uppercase tracking-widest">Historical Log</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {completedTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 group">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${ticket.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {ticket.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white tracking-tight text-lg uppercase">{ticket.department_name}</p>
                        <p className="text-[10px] font-bold text-blue-100/30 uppercase tracking-[0.2em] mt-1">
                          {format(new Date(ticket.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white tracking-widest group-hover:text-purple-400 transition-colors uppercase text-lg">{ticket.ticket_number}</p>
                      <div className="mt-2 text-right flex justify-end">
                        {getStatusBadge(ticket.status)}
                      </div>
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
