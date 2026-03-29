/**
 * CustomerDetailPage - 墨と金箔テーマ
 * 顧客カルテ詳細：情報閲覧・メモ編集
 */
import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, MapPin, Briefcase, Calendar, Heart, Wine, Clock, Edit3, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CustomerDetailPage() {
  const [, params] = useRoute('/customers/:id');
  const [, navigate] = useLocation();
  const { customers, updateCustomer, sales } = useData();
  const [editingMemo, setEditingMemo] = useState(false);
  const [memo, setMemo] = useState('');

  const customer = useMemo(() => {
    return customers.find(c => c.id === params?.id);
  }, [customers, params?.id]);

  const customerSales = useMemo(() => {
    if (!customer) return [];
    return sales.filter(s =>
      s.customerName === customer.name ||
      s.customerName === customer.nickname ||
      customer.name.includes(s.customerName) ||
      s.customerName.includes(customer.nickname)
    ).sort((a, b) => b.date.localeCompare(a.date));
  }, [customer, sales]);

  if (!customer) {
    return (
      <div className="px-4 pt-6">
        <Button variant="ghost" onClick={() => navigate('/customers')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> 戻る
        </Button>
        <p className="text-center text-muted-foreground">顧客が見つかりません</p>
      </div>
    );
  }

  const startEditMemo = () => {
    setMemo(customer.customMemo || customer.notes || '');
    setEditingMemo(true);
  };

  const saveMemo = () => {
    updateCustomer(customer.id, { customMemo: memo });
    setEditingMemo(false);
    toast.success('メモを保存しました');
  };

  const infoItems = [
    { icon: Briefcase, label: '職業', value: customer.occupation },
    { icon: MapPin, label: '居住地', value: customer.location },
    { icon: Calendar, label: '誕生日', value: customer.birthday },
    { icon: Heart, label: '家族', value: customer.family },
    { icon: Wine, label: 'お酒', value: customer.drinks },
    { icon: Clock, label: '来店頻度', value: customer.visitFrequency },
  ].filter(item => item.value);

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/customers')} className="text-muted-foreground -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> 顧客一覧
      </Button>

      {/* Customer Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          "bg-card border-border/30",
          customer.star && "border-gold/20"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-lg font-serif shrink-0",
                customer.star
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "bg-secondary text-muted-foreground border border-border/50"
              )}>
                {customer.star ? (
                  <Star className="h-6 w-6 fill-gold text-gold" />
                ) : (
                  customer.nickname?.charAt(0) || customer.name?.charAt(0) || '?'
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-lg font-semibold">{customer.name}</h2>
                  {customer.star && (
                    <Badge className="bg-gold/15 text-gold border-gold/30 text-[10px]">⭐️ VIP</Badge>
                  )}
                  {customer.rank && customer.rank !== '-' && (
                    <Badge variant="outline" className="text-[10px]">ランク {customer.rank}</Badge>
                  )}
                </div>
                {customer.nickname && customer.nickname !== customer.name && (
                  <p className="text-sm text-muted-foreground mt-0.5">呼び名: {customer.nickname}</p>
                )}
                {customer.age && (
                  <p className="text-xs text-muted-foreground mt-1">{customer.age}</p>
                )}
              </div>
            </div>

            {/* Send stats */}
            <div className="flex gap-4 mt-4 pt-3 border-t border-border/30">
              <div>
                <p className="text-xs text-muted-foreground">送信回数</p>
                <p className="font-mono text-sm font-medium">{customer.sendCount}回</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">最終送信</p>
                <p className="font-mono text-sm font-medium">{customer.lastSendDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">最終来店</p>
                <p className="font-mono text-sm font-medium">{customer.lastVisit || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Basic Info */}
      {infoItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {infoItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-gold/70 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hobbies */}
      {customer.hobbies && customer.hobbies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">趣味・関心</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {customer.hobbies.map((hobby, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-secondary/50">
                    {hobby}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Memo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              メモ
              {!editingMemo && (
                <Button variant="ghost" size="sm" onClick={startEditMemo} className="h-7 text-xs text-gold">
                  <Edit3 className="h-3 w-3 mr-1" /> 編集
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingMemo ? (
              <div className="space-y-2">
                <Textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="bg-secondary/50 border-border/50 min-h-[100px] text-sm"
                  placeholder="メモを入力..."
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setEditingMemo(false)}>
                    <X className="h-3 w-3 mr-1" /> キャンセル
                  </Button>
                  <Button size="sm" onClick={saveMemo} className="bg-gold hover:bg-gold-bright text-background">
                    <Save className="h-3 w-3 mr-1" /> 保存
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {customer.customMemo || customer.notes || 'メモなし'}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Sales History */}
      {customerSales.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">来店・売上履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customerSales.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div>
                      <p className="text-sm">{s.date}</p>
                      <p className="text-xs text-muted-foreground">{s.time} / {s.partySize}名</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">¥{s.subtotal.toLocaleString()}</p>
                      <p className="font-mono text-xs text-muted-foreground">計 ¥{s.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Relationship Level */}
      {customer.relationshipLevel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">親密度</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{customer.relationshipLevel}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
