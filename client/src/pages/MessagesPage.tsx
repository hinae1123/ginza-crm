/**
 * MessagesPage - 墨と金箔テーマ
 * LINE営業メッセージ生成・送信履歴管理
 * - 顧客選択 → AI生成 → コピー → 送信記録
 * - 一括生成対応
 * - 未送信・長期間未送信の優先表示
 */
import { useState, useMemo, useCallback } from 'react';
import { useData, type Customer } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search, MessageSquare, Copy, Check, Send, Star, Clock,
  AlertCircle, Sparkles, Users, History, Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedMessage {
  customerName: string;
  nickname: string;
  message: string;
  copied: boolean;
  sent: boolean;
}

export default function MessagesPage() {
  const { customers, excluded, sendHistory, addSendHistory, updateSendCount, promptContent, isExcluded } = useData();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  // Filter active customers (not excluded)
  const activeCustomers = useMemo(() => {
    return customers
      .filter(c => !isExcluded(c.name))
      .sort((a, b) => {
        // Priority: unsent first, then long-unsent, then by days since last send
        const aUnsent = a.lastSendDate === '未送信' || a.sendCount === 0;
        const bUnsent = b.lastSendDate === '未送信' || b.sendCount === 0;
        if (aUnsent !== bUnsent) return aUnsent ? -1 : 1;

        const aDays = parseInt(a.daysSinceLastSend) || 0;
        const bDays = parseInt(b.daysSinceLastSend) || 0;
        if (aDays !== bDays) return bDays - aDays;

        if (a.star !== b.star) return a.star ? -1 : 1;
        return a.name.localeCompare(b.name, 'ja');
      });
  }, [customers, isExcluded]);

  const filteredCustomers = useMemo(() => {
    if (!search) return activeCustomers;
    const q = search.toLowerCase();
    return activeCustomers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nickname.toLowerCase().includes(q)
    );
  }, [activeCustomers, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  // AI Message Generation (client-side template-based)
  const generateMessages = useCallback(async () => {
    const selected = customers.filter(c => selectedIds.has(c.id));
    if (selected.length === 0) {
      toast.error('顧客を選択してください');
      return;
    }

    setIsGenerating(true);
    setGeneratedMessages([]);

    // Generate messages one by one with slight delay for UX
    const messages: GeneratedMessage[] = [];

    for (const customer of selected) {
      await new Promise(r => setTimeout(r, 300));

      const message = generateMessageForCustomer(customer, promptContent);
      messages.push({
        customerName: customer.name,
        nickname: customer.nickname || customer.name,
        message,
        copied: false,
        sent: false,
      });

      setGeneratedMessages([...messages]);
    }

    setIsGenerating(false);
    setActiveTab('results');
    toast.success(`${messages.length}件のメッセージを生成しました`);
  }, [selectedIds, customers, promptContent]);

  const copyMessage = (index: number) => {
    const msg = generatedMessages[index];
    navigator.clipboard.writeText(msg.message);
    setGeneratedMessages(prev =>
      prev.map((m, i) => i === index ? { ...m, copied: true } : m)
    );
    toast.success('コピーしました');
    setTimeout(() => {
      setGeneratedMessages(prev =>
        prev.map((m, i) => i === index ? { ...m, copied: false } : m)
      );
    }, 2000);
  };

  const markAsSent = (index: number) => {
    const msg = generatedMessages[index];
    addSendHistory({
      customerName: msg.nickname || msg.customerName,
      message: msg.message,
      sentAt: new Date().toISOString(),
    });
    updateSendCount(msg.customerName);
    setGeneratedMessages(prev =>
      prev.map((m, i) => i === index ? { ...m, sent: true } : m)
    );
    toast.success(`${msg.nickname}への送信を記録しました`);
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-xl font-semibold text-foreground">LINE営業</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-secondary/50 border border-border/30">
          <TabsTrigger value="generate" className="flex-1 text-xs data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> メッセージ生成
          </TabsTrigger>
          <TabsTrigger value="results" className="flex-1 text-xs data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
            <MessageSquare className="h-3.5 w-3.5 mr-1" /> 生成結果
            {generatedMessages.length > 0 && (
              <Badge className="ml-1 h-4 px-1 text-[10px] bg-gold/20 text-gold">{generatedMessages.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 text-xs data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
            <History className="h-3.5 w-3.5 mr-1" /> 送信履歴
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-3 mt-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="顧客を検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-secondary/50 border-border/50 text-sm"
            />
          </div>

          {/* Select all + Generate button */}
          <div className="flex items-center justify-between">
            <button
              onClick={selectAll}
              className="text-xs text-gold hover:underline flex items-center gap-1"
            >
              <Users className="h-3 w-3" />
              {selectedIds.size === filteredCustomers.length ? 'すべて解除' : 'すべて選択'}
            </button>
            <Button
              onClick={generateMessages}
              disabled={selectedIds.size === 0 || isGenerating}
              size="sm"
              className="bg-gold hover:bg-gold-bright text-background text-xs h-8"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1" />
              )}
              {selectedIds.size}名のメッセージ生成
            </Button>
          </div>

          {/* Customer selection list */}
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-1.5">
              {filteredCustomers.map(customer => {
                const isSelected = selectedIds.has(customer.id);
                const isUnsent = customer.lastSendDate === '未送信' || customer.sendCount === 0;
                const days = parseInt(customer.daysSinceLastSend);
                const isLongUnsent = !isNaN(days) && days >= 14;

                return (
                  <div
                    key={customer.id}
                    onClick={() => toggleSelect(customer.id)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "bg-gold/5 border-gold/30"
                        : "bg-card border-border/20 hover:border-border/40"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {customer.star && <Star className="h-3 w-3 text-gold fill-gold" />}
                        <span className="text-sm font-medium truncate">
                          {customer.nickname || customer.name}
                        </span>
                        {isUnsent && (
                          <Badge variant="outline" className="text-[9px] px-1 h-3.5 text-destructive border-destructive/30">
                            未送信
                          </Badge>
                        )}
                        {isLongUnsent && (
                          <Badge variant="outline" className="text-[9px] px-1 h-3.5 text-amber-400 border-amber-400/30">
                            {days}日
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {customer.sendCount > 0 ? `送信${customer.sendCount}回 / 最終: ${customer.lastSendDate}` : '未送信'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-3 mt-3">
          {generatedMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                顧客を選んでメッセージを生成してください
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-260px)]">
              <div className="space-y-3">
                <AnimatePresence>
                  {generatedMessages.map((msg, i) => (
                    <motion.div
                      key={msg.customerName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className={cn(
                        "bg-card border-border/30",
                        msg.sent && "opacity-60"
                      )}>
                        <CardHeader className="pb-1 pt-3 px-3">
                          <CardTitle className="text-sm font-medium flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-gold" />
                              {msg.nickname}
                            </span>
                            {msg.sent && (
                              <Badge className="bg-green-500/15 text-green-400 text-[10px]">
                                <Check className="h-3 w-3 mr-0.5" /> 送信済
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          <div className="bg-secondary/30 rounded-lg p-3 mb-2">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyMessage(i)}
                              className="flex-1 h-8 text-xs border-border/50"
                            >
                              {msg.copied ? (
                                <><Check className="h-3 w-3 mr-1 text-green-400" /> コピー済</>
                              ) : (
                                <><Copy className="h-3 w-3 mr-1" /> コピー</>
                              )}
                            </Button>
                            {!msg.sent && (
                              <Button
                                size="sm"
                                onClick={() => markAsSent(i)}
                                className="flex-1 h-8 text-xs bg-gold hover:bg-gold-bright text-background"
                              >
                                <Send className="h-3 w-3 mr-1" /> 送信済にする
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-3 mt-3">
          {sendHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">送信履歴はまだありません</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-260px)]">
              <div className="space-y-2">
                {sendHistory.map((record, i) => (
                  <Card key={i} className="bg-card border-border/20">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{record.customerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.sentAt).toLocaleDateString('ja-JP', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{record.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Message Generation Logic (template-based, no external API)
// ============================================================
function generateMessageForCustomer(customer: Customer, promptContent: string): string {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;
  const dayOfWeek = now.getDay();

  // Time-based greeting
  let greeting = '';
  if (hour < 12) greeting = 'おはようございます';
  else if (hour < 18) greeting = 'こんにちは';
  else greeting = 'こんばんは';

  const name = customer.nickname || customer.name;

  // Season/weather topics
  const seasonTopics: Record<number, string[]> = {
    1: ['寒い日が続きますね', '新年いかがお過ごしですか', '冬本番ですね'],
    2: ['まだまだ寒いですね', '少しずつ春の気配を感じます', 'バレンタインの季節ですね'],
    3: ['桜の季節が近づいてきましたね', '春めいてきましたね', '年度末でお忙しいですか'],
    4: ['桜が綺麗な季節ですね', '新年度いかがですか', '春爛漫ですね'],
    5: ['気持ちの良い季節になりましたね', '五月晴れが気持ちいいですね', 'GWはいかがでしたか'],
    6: ['梅雨入りしましたね', '紫陽花が綺麗な季節ですね', '蒸し暑くなってきましたね'],
    7: ['暑い日が続きますね', '夏本番ですね', '七夕の季節ですね'],
    8: ['猛暑が続きますね', 'お盆はいかがお過ごしですか', '夏バテされていませんか'],
    9: ['少し涼しくなってきましたね', '秋の気配を感じます', '残暑が厳しいですね'],
    10: ['秋らしくなってきましたね', '食欲の秋ですね', '紅葉が楽しみな季節です'],
    11: ['冬の足音が聞こえてきますね', '紅葉が綺麗ですね', '年末に向けてお忙しいですか'],
    12: ['師走でお忙しいですか', '今年も残りわずかですね', '年末年始のご予定はいかがですか'],
  };

  const topics = seasonTopics[month] || seasonTopics[3];
  const seasonTopic = topics[Math.floor(Math.random() * topics.length)];

  // Hobby-based personalization
  let hobbyLine = '';
  if (customer.hobbies && customer.hobbies.length > 0) {
    const hobby = customer.hobbies[Math.floor(Math.random() * customer.hobbies.length)];
    const hobbyTemplates = [
      `最近${hobby}はいかがですか？`,
      `${hobby}のお話、また聞かせてくださいね`,
      `${hobby}、楽しまれていますか？`,
    ];
    hobbyLine = hobbyTemplates[Math.floor(Math.random() * hobbyTemplates.length)];
  }

  // Closing lines
  const closings = [
    'またお会いできるのを楽しみにしています',
    'お忙しいとは思いますが、お体にお気をつけて',
    'ぜひまた銀座にいらしてくださいね',
    'またゆっくりお話しできたら嬉しいです',
    'お時間ある時にふらっといらしてくださいね',
  ];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  // Weekend special
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
  const weekendLine = isWeekend ? '\n週末、素敵な時間をお過ごしくださいね。' : '';

  // Build message
  const parts = [
    `${name}${customer.star ? 'さま' : 'さん'}、${greeting}！`,
    seasonTopic + '。',
    hobbyLine,
    closing + '。' + weekendLine,
    '\n怜子より',
  ].filter(Boolean);

  return parts.join('\n');
}
