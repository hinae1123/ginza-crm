/**
 * CustomersPage - 墨と金箔テーマ
 * 顧客一覧：検索・フィルター・⭐️表示
 */
import { useState, useMemo } from 'react';
import { useData, type Customer } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Search, Star, Filter, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type FilterType = 'all' | 'star' | 'karte' | 'unsent';

export default function CustomersPage() {
  const { customers, isExcluded } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    let list = [...customers];

    // Apply filter
    switch (filter) {
      case 'star':
        list = list.filter(c => c.star);
        break;
      case 'karte':
        list = list.filter(c => c.hasKarte && c.rawContent);
        break;
      case 'unsent':
        list = list.filter(c => c.lastSendDate === '未送信' || c.sendCount === 0);
        break;
    }

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.nickname.toLowerCase().includes(q) ||
        c.occupation?.toLowerCase().includes(q) ||
        c.rank?.toLowerCase().includes(q)
      );
    }

    // Sort: stars first, then by rank (S > A > B), then by name
    const rankOrder: Record<string, number> = { 'S': 0, 'A': 1, 'B': 2, '-': 3 };
    list.sort((a, b) => {
      if (a.star !== b.star) return a.star ? -1 : 1;
      const ra = rankOrder[a.rank] ?? 3;
      const rb = rankOrder[b.rank] ?? 3;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name, 'ja');
    });

    return list;
  }, [customers, search, filter]);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'すべて', count: customers.length },
    { key: 'star', label: '⭐️', count: customers.filter(c => c.star).length },
    { key: 'karte', label: 'カルテ有', count: customers.filter(c => c.hasKarte && c.rawContent).length },
    { key: 'unsent', label: '未送信', count: customers.filter(c => c.lastSendDate === '未送信' || c.sendCount === 0).length },
  ];

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-xl font-semibold text-foreground">顧客一覧</h1>
        <span className="text-xs text-muted-foreground">{filtered.length}名</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="名前・呼び名・職業で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-secondary/50 border-border/50 text-sm"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              filter === f.key
                ? "bg-gold/20 text-gold border border-gold/30"
                : "bg-secondary/50 text-muted-foreground border border-transparent hover:text-foreground"
            )}
          >
            {f.key === 'star' && <Star className="h-3 w-3" />}
            {f.key === 'unsent' && <Filter className="h-3 w-3" />}
            {f.label}
            <span className="opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Customer List */}
      <div className="space-y-2">
        {filtered.map((customer, i) => (
          <CustomerCard key={customer.id} customer={customer} index={i} isExcluded={isExcluded(customer.name)} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            該当する顧客が見つかりません
          </p>
        )}
      </div>
    </div>
  );
}

function CustomerCard({ customer, index, isExcluded: excluded }: { customer: Customer; index: number; isExcluded: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link href={`/customers/${customer.id}`}>
        <Card className={cn(
          "bg-card border-border/30 hover:border-gold/20 transition-all cursor-pointer",
          customer.star && "border-gold/20 bg-gradient-to-r from-card to-gold/[0.03]",
          excluded && "opacity-50"
        )}>
          <CardContent className="p-3 flex items-center gap-3">
            {/* Avatar / Star indicator */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-serif shrink-0",
              customer.star
                ? "bg-gold/15 text-gold border border-gold/30"
                : "bg-secondary text-muted-foreground border border-border/50"
            )}>
              {customer.star ? (
                <Star className="h-4 w-4 fill-gold text-gold" />
              ) : (
                customer.nickname?.charAt(0) || customer.name?.charAt(0) || '?'
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {customer.nickname || customer.name}
                </span>
                {customer.rank && customer.rank !== '-' && (
                  <Badge variant="outline" className={cn(
                    "text-[10px] px-1.5 py-0 h-4 border-border/50",
                    customer.rank === 'S' && "text-gold border-gold/30",
                    customer.rank === 'A' && "text-chart-1 border-chart-1/30",
                    customer.rank === 'B' && "text-muted-foreground"
                  )}>
                    {customer.rank}
                  </Badge>
                )}
                {excluded && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-destructive border-destructive/30">
                    除外
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {customer.occupation && (
                  <span className="text-xs text-muted-foreground truncate">{customer.occupation}</span>
                )}
                {customer.sendCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    送信{customer.sendCount}回
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
