import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

const ConfirmDialog = ({
    isOpen: open,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default', // 'default' | 'danger'
    children
}) => {
    if (!open) return null;

    const isDestructive = variant === 'danger';

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
            <Card className="w-full max-w-sm animate-in zoom-in-95 fade-in duration-200 p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDestructive ? 'bg-destructive/10' : 'bg-primary/10'
                        }`}>
                        {isDestructive ? (
                            <AlertTriangle size={20} className="text-destructive" />
                        ) : (
                            <CheckCircle2 size={20} className="text-primary" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-display mb-1">{title}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground -mt-1"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </Button>
                </div>

                {/* Custom Content */}
                {children && (
                    <div className="mb-6">
                        {children}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={isDestructive ? 'destructive' : 'default'}
                        className="flex-1"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ConfirmDialog;
