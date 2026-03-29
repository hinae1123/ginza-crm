/**
 * SalesPage - 墨と金箔テーマ
 * 売上管理：月別一覧・入力・顧客別集計・目標進捗
 * 目標: 小計ベースで300万円/月
 */
import { useState, useMemo } from 'react';
import { useData, type SalesRecord } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp, Plus, Calendar, Users, Trash2, BarChart3, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SalesPage() {
  const { sales, addSalesRecord, deleteSalesRecord, monthlyGoal } = useData();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [formPartySize, setFormPartySize] = useState('1');
  const [formSubtotal, setFormSubtotal] = useState('');
  const [formTotal, setFormTotal] = useState('');
  const [formDrinks, setFormDrinks] = useState('');

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const availableMonths = useMemo(() => {
    const m = new Set(sales.map(s => s.month));
    // Always include current month
    m.add(new Date().getMonth() + 1);
    return Array.from(m).sort((a, b) => a - b);
  }, [sales]);

  const monthSales = useMemo(() => {
    return sales
      .filter(s => s.month === selectedMonth)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sales, selectedMonth]);

  const monthStats = useMemo(() => {
    const subtotal = monthSales.reduce((sum, s) => sum + s.subtotal, 0);
    const total = monthSales.reduce((sum, s) => sum + s.total, 0);
    const visits = monthSales.length;
    const progress = Math.min((subtotal / monthlyGoal) * 100, 100);

    // Customer breakdown
    const byCustomer = new Map<string, { visits: number; subtotal: number; total: number }>();
    monthSales.forEach(s => {
      const existing = byCustomer.get(s.customerName) || { visits: 0, subtotal: 0, total: 0 };
      existing.visits += 1;
      existing.subtotal += s.subtotal;
      existing.total += s.total;
      byCustomer.set(s.customerName, existing);
    });

    const customerBreakdown = Array.from(byCustomer.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.subtotal - a.subtotal);

    return { subtotal, total, visits, progress, customerBreakdown };
  }, [monthSales, monthlyGoal]);

  const handleAddSale = () => {
    if (!formDate || !formCustomer || !formSubtotal || !formTotal) {
      toast.error('必須項目を入力してください');
      return;
    }

    const month = parseInt(formDate.split('/')[0]) || selectedMonth;

    const record: SalesRecord = {
      date: `2026/${formDate}`,
      month,
      time: formTime || '—',
      customerName: formCustomer,
      partySize: parseInt(formPartySize) || 1,
      subtotal: parseInt(formSubtotal.replace(/,/g, '')) || 0,
      total: parseInt(formTotal.replace(/,/g, '')) || 0,
      drinks: formDrinks,
    };

    // Check for duplicate
    const exists = sales.some(s =>
      s.date === record.date && s.customerName === record.customerName && s.total === record.total
    );
    if (exists) {
      toast.error('同じデータが既に存在します');
      return;
    }

    addSalesRecord(record);
    toast.success('売上データを追加しました');
    setShowAddDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormDate('');
    setFormTime('');
    setFormCustomer('');
    setFormPartySize('1');
    setFormSubtotal('');
    setFormTotal('');
    setFormDrinks('');
  };

  const handleDelete = (date: string, customerName: string) => {
    if (confirm(`${customerName}の${date}のデータを削除しますか？`)) {
      deleteSalesRecord(date, customerName);
      toast.success('削除しました');
    }
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-foreground">売上管理</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gold hover:bg-gold-bright text-background text-xs h-8">
              <Plus className="h-3.5 w-3.5 mr-1" /> 追加
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-gold">売上データ追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">日付 (例: 3/15)</label>
                <Input value={formDate} onChange={e => setFormDate(e.target.value)} placeholder="3/15" className="bg-secondary/50 border-border/50 h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">時間 (例: 20:00〜23:00)</label>
                <Input value={formTime} onChange={e => setFormTime(e.target.value)} placeholder="20:00〜23:00" className="bg-secondary/50 border-border/50 h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">お客様名</label>
                <Input value={formCustomer} onChange={e => setFormCustomer(e.target.value)} placeholder="お客様名" className="bg-secondary/50 border-border/50 h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">人数</label>
                  <Input type="number" value={formPartySize} onChange={e => setFormPartySize(e.target.value)} className="bg-secondary/50 border-border/50 h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">飲み物</label>
                  <Input value={formDrinks} onChange={e => setFormDrinks(e.target.value)} placeholder="シャンパン等" className="bg-secondary/50 border-border/50 h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">小計 (¥)</label>
                  <Input value={formSubtotal} onChange={e => setFormSubtotal(e.target.value)} placeholder="150000" className="bg-secondary/50 border-border/50 h-9 text-sm font-mono" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">総計 (¥)</label>
                  <Input value={formTotal} onChange={e => setFormTotal(e.target.value)} placeholder="180000" className="bg-secondary/50 border-border/50 h-9 text-sm font-mono" />
                </div>
              </div>
              <Button onClick={handleAddSale} className="w-full bg-gold hover:bg-gold-bright text-background">
                追加する
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {availableMonths.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              selectedMonth === m
                ? "bg-gold/20 text-gold border border-gold/30"
                : "bg-secondary/50 text-muted-foreground border border-transparent hover:text-foreground"
            )}
          >
            {m}月
          </button>
        ))}
      </div>

      {/* Monthly Progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-gold" />
              <span className="text-xs text-muted-foreground">{selectedMonth}月 目標進捗（小計ベース）</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-2xl font-semibold">
                ¥{monthStats.subtotal.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/ ¥{monthlyGoal.toLocaleString()}</span>
            </div>
            <Progress value={monthStats.progress} className="h-2 bg-secondary" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>達成率 {monthStats.progress.toFixed(1)}%</span>
              <span>来店 {monthStats.visits}回</span>
              <span>総計 ¥{monthStats.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="list">
        <TabsList className="w-full bg-secondary/50 border border-border/30">
          <TabsTrigger value="list" className="flex-1 text-xs data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
            <Calendar className="h-3.5 w-3.5 mr-1" /> 売上一覧
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex-1 text-xs data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
            <Users className="h-3.5 w-3.5 mr-1" /> 顧客別
          </TabsTrigger>
        </TabsList>

        {/* Sales List */}
        <TabsContent value="list" className="mt-3">
          <ScrollArea className="h-[calc(100vh-480px)]">
            {monthSales.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {selectedMonth}月のデータはありません
              </p>
            ) : (
              <div className="space-y-2">
                {monthSales.map((sale, i) => (
                  <motion.div
                    key={`${sale.date}-${sale.customerName}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="bg-card border-border/20">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{sale.customerName}</span>
                              <span className="text-xs text-muted-foreground">{sale.partySize}名</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {sale.date.replace('2026/', '')} {sale.time}
                            </p>
                            {sale.drinks && (
                              <p className="text-xs text-gold/70 mt-0.5">{sale.drinks}</p>
                            )}
                          </div>
                          <div className="text-right flex items-start gap-2">
                            <div>
                              <p className="font-mono text-sm font-medium">¥{sale.subtotal.toLocaleString()}</p>
                              <p className="font-mono text-xs text-muted-foreground">計 ¥{sale.total.toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => handleDelete(sale.date, sale.customerName)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Customer Breakdown */}
        <TabsContent value="customers" className="mt-3">
          <ScrollArea className="h-[calc(100vh-480px)]">
            {monthStats.customerBreakdown.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                データがありません
              </p>
            ) : (
              <div className="space-y-2">
                {monthStats.customerBreakdown.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="bg-card border-border/20">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">{item.name}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              来店 {item.visits}回
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-medium">¥{item.subtotal.toLocaleString()}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              計 ¥{item.total.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {/* Proportion bar */}
                        <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold/60 rounded-full"
                            style={{ width: `${(item.subtotal / monthStats.subtotal) * 100}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
