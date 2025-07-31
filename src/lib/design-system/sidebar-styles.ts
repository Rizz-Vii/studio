/**
 * RankPilot Design System - Mobile Sidebar Styles
 * Optimized mobile navigation with proper touch targets
 */

export const sidebarStyles = {
    // Container styles
    container: {
        base: 'h-full bg-gray-900 text-white',
        mobile: 'w-[280px]', // Fixed mobile width
        desktop: 'w-[var(--sidebar-width)]',
    },

    // Navigation items
    navItem: {
        base: 'flex items-center gap-3 rounded-lg transition-all duration-200',
        padding: 'px-3 py-2.5', // 44px minimum touch target
        interactive: 'hover:bg-gray-800 active:bg-gray-700',
        selected: 'bg-gray-800 border-l-2 border-blue-500',
    },

    // Navigation groups
    navGroup: {
        container: 'mb-6',
        header: 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3',
        content: 'space-y-1',
    },

    // User switching section
    userSwitch: {
        container: 'border-t border-gray-800 pt-4 mt-4',
        trigger: 'flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-gray-800',
        dropdown: 'bg-gray-800 border border-gray-700 rounded-lg shadow-lg mt-1',
        userItem: 'flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors',
    },

    // Badges and indicators
    badge: {
        ai: 'bg-purple-500 text-white px-2 py-0.5 rounded text-xs font-medium',
        tier: 'bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium',
        count: 'bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded text-xs',
    },

    // Typography
    text: {
        primary: 'text-sm font-medium text-white',
        secondary: 'text-xs text-gray-400',
        userEmail: 'text-xs text-gray-500 truncate',
        tierLabel: 'text-xs text-gray-400',
    },

    // Icons
    icon: {
        size: 'w-5 h-5',
        color: 'text-gray-400 group-hover:text-white',
        selected: 'text-blue-400',
    }
} as const;

// Mobile-specific touch optimizations
export const mobileSidebarOptimizations = {
    // Ensure all interactive elements meet touch standards
    touchTarget: 'min-h-[44px] min-w-[44px]',

    // Improved spacing for mobile
    mobileSpacing: {
        itemPadding: 'px-4 py-3', // Larger touch areas
        groupSpacing: 'mb-6',     // More breathing room
        userSpacing: 'py-4',      // Larger user switching area
    },

    // Mobile typography enhancements
    mobileText: {
        navItem: 'text-base font-medium', // Larger for readability
        badge: 'text-xs font-semibold',
        userInfo: 'text-sm',
    },

    // Responsive behavior
    responsive: {
        hideOnMobile: 'hidden md:block',
        showOnMobile: 'block md:hidden',
        mobileOnly: 'md:hidden',
    }
} as const;
