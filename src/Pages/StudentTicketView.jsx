import React, { useEffect, useRef, useState } from "react";
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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { format } from "date-fns";
import ConfirmDialog from "@/Components/common/ConfirmDialog";

export default function StudentTicketView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  const previousStatusRef = useRef(null);
  const notificationShownRef = useRef(false);
  const audioRef = useRef(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const studentNumber = urlParams.get('student');

  // Initialize audio
  useEffect(() => {
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
      navigate(createPageUrl("Home"));
    }
  }, [studentNumber, navigate]);

  const { data: myTickets = [], refetch } = useQuery({
    queryKey: ['myTickets', studentNumber],
    queryFn: () => base44.entities.QueueTicket.filter({ student_email: `${studentNumber}@student.edu` }, '-created_date'),
    enabled: !!studentNumber,
    refetchInterval: 3000
  });

  const cancelMutation = useMutation({
    mutationFn: (ticketId) => base44.entities.QueueTicket.cancel(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries(['myTickets']);
      refetch();
      navigate(createPageUrl("Home"));
    },
    onError: (error) => {
      console.error('Failed to cancel ticket:', error);
    }
  });

  const activeTicket = myTickets.find(t => t.status === 'waiting' || t.status === 'in_progress' || t.status === 'called');
  const completedTickets = myTickets.filter(t => t.status === 'completed' || t.status === 'cancelled');

  // Play sound and show browser notification when ticket is called
  useEffect(() => {
    if (activeTicket && (activeTicket.status === 'in_progress' || activeTicket.status === 'called')) {
      if (previousStatusRef.current === 'waiting' && !notificationShownRef.current) {
        notificationShownRef.current = true;

        if (audioRef.current) {
          try { audioRef.current(); } catch (e) { console.error('Error playing sound:', e); }
        }

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 It\'s Your Turn!', {
            body: `Ticket ${activeTicket.ticket_number} — Please proceed to the ${activeTicket.department_name} counter now!`,
            icon: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=192&h=192&fit=crop',
            tag: 'queue-notification',
            requireInteraction: true
          });
        }
      }
    } else {
      notificationShownRef.current = false;
    }
  }, [activeTicket?.status]);

  // Update previous status ref
  useEffect(() => {
    if (activeTicket) {
      previousStatusRef.current = activeTicket.status;
    }
  }, [activeTicket?.status]);

  const getStatusInfo = (status) => {
    if (status === 'in_progress' || status === 'called') {
      return {
        badge: <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-black tracking-widest uppercase px-6 py-2 rounded-full text-xs">Now serving you</Badge>,
        helper: null,
      };
    }
    if (status === 'waiting') {
      return {
        badge: <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black tracking-widest uppercase px-6 py-2 rounded-full text-xs">Waiting in queue</Badge>,
        helper: <p className="text-xs text-blue-100/30 font-medium mt-2 text-center">You'll be called soon.</p>,
      };
    }
    if (status === 'completed') {
      return {
        badge: <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black tracking-widest uppercase px-6 py-2 rounded-full text-xs">Completed</Badge>,
        helper: null,
      };
    }
    return {
      badge: <Badge className="bg-white/5 text-blue-100/30 border border-white/5 font-black tracking-widest uppercase px-6 py-2 rounded-full text-xs">Cancelled</Badge>,
      helper: null,
    };
  };

  // Helpers to open/confirm/close the cancel dialog
  const requestCancel = (id) => {
    setPendingCancelId(id);
    setConfirmOpen(true);
  };
  const handleConfirmCancel = () => {
    if (pendingCancelId) cancelMutation.mutate(pendingCancelId);
    setConfirmOpen(false);
    setPendingCancelId(null);
  };
  const handleCancelDialog = () => {
    setConfirmOpen(false);
    setPendingCancelId(null);
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
              <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TicketIcon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">No Active Tickets</h2>
              <p className="text-muted-foreground font-medium mb-8">
                Student ID <span className="text-foreground">{studentNumber}</span> has no active or recent tickets.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`)}
                  className="w-full h-12 text-base"
                >
                  Get a New Ticket
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(createPageUrl("Home"))}
                  className="w-full h-11"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 px-4 py-8 md:py-12">

      {/* Confirm cancel dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Cancel Ticket?"
        description="This will remove you from the queue. You'll need to get a new ticket if you change your mind."
        confirmLabel="Yes, cancel ticket"
        cancelLabel="Keep my spot"
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelDialog}
      />

      <AnimatePresence>
        {(activeTicket?.status === 'in_progress' || activeTicket?.status === 'called') && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-2xl px-4"
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 24 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: shouldReduceMotion ? 1 : [1, 1.05, 1],
                }}
                transition={{ duration: 1.8, repeat: shouldReduceMotion ? 0 : Infinity }}
                className="w-28 h-28 sm:w-36 sm:h-36 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 relative"
              >
                <TicketIcon className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
              </motion.div>

              <motion.h1
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl sm:text-5xl font-semibold text-foreground tracking-tight mb-6"
              >
                Proceed to counter
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-5 px-5 sm:px-8 py-4 bg-card border border-border rounded-2xl"
              >
                <div className="text-left">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Ticket Number</p>
                  <p className="text-2xl sm:text-3xl font-semibold text-foreground tracking-wide">{activeTicket.ticket_number}</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-left">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Department</p>
                  <p className="text-2xl sm:text-3xl font-semibold text-foreground truncate max-w-[220px] sm:max-w-[260px]">{activeTicket.department_name}</p>
                </div>
              </motion.div>

              <div className="mt-8 flex flex-col items-center gap-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <Button
                    onClick={() => requestCancel(activeTicket.id)}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Ticket
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
          <div>
            <h1 className="text-2xl md:text-4xl font-semibold text-foreground tracking-tight">My Queue Status</h1>
            <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Student ID: {studentNumber}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="w-11 h-11 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Home"))}
              className="h-11 px-4"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Notification Permission Alert */}
        {activeTicket && 'Notification' in window && Notification.permission === 'default' && (
          <Alert className="bg-primary/10 border-primary/20 rounded-2xl p-4">
            <Bell className="h-5 w-5 text-primary" />
            <AlertDescription className="text-foreground text-sm ml-3 flex items-center justify-between w-full">
              <span>Enable notifications for turn alerts.</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-primary font-semibold"
                onClick={() => Notification.requestPermission()}
              >
                Allow
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* No active ticket — prompt to get a new one (e.g. staff cancelled it) */}
        {!activeTicket && completedTickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-none overflow-hidden">
              <CardContent className="p-6 md:p-10 text-center">
                <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TicketIcon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">No Active Ticket</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  You don't have an active ticket right now. You can join the queue again below.
                </p>
                <Button
                  onClick={() => navigate(createPageUrl("StudentTakeTicket") + `?student=${studentNumber}`)}
                  className="w-full h-11"
                >
                  Get a New Ticket
                </Button>
              </CardContent>
            </Card>
          </motion.div>
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
              <CardHeader className="p-6 md:p-10 border-b border-border/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-medium text-primary mb-1">Service Counter</p>
                    <CardTitle className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight leading-none">{activeTicket.department_name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-2">
                      Joined at {format(new Date(activeTicket.created_date), 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {getStatusInfo(activeTicket.status).badge}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="space-y-10">
                  {/* Ticket Number */}
                  <div className="p-8 md:p-12 bg-card rounded-[2.5rem] text-center border border-border shadow-inner">
                    <p className="text-xs font-medium text-muted-foreground tracking-wide mb-4">Your Ticket Number</p>
                    <p className="text-6xl md:text-7xl font-bold text-foreground tracking-tight leading-none">
                      {activeTicket.ticket_number}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-6 md:p-8 bg-card rounded-2xl border border-border flex flex-col items-center">
                      <Users className="w-6 h-6 text-primary mb-2 opacity-80" />
                      <span className="text-xs text-muted-foreground mb-1">Your position</span>
                      <p className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">#{activeTicket.queue_position || 1}</p>
                    </div>
                    <div className="p-6 md:p-8 bg-card rounded-2xl border border-border flex flex-col items-center">
                      <Clock className="w-6 h-6 text-primary mb-2 opacity-80" />
                      <span className="text-xs text-muted-foreground mb-1">Wait time</span>
                      <p className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                        {activeTicket.estimated_wait_time || 15}<span className="text-sm ml-1 text-muted-foreground">min</span>
                      </p>
                    </div>
                  </div>

                  {(activeTicket.status === 'in_progress' || activeTicket.status === 'called') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 bg-primary/10 border border-primary/20 rounded-3xl text-center"
                    >
                      <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                      <p className="text-xl font-semibold text-foreground tracking-tight leading-tight">
                        IT'S YOUR TURN!<br />
                        <span className="text-xs font-medium text-muted-foreground opacity-80">Head to the counter now</span>
                      </p>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      variant="ghost"
                      className="flex-1 h-12"
                      onClick={() => navigate(createPageUrl("Home"))}
                    >
                      Back to Home
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-[2] h-12"
                      onClick={() => requestCancel(activeTicket.id)}
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
          <Card className="glass-card border-none overflow-hidden relative group">
            <CardHeader className="p-6 md:p-8 border-b border-border/50">
              <CardTitle className="text-lg font-semibold text-foreground tracking-tight">Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="space-y-3">
                {completedTickets.slice(0, 5).map((ticket) => {
                  const { badge } = getStatusInfo(ticket.status);
                  return (
                    <div key={ticket.id} className="flex items-center justify-between p-4 md:p-5 bg-card hover:bg-accent/50 transition-colors rounded-xl border border-border group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${ticket.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                          {ticket.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground tracking-tight text-base">{ticket.department_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(ticket.created_date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground tracking-wider group-hover:text-primary transition-colors text-lg">{ticket.ticket_number}</p>
                        <div className="mt-1 flex justify-end">
                          {badge}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
