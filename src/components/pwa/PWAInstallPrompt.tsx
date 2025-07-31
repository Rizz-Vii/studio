/**
 * PWA Install Prompt Component
 * Advanced Architecture Enhancement - DevReady Phase 3
 * 
 * Features:
 * - Install prompt UI with native app styling
 * - Connection status indicator
 * - Notification permission management
 * - Background sync status
 * - Update available notifications
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePWA } from '@/lib/pwa/pwa-manager';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    Bell,
    BellOff,
    CheckCircle,
    Download,
    RefreshCw,
    Smartphone,
    Wifi,
    WifiOff,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PWAInstallPromptProps {
    className?: string;
    showInAppHeader?: boolean;
}

export function PWAInstallPrompt({ className, showInAppHeader = false }: PWAInstallPromptProps) {
    const {
        isInstallable,
        isInstalled,
        connectionStatus,
        notificationsEnabled,
        installApp,
        enableNotifications,
        disableNotifications,
        updateApp
    } = usePWA();

    const [isInstalling, setIsInstalling] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [showUpdateAlert, setShowUpdateAlert] = useState(false);

    useEffect(() => {
        if (isInstallable && !isInstalled && !showInAppHeader) {
            setShowPrompt(true);
        }
    }, [isInstallable, isInstalled, showInAppHeader]);

    const handleInstall = async () => {
        setIsInstalling(true);
        try {
            const success = await installApp();
            if (success) {
                setShowPrompt(false);
            }
        } finally {
            setIsInstalling(false);
        }
    };

    const handleNotificationToggle = async (enabled: boolean) => {
        if (enabled) {
            await enableNotifications();
        } else {
            await disableNotifications();
        }
    };

    const handleUpdate = async () => {
        await updateApp();
        setShowUpdateAlert(false);
        window.location.reload();
    };

    // Compact header version
    if (showInAppHeader) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                {/* Connection Status */}
                <div className="flex items-center gap-1">
                    {connectionStatus === 'online' ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                        {connectionStatus}
                    </span>
                </div>

                {/* Install Button */}
                {isInstallable && !isInstalled && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleInstall}
                        disabled={isInstalling}
                        className="gap-1"
                    >
                        <Download className="h-3 w-3" />
                        <span className="hidden sm:inline">Install</span>
                    </Button>
                )}

                {/* PWA Badge */}
                {isInstalled && (
                    <Badge variant="secondary" className="gap-1">
                        <Smartphone className="h-3 w-3" />
                        <span className="hidden sm:inline">PWA</span>
                    </Badge>
                )}
            </div>
        );
    }

    // Full install prompt
    if (!showPrompt && !showUpdateAlert) {
        return null;
    }

    return (
        <>
            {/* Install Prompt */}
            {showPrompt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
                        <CardHeader className="text-center">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center justify-center gap-2">
                                        <Smartphone className="h-5 w-5 text-primary" />
                                        Install RankPilot
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Get the full app experience with offline access and push notifications
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPrompt(false)}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Features */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Work offline and sync when online</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Faster loading and better performance</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Push notifications for SEO insights</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Native app experience</span>
                                </div>
                            </div>

                            {/* Connection Status */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <div className="flex items-center gap-2">
                                    {connectionStatus === 'online' ? (
                                        <Wifi className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <WifiOff className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {connectionStatus === 'online' ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                <Badge variant={connectionStatus === 'online' ? 'default' : 'destructive'}>
                                    {connectionStatus === 'online' ? 'Connected' : 'Disconnected'}
                                </Badge>
                            </div>

                            {/* Notification Settings */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <div className="flex items-center gap-2">
                                    {notificationsEnabled ? (
                                        <Bell className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <BellOff className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="text-sm font-medium">Notifications</span>
                                </div>
                                <Switch
                                    checked={notificationsEnabled}
                                    onCheckedChange={handleNotificationToggle}
                                />
                            </div>

                            {/* Install Actions */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleInstall}
                                    disabled={isInstalling}
                                    className="flex-1 gap-2"
                                >
                                    {isInstalling ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    {isInstalling ? 'Installing...' : 'Install App'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPrompt(false)}
                                >
                                    Maybe Later
                                </Button>
                            </div>

                            {/* Install Instructions */}
                            <div className="text-xs text-muted-foreground text-center">
                                <p>The app will be added to your home screen and can be used offline</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Update Alert */}
            {showUpdateAlert && (
                <Alert className="fixed bottom-4 right-4 w-auto max-w-sm z-50 animate-in slide-in-from-bottom-5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between gap-2">
                        <span>Update available!</span>
                        <div className="flex gap-1">
                            <Button size="sm" onClick={handleUpdate}>
                                Update
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowUpdateAlert(false)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </>
    );
}

// PWA Status indicator component
export function PWAStatus({ className }: { className?: string; }) {
    const { isInstalled, connectionStatus, notificationsEnabled } = usePWA();
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className={cn("relative", className)}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="gap-2"
            >
                <div className="flex items-center gap-1">
                    {connectionStatus === 'online' ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    {isInstalled && <Smartphone className="h-4 w-4 text-blue-500" />}
                    {notificationsEnabled && <Bell className="h-4 w-4 text-blue-500" />}
                </div>
            </Button>

            {showDetails && (
                <Card className="absolute top-full right-0 mt-2 w-64 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">PWA Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span>Connection</span>
                            <Badge variant={connectionStatus === 'online' ? 'default' : 'destructive'}>
                                {connectionStatus}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span>App Installed</span>
                            <Badge variant={isInstalled ? 'default' : 'secondary'}>
                                {isInstalled ? 'Yes' : 'No'}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span>Notifications</span>
                            <Badge variant={notificationsEnabled ? 'default' : 'secondary'}>
                                {notificationsEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>

                        {!isInstalled && (
                            <div className="pt-2 border-t">
                                <PWAInstallPrompt showInAppHeader />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Hook for PWA install prompt management
export function usePWAInstallPrompt() {
    const { isInstallable, isInstalled } = usePWA();
    const [hasShownPrompt, setHasShownPrompt] = useState(false);

    useEffect(() => {
        // Show prompt after user has been active for 30 seconds
        if (isInstallable && !isInstalled && !hasShownPrompt) {
            const timer = setTimeout(() => {
                setHasShownPrompt(true);
            }, 30000);

            return () => clearTimeout(timer);
        }
    }, [isInstallable, isInstalled, hasShownPrompt]);

    const showPromptNow = () => {
        setHasShownPrompt(true);
    };

    const shouldShowPrompt = isInstallable && !isInstalled && hasShownPrompt;

    return {
        shouldShowPrompt,
        showPromptNow,
        isInstallable,
        isInstalled
    };
}
