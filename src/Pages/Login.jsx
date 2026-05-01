import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        // Check initial session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const returnUrl = searchParams.get('returnUrl') || '/';
                    navigate(returnUrl);
                }
            } catch (err) {
                console.error("Session check error:", err);
            } finally {
                setIsCheckingSession(false);
            }
        };

        checkSession();

        // Listen for auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const returnUrl = searchParams.get('returnUrl');
                if (returnUrl) {
                    navigate(returnUrl);
                    return;
                }
                // Check user role in profiles table
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (profile?.role === 'staff' || profile?.role === 'admin') {
                        navigate('/staff-dashboard');
                    } else {
                        navigate('/');
                    }
                } catch {
                    navigate('/');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingSession) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
            >
                <Card className="glass-card border-none overflow-hidden group rounded-[2rem]">
                    <CardHeader className="text-center pb-8 border-b border-white/5">
                        <div className="w-20 h-20 bg-[#0d6cf2] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <CardTitle className="text-4xl font-black text-white tracking-tight">Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#0d6cf2]">Login</span></CardTitle>
                        <CardDescription className="text-blue-100/40 mt-2 text-lg font-medium uppercase tracking-[0.2em]">
                            Sign in to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start"
                            >
                                <AlertCircle className="w-6 h-6 text-red-400 mr-4 shrink-0" />
                                <p className="text-sm text-red-200 font-bold uppercase tracking-wider">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-[10px] font-black text-[#0d6cf2] uppercase tracking-[0.25em] ml-2">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="name@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-16 bg-white/5 border-white/10 text-white placeholder:text-white/10 rounded-2xl focus:ring-[#0d6cf2]/50 focus:border-[#0d6cf2]/50 text-xl font-bold px-6"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password" title="password" className="text-[10px] font-black text-[#0d6cf2] uppercase tracking-[0.25em] ml-2">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-16 bg-white/5 border-white/10 text-white placeholder:text-white/10 rounded-2xl focus:ring-[#0d6cf2]/50 focus:border-[#0d6cf2]/50 text-xl font-bold px-6"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full h-18 bg-[#0d6cf2] hover:bg-[#0b5ed7] text-white font-black uppercase tracking-[0.3em] text-sm rounded-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        VERIFYING...
                                    </>
                                ) : (
                                    'AUTHENTICATE'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <p className="text-center mt-10 text-blue-100/20 text-xs font-bold uppercase tracking-widest">
                    Staff Login · Powered by Supabase
                </p>
            </motion.div>
        </div>
    );
}

