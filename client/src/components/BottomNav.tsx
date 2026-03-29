/**
 * BottomNav - 墨と金箔テーマ
 * モバイルファーストの下部タブナビゲーション
 */
import { useLocation, Link } from 'wouter';
import { LayoutDashboard, Users, MessageSquare, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: 'ホーム', icon: LayoutDashboard },
  { path: '/customers', label: '顧客', icon: Users },
  { path: '/messages', label: 'LINE', icon: MessageSquare },
  { path: '/sales', label: '売上', icon: TrendingUp },
  { path: '/settings', label: '設定', icon: Settings },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location === '/' : location.startsWith(path);
          return (
            <Link key={path} href={path}>
              <div className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200",
                isActive
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_oklch(0.75_0.1_75)]")} />
                <span className="text-[10px] font-medium tracking-wider">{label}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-gold rounded-full" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
