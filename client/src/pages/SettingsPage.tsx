/**
 * SettingsPage - 墨と金箔テーマ
 * 設定：除外リスト管理・データリセット・バージョン情報
 */
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  UserX, Plus, Trash2, Database, AlertTriangle, Info, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { excluded, addExcluded, removeExcluded, dataVersion, customers, sendHistory } = useData();

  const [newExcludedName, setNewExcludedName] = useState('');
  const [newExcludedNickname, setNewExcludedNickname] = useState('');
  const [newExcludedReason, setNewExcludedReason] = useState('');
  const [showAddExcluded, setShowAddExcluded] = useState(false);

  const handleAddExcluded = () => {
    if (!newExcludedName) {
      toast.error('名前を入力してください');
      return;
    }
    addExcluded({
      name: newExcludedName,
      nickname: newExcludedNickname || newExcludedName,
      reason: newExcludedReason || '手動除外',
    });
    toast.success(`${newExcludedName}を除外リストに追加しました`);
    setNewExcludedName('');
    setNewExcludedNickname('');
    setNewExcludedReason('');
    setShowAddExcluded(false);
  };

  const handleRemoveExcluded = (name: string) => {
    if (confirm(`${name}を除外リストから削除しますか？`)) {
      removeExcluded(name);
      toast.success(`${name}を除外リストから削除しました`);
    }
  };

  const handleResetData = () => {
    if (confirm('すべてのローカルデータをリセットしますか？\n（初期データに戻ります）')) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ginza_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      toast.success('データをリセットしました。ページを再読み込みします...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const starCount = customers.filter(c => c.star).length;
  const sentCount = customers.filter(c => c.sendCount > 0).length;

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <h1 className="font-serif text-xl font-semibold text-foreground">設定</h1>

      {/* Stats Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-gold" /> データ概要
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-secondary/30 rounded-lg">
                <p className="font-mono text-lg font-semibold">{customers.length}</p>
                <p className="text-xs text-muted-foreground">総顧客数</p>
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded-lg">
                <p className="font-mono text-lg font-semibold text-gold">{starCount}</p>
                <p className="text-xs text-muted-foreground">VIP顧客</p>
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded-lg">
                <p className="font-mono text-lg font-semibold">{sentCount}</p>
                <p className="text-xs text-muted-foreground">送信済み顧客</p>
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded-lg">
                <p className="font-mono text-lg font-semibold">{sendHistory.length}</p>
                <p className="text-xs text-muted-foreground">送信履歴件数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Excluded List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-gold" /> 除外リスト
              </span>
              <Dialog open={showAddExcluded} onOpenChange={setShowAddExcluded}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-gold">
                    <Plus className="h-3 w-3 mr-1" /> 追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border/50 max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-gold">除外リストに追加</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">お客様名</label>
                      <Input value={newExcludedName} onChange={e => setNewExcludedName(e.target.value)} className="bg-secondary/50 border-border/50 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">呼び名</label>
                      <Input value={newExcludedNickname} onChange={e => setNewExcludedNickname(e.target.value)} className="bg-secondary/50 border-border/50 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">除外理由</label>
                      <Input value={newExcludedReason} onChange={e => setNewExcludedReason(e.target.value)} className="bg-secondary/50 border-border/50 h-9 text-sm" />
                    </div>
                    <Button onClick={handleAddExcluded} className="w-full bg-gold hover:bg-gold-bright text-background">
                      追加する
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {excluded.length === 0 ? (
              <p className="text-sm text-muted-foreground">除外リストは空です</p>
            ) : (
              <div className="space-y-2">
                {excluded.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExcluded(item.name)}
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-gold" /> データ管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              データはブラウザのローカルストレージに保存されています。
              アプリの更新時にデータが自動的にリフレッシュされます。
            </p>
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <RefreshCw className="h-3.5 w-3.5 text-gold shrink-0" />
              <div>
                <p className="text-xs font-medium">自動バージョン管理</p>
                <p className="text-[10px] text-muted-foreground">
                  データ更新時に自動でキャッシュがリセットされます
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <AlertTriangle className="h-3 w-3 mr-1" /> 手動データリセット
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* App info */}
      <div className="text-center pt-4 space-y-1">
        <p className="text-xs text-muted-foreground">粋 CRM v2.0</p>
        <p className="text-xs text-muted-foreground">美山怜子 営業支援システム</p>
        <p className="text-[10px] text-muted-foreground/50">Data: {dataVersion}</p>
      </div>
    </div>
  );
}
