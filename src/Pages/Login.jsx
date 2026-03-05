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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const returnUrl = searchParams.get('returnUrl') || '/';
                navigate(returnUrl);
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
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-2xl border-none overflow-hidden">
                    <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">Staff Access</CardTitle>
                        <CardDescription className="text-blue-100 mt-2 text-base">
                            Sign in to manage the university queue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 bg-white">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">
                                    University Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="name@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <Label htmlFor="password" title="password" className="text-sm font-semibold text-gray-700">
                                        Password
                                    </Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <p className="text-center mt-8 text-gray-500 text-sm">
                    Protected by Supabase Authentication
                </p>
            </motion.div>
        </div>
    );
}
