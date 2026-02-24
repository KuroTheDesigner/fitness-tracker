import React from 'react';
import { signIn } from '@/shoo';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const AuthPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />

            <div className="z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-display uppercase tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(0,255,102,0.3)] text-white">
                        VIGOR
                    </h1>
                    <p className="text-muted-foreground uppercase text-xs font-black tracking-widest">
                        Tactical Physiology Tracking
                    </p>
                </div>

                <Card className="border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-6 flex flex-col items-center gap-6">
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest text-center">
                            Authenticate to sync your data
                        </p>
                        <Button
                            size="lg"
                            className="w-full h-12 gap-3 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_25px_rgba(0,255,102,0.3)] transition-all"
                            onClick={() => signIn()}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            SIGN IN WITH GOOGLE
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;
