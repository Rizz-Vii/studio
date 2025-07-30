
interface ChatBotProps {
    currentUrl?: string;
    className?: string;
}

interface CustomerChatBotProps {
    currentUrl?: string;
    className?: string;
}

interface AdminChatBotProps {
    className?: string;
}
/**
 * RankPilot Main ChatBot Component
 * Orchestrates customer and admin chatbots based on user permissions
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dynamic imports for better performance
const CustomerChatBot = dynamic(() => import('./CustomerChatBot.jsx') as Promise<{ default: React.ComponentType<CustomerChatBotProps> }>, {
    ssr: false,
});

const AdminChatBot = dynamic(() => import('./AdminChatBot.jsx') as Promise<{ default: React.ComponentType<AdminChatBotProps> }>, {
    ssr: false,
});

interface ChatBotProps {
    className?: string;
}

export default function ChatBot({ className }: ChatBotProps) {
    const { user, profile } = useAuth();
    const userTier = profile?.subscriptionTier || 'free';
    const pathname = usePathname();

    // Don't show chatbots on auth pages
    if (pathname?.includes('/auth/') || pathname?.includes('/login') || pathname?.includes('/register')) {
        return null;
    }

    // Don't show if user is not authenticated
    if (!user) {
        return null;
    }

    // Determine which chatbots to show
    const isAdmin = userTier === 'admin' || userTier === 'enterprise';
    const showCustomerChat = true; // Always show customer chat for authenticated users
    const showAdminChat = isAdmin; // Only show admin chat for admin/enterprise users

    // Get current URL for context
    const currentUrl = typeof window !== 'undefined' ? window.location.href : undefined;

    return (
        <>
            {/* Customer ChatBot - Always available for authenticated users */}
            {showCustomerChat && (
                <CustomerChatBot
                    currentUrl={currentUrl}
                    className={className}
                />
            )}

            {/* Admin ChatBot - Only for admin/enterprise users */}
            {showAdminChat && (
                <AdminChatBot
                    className={className}
                />
            )}
        </>
    );
}

// Export individual components for direct use
export { default as AdminChatBot } from './AdminChatBot';
export { default as CustomerChatBot } from './CustomerChatBot';

