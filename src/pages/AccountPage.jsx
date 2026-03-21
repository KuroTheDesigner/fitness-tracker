import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, ImagePlus, LogOut, Mail, User } from 'lucide-react';

const AccountPage = ({ user, onSignOut }) => {
    return (
        <div className="screen animate-in fade-in duration-300 pb-8">
            <div className="h-36 rounded-2xl bg-gradient-to-r from-primary/40 via-violet-500/30 to-cyan-500/40 border border-white/10 mb-6 relative overflow-hidden">
                <Button size="sm" variant="secondary" className="absolute top-3 right-3 h-8 text-[10px] uppercase font-bold gap-1">
                    <ImagePlus size={12} /> Edit Banner
                </Button>
            </div>

            <div className="-mt-14 mb-6 px-2 flex items-end gap-4">
                <div className="w-24 h-24 rounded-2xl bg-secondary border-2 border-background flex items-center justify-center overflow-hidden shadow-xl">
                    <User size={32} className="text-muted-foreground" />
                </div>
                <Button variant="secondary" className="h-9 text-[10px] uppercase font-bold gap-1">
                    <Camera size={12} /> Edit Photo
                </Button>
            </div>

            <Card className="p-4 mb-4 bg-secondary/40 border-muted">
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-2">Account</p>
                <h1 className="text-2xl font-display">{user?.name || 'Athlete'}</h1>
                <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail size={14} /> {user?.email || 'No email available'}
                </div>
                <Button
                    variant="outline"
                    className="mt-4 w-full justify-start border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                    onClick={onSignOut}
                >
                    <LogOut size={14} className="mr-2" /> Sign Out
                </Button>
            </Card>

            <Card className="p-4 bg-secondary/20 border-muted">
                <p className="text-sm text-muted-foreground">Full account settings module is now anchored here and ready for profile, preferences, privacy, and billing expansion.</p>
            </Card>
        </div>
    );
};

export default AccountPage;
