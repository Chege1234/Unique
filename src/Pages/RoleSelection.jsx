import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
                const currentUser = await base44.auth.me();
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
        queryFn: () => base44.entities.Department.filter({ is_active: true })
    });

    const updateUserMutation = useMutation({
        mutationFn: (data) => base44.auth.updateMe(data),
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
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <Card className="w-full max-w-lg mx-auto shadow-2xl">
                    <CardHeader className="text-center">
                        <User className="mx-auto h-12 w-12 text-blue-500" />
                        <CardTitle className="text-2xl mt-4">Welcome, {user.full_name}!</CardTitle>
                        <CardDescription>Please complete your profile by selecting your role.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Card 
                                className={`cursor-pointer transition-all text-center ${selectedRole === 'student' ? 'border-blue-500 ring-2 ring-blue-500' : 'hover:border-gray-400'}`}
                                onClick={() => setSelectedRole('student')}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <GraduationCap className="h-8 w-8 mb-2 text-blue-600" />
                                    <p className="font-semibold">I am a Student</p>
                                </CardContent>
                            </Card>
                            <Card 
                                className={`cursor-pointer transition-all text-center ${selectedRole === 'staff' ? 'border-blue-500 ring-2 ring-blue-500' : 'hover:border-gray-400'}`}
                                onClick={() => setSelectedRole('staff')}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <Briefcase className="h-8 w-8 mb-2 text-green-600" />
                                    <p className="font-semibold">I am Staff</p>
                                </CardContent>
                            </Card>
                        </div>

                        {selectedRole === 'student' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                <Label htmlFor="studentId">Student ID</Label>
                                <Input 
                                    id="studentId" 
                                    placeholder="Enter your student ID"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                />
                            </motion.div>
                        )}

                        {selectedRole === 'staff' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                <Label htmlFor="department">Select Your Department</Label>
                                <Select onValueChange={setStaffDepartment} value={staffDepartment}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a department..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        )}
                        
                        <Button 
                            onClick={handleSubmit} 
                            disabled={!selectedRole || (selectedRole === 'student' && !studentId) || (selectedRole === 'staff' && !staffDepartment) || updateUserMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save and Continue'}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}