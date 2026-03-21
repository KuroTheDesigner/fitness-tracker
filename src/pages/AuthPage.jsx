import React, { useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { signIn } from '@/shoo';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/Card';
import {
    AUTH_LAST_USERNAME_KEY,
    AUTH_PENDING_INTENT_KEY,
} from '@/lib/authStorage';

const PIN_REGEX = /^\d{4}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,24}$/;

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const AuthPage = ({ onCredentialAuth }) => {
    const signUpWithCredentials = useMutation(api.users.signUpWithCredentials);
    const signInWithCredentials = useMutation(api.users.signInWithCredentials);
    const [mode, setMode] = useState('signin');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [signInValues, setSignInValues] = useState(() => ({
        username: typeof window !== 'undefined' ? (localStorage.getItem(AUTH_LAST_USERNAME_KEY) || '') : '',
        pin: '',
    }));

    const [signUpValues, setSignUpValues] = useState({
        firstName: '',
        username: '',
        pin: '',
        confirmPin: '',
    });

    const signUpPinChecks = useMemo(() => ({
        hasFourDigits: PIN_REGEX.test(signUpValues.pin),
        matchesConfirm: signUpValues.confirmPin.length > 0 && signUpValues.pin === signUpValues.confirmPin,
    }), [signUpValues.pin, signUpValues.confirmPin]);

    const canSubmitSignUp = signUpValues.firstName.trim().length >= 2
        && USERNAME_REGEX.test(signUpValues.username.trim())
        && signUpPinChecks.hasFourDigits
        && signUpPinChecks.matchesConfirm;

    const handleGoogleAuth = (intent) => {
        setError('');
        localStorage.setItem(AUTH_PENDING_INTENT_KEY, intent);
        signIn();
    };

    const handleCredentialSignIn = async (e) => {
        e.preventDefault();
        setError('');

        if (!USERNAME_REGEX.test(signInValues.username.trim()) || !PIN_REGEX.test(signInValues.pin)) {
            setError('Enter a valid username and 4-digit PIN.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await signInWithCredentials({
                username: signInValues.username,
                pin: signInValues.pin,
            });
            onCredentialAuth?.({
                sessionToken: result.sessionToken,
                flow: 'signin',
                username: result.username,
            });
            setSignInValues((prev) => ({ ...prev, pin: '' }));
        } catch (err) {
            setError(err?.message || 'Invalid username or PIN.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCredentialSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (!canSubmitSignUp) {
            setError('Please complete all sign up fields correctly.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await signUpWithCredentials({
                firstName: signUpValues.firstName,
                username: signUpValues.username,
                pin: signUpValues.pin,
            });
            onCredentialAuth?.({
                sessionToken: result.sessionToken,
                flow: 'signup',
                username: result.username,
            });
            setSignUpValues({ firstName: '', username: '', pin: '', confirmPin: '' });
        } catch (err) {
            setError(err?.message || 'Could not create account.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
                        <div className="w-full grid grid-cols-2 bg-background/40 rounded-md border border-white/10 p-1">
                            <button
                                type="button"
                                className={`h-9 rounded-md text-[11px] font-black uppercase tracking-widest transition ${mode === 'signin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => {
                                    setMode('signin');
                                    setError('');
                                }}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className={`h-9 rounded-md text-[11px] font-black uppercase tracking-widest transition ${mode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => {
                                    setMode('signup');
                                    setError('');
                                }}
                            >
                                Sign Up
                            </button>
                        </div>

                        {mode === 'signin' ? (
                            <>
                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest text-center">Sign in to load your profile and saved data</p>
                                <Button
                                    size="lg"
                                    className="w-full h-12 gap-3 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_25px_rgba(0,255,102,0.3)] transition-all"
                                    onClick={() => handleGoogleAuth('signin')}
                                    disabled={isSubmitting}
                                >
                                    <GoogleIcon />
                                    SIGN IN WITH GOOGLE
                                </Button>

                                <div className="w-full flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                                    <span className="h-px flex-1 bg-white/10" />
                                    or use username + PIN
                                    <span className="h-px flex-1 bg-white/10" />
                                </div>

                                <form className="w-full space-y-3" onSubmit={handleCredentialSignIn}>
                                    <Input
                                        value={signInValues.username}
                                        onChange={(e) => setSignInValues((prev) => ({ ...prev, username: e.target.value }))}
                                        placeholder="Username"
                                        autoComplete="username"
                                        className="h-11"
                                        maxLength={24}
                                    />
                                    <Input
                                        value={signInValues.pin}
                                        onChange={(e) => setSignInValues((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                        placeholder="4-digit PIN"
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="current-password"
                                        className="h-11"
                                        maxLength={4}
                                    />
                                    <Button type="submit" size="lg" className="w-full h-11 font-black text-xs uppercase tracking-widest" disabled={isSubmitting}>
                                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <>
                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest text-center">Create your account and start onboarding</p>
                                <Button
                                    size="lg"
                                    className="w-full h-12 gap-3 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_25px_rgba(0,255,102,0.3)] transition-all"
                                    onClick={() => handleGoogleAuth('signup')}
                                    disabled={isSubmitting}
                                >
                                    <GoogleIcon />
                                    SIGN UP WITH GOOGLE
                                </Button>

                                <div className="w-full flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                                    <span className="h-px flex-1 bg-white/10" />
                                    or create with username + PIN
                                    <span className="h-px flex-1 bg-white/10" />
                                </div>

                                <form className="w-full space-y-3" onSubmit={handleCredentialSignUp}>
                                    <Input
                                        value={signUpValues.firstName}
                                        onChange={(e) => setSignUpValues((prev) => ({ ...prev, firstName: e.target.value }))}
                                        placeholder="First name"
                                        autoComplete="given-name"
                                        className="h-11"
                                        maxLength={40}
                                    />
                                    <Input
                                        value={signUpValues.username}
                                        onChange={(e) => setSignUpValues((prev) => ({ ...prev, username: e.target.value }))}
                                        placeholder="Username"
                                        autoComplete="username"
                                        className="h-11"
                                        maxLength={24}
                                    />
                                    <Input
                                        value={signUpValues.pin}
                                        onChange={(e) => setSignUpValues((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                        placeholder="Create 4-digit PIN"
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="new-password"
                                        className="h-11"
                                        maxLength={4}
                                    />
                                    <Input
                                        value={signUpValues.confirmPin}
                                        onChange={(e) => setSignUpValues((prev) => ({ ...prev, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                        placeholder="Confirm 4-digit PIN"
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="new-password"
                                        className="h-11"
                                        maxLength={4}
                                    />
                                    <div className="text-[10px] uppercase tracking-widest space-y-1">
                                        <p className={signUpPinChecks.hasFourDigits ? 'text-primary' : 'text-muted-foreground'}>• PIN must be exactly 4 digits</p>
                                        <p className={signUpPinChecks.matchesConfirm ? 'text-primary' : 'text-muted-foreground'}>• PIN confirmation must match</p>
                                    </div>
                                    <Button type="submit" size="lg" className="w-full h-11 font-black text-xs uppercase tracking-widest" disabled={isSubmitting || !canSubmitSignUp}>
                                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </>
                        )}

                        {error && <p className="w-full text-center text-xs text-red-300">{error}</p>}

                        {mode === 'signin' ? (
                            <p className="text-[11px] text-muted-foreground text-center">
                                New here?{' '}
                                <button type="button" className="text-primary font-semibold" onClick={() => setMode('signup')}>
                                    Go to Sign Up
                                </button>
                            </p>
                        ) : (
                            <p className="text-[11px] text-muted-foreground text-center">
                                Already have an account?{' '}
                                <button type="button" className="text-primary font-semibold" onClick={() => setMode('signin')}>
                                    Go to Sign In
                                </button>
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;
