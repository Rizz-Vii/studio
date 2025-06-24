// src/components/site-footer.tsx
import { AppLogo, AppName } from '@/constants/nav';

export default function SiteFooter() {
    return (
        <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <AppLogo className="h-6 w-6 text-primary" />
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by an AI agent in Firebase Studio.
                    </p>
                </div>
                 <p className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} {AppName}</p>
            </div>
        </footer>
    );
}
