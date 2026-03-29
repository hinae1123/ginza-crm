/**
 * Dashboard - 墨と金箔テーマ
 * ホーム画面：売上進捗、未送信顧客、最近の送信履歴のサマリー
 */
import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import { Users, MessageSquare, TrendingUp, Star, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { customers, sales, excluded, sendHistory, monthlyGoal } = useData();

  const currentMonth = new Date().getMonth() + 1;

  const stats = useMemo(() => {
    const monthSales = sales.filter(s => s.month === currentMonth);
    const monthSubtotal = monthSales.reduce((sum, s) => sum + s.subtotal, 0);
    const progress = Math.min((monthSubtotal / monthlyGoal) * 100, 100);

    const activeCustomers = customers.filter(c => !excluded.some(e =>
      e.name === c.name || e.nickname === c.nickname ||
      c.name.includes(e.nickname) || e.name.includes(c.name)
    ));

    const unsent = activeCustomers.filter(c =>
      c.lastSendDate === '未送信' || c.sendCount === 0
    );

    const longUnsent = activeCustomers.filter(c => {
      if (c.daysSinceLastSend === '未送信') return false;
      const days = parseInt(c.daysSinceLastSend);
      return !isNaN(days) && days >= 14;
    });

    const starCustomers = customers.filter(c => c.star);

    return {
      totalCustomers: customers.length,
      starCount: starCustomers.length,
      monthSubtotal,
      progress,
      unsentCount: unsent.length,
      longUnsentCount: longUnsent.length,
      excludedCount: excluded.length,
      recentSends: sendHistory.slice(0, 5),
      monthVisits: monthSales.length,
    };
  }, [customers, sales, excluded, sendHistory, currentMonth, monthlyGoal]);

  const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-baseline justify-between"
      >
        <div>
          <h1 className="font-serif text-2xl font-semibold text-gold tracking-wider">粋</h1>
          <p className="text-xs text-muted-foreground mt-0.5">営業ダッシュボード</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Monthly Sales Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card border-border/50 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gold" />
              {monthNames[currentMonth]}の売上進捗（小計ベース）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-mono text-2xl font-semibold text-foreground">
                ¥{stats.monthSubtotal.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                / ¥{monthlyGoal.toLocaleString()}
              </span>
            </div>
            <Progress
              value={stats.progress}
              className="h-2 bg-secondary"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                達成率 {stats.progress.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                来店 {stats.monthVisits}回
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link href="/customers">
          <Card className="bg-card border-border/50 hover:border-gold/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gold" />
                <span className="text-xs text-muted-foreground">顧客数</span>
              </div>
              <p className="font-mono text-xl font-semibold">{stats.totalCustomers}</p>
              <p className="text-xs text-gold/70 mt-1 flex items-center gap-1">
                <Star className="h-3 w-3" /> {stats.starCount}名
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/messages">
          <Card className="bg-card border-border/50 hover:border-gold/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gold" />
                <span className="text-xs text-muted-foreground">未送信</span>
              </div>
              <p className="font-mono text-xl font-semibold">{stats.unsentCount}</p>
              {stats.longUnsentCount > 0 && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {stats.longUnsentCount}名が14日以上
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Recent Send History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gold" />
                最近の送信
              </span>
              <Link href="/messages" className="text-gold text-xs flex items-center gap-0.5 hover:underline">
                すべて見る <ChevronRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentSends.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                まだ送信履歴がありません
              </p>
            ) : (
              <div className="space-y-2">
                {stats.recentSends.map((send, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{send.customerName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{send.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(send.sentAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Excluded List Summary */}
      {stats.excludedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-gold-dim" />
                除外リスト: {stats.excludedCount}名が営業LINE対象外
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
