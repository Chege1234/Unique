import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { User, Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RoleSelection() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [studentId, setStudentId] = useState('');
    const [staffDepartment, setStaffDepartment] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await api.auth.me();
                setUser(currentUser);
            } catch (e) {
                // Not authenticated, redirect to home to login
                navigate(createPageUrl("Home"));
            }
        };
        fetchUser();
    }, [navigate]);

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: () => api.entities.Department.filter({ is_active: true })
    });

    const updateUserMutation = useMutation({
        mutationFn: (data) => api.auth.updateMe(data),
        onSuccess: (updatedUser) => {
            if (updatedUser.department) {
                navigate(createPageUrl("StaffDashboard"));
            } else {
                navigate(createPageUrl("StudentDashboard"));
            }
        }
    });

    const handleSubmit = () => {
        if (selectedRole === 'student' && studentId) {
            updateUserMutation.mutate({ student_id: studentId });
        } else if (selectedRole === 'staff' && staffDepartment) {
            updateUserMutation.mutate({ department: staffDepartment });
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 relative z-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
                <Card className="glass-card border-none overflow-hidden group">
                    <CardHeader className="text-center pb-8 border-b border-white/5">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                            <User className="h-10 w-10 text-white" />
                        </div>
                        <CardTitle className="text-4xl font-black text-white tracking-tight">Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Granted</span></CardTitle>
                        <CardDescription className="text-blue-100/40 font-medium text-lg mt-2">Welcome back, {user.full_name}. Please choose your role to continue.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Card
                                className={`cursor-pointer transition-all duration-300 border-none relative overflow-hidden group ${selectedRole === 'student' ? 'bg-purple-600/20 ring-2 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                                onClick={() => setSelectedRole('student')}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-8 relative z-10">
                                    <GraduationCap className={`h-12 w-12 mb-4 transition-colors duration-300 ${selectedRole === 'student' ? 'text-purple-400' : 'text-blue-100/20'}`} />
                                    <p className={`font-black uppercase tracking-[0.2em] text-xs ${selectedRole === 'student' ? 'text-white' : 'text-blue-100/40'}`}>Student</p>
                                </CardContent>
                                {selectedRole === 'student' && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent animate-pulse" />}
                            </Card>
                            <Card
                                className={`cursor-pointer transition-all duration-300 border-none relative overflow-hidden group ${selectedRole === 'staff' ? 'bg-blue-600/20 ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                                onClick={() => setSelectedRole('staff')}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-8 relative z-10">
                                    <Briefcase className={`h-12 w-12 mb-4 transition-colors duration-300 ${selectedRole === 'staff' ? 'text-blue-400' : 'text-blue-100/20'}`} />
                                    <p className={`font-black uppercase tracking-[0.2em] text-xs ${selectedRole === 'staff' ? 'text-white' : 'text-blue-100/40'}`}>Staff</p>
                                </CardContent>
                                {selectedRole === 'staff' && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent animate-pulse" />}
                            </Card>
                        </div>

                        {selectedRole === 'student' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <Label htmlFor="studentId" className="text-[10px] font-black text-purple-400 uppercase tracking-[0.25em] ml-1">Student Number</Label>
                                <Input
                                    id="studentId"
                                    placeholder="Enter your 8-digit student number..."
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/10 rounded-2xl focus:ring-purple-500/50 focus:border-purple-500/50 text-lg font-bold tracking-widest"
                                />
                            </motion.div>
                        )}

                        {selectedRole === 'staff' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <Label htmlFor="department" className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] ml-1">Assigned Department</Label>
                                <Select onValueChange={setStaffDepartment} value={staffDepartment}>
                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-blue-500/50 focus:border-blue-500/50 text-lg font-bold">
                                        <SelectValue placeholder="Select your department..." />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10 text-white">
                                        {departments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.name} className="hover:bg-white/5 cursor-pointer">{dept.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedRole || (selectedRole === 'student' && !studentId) || (selectedRole === 'staff' && !staffDepartment) || updateUserMutation.isPending}
                            className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.3em] text-sm rounded-2xl shadow-2xl shadow-purple-500/20 transition-all active:scale-[0.98]"
                        >
                            {updateUserMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : 'CONTINUE'}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

