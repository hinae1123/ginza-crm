/**
 * SettingsPage - 墨と金箔テーマ
 * 設定：パスワード変更・除外リスト管理・データリセット・ログアウト
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData, type ExcludedCustomer } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Lock, LogOut, UserX, Plus, Trash2, Shield, Database, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { changePassword, logout } = useAuth();
  const { excluded, addExcluded, removeExcluded } = useData();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [newExcludedName, setNewExcludedName] = useState('');
  const [newExcludedNickname, setNewExcludedNickname] = useState('');
  const [newExcludedReason, setNewExcludedReason] = useState('');
  const [showAddExcluded, setShowAddExcluded] = useState(false);

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      toast.error('パスワードを入力してください');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('新しいパスワードが一致しません');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('パスワードは4文字以上にしてください');
      return;
    }
    if (changePassword(oldPassword, newPassword)) {
      toast.success('パスワードを変更しました');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('現在のパスワードが違います');
    }
  };

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
      localStorage.removeItem('ginza_customers');
      localStorage.removeItem('ginza_sales');
      localStorage.removeItem('ginza_excluded');
      localStorage.removeItem('ginza_send_history');
      toast.success('データをリセットしました。ページを再読み込みします...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('ログアウトしました');
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <h1 className="font-serif text-xl font-semibold text-foreground">設定</h1>

      {/* Password Change */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-gold" /> パスワード変更
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="現在のパスワード"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="bg-secondary/50 border-border/50 h-9 text-sm"
            />
            <Input
              type="password"
              placeholder="新しいパスワード"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="bg-secondary/50 border-border/50 h-9 text-sm"
            />
            <Input
              type="password"
              placeholder="新しいパスワード（確認）"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="bg-secondary/50 border-border/50 h-9 text-sm"
            />
            <Button
              onClick={handleChangePassword}
              size="sm"
              className="bg-gold hover:bg-gold-bright text-background text-xs"
            >
              変更する
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Excluded List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-gold" /> データ管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              データはブラウザのローカルストレージに保存されています。
              リセットすると初期データに戻ります。
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <AlertTriangle className="h-3 w-3 mr-1" /> データリセット
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-border/30 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" /> ログアウト
        </Button>
      </motion.div>

      {/* App info */}
      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground">粋 CRM v1.0</p>
        <p className="text-xs text-muted-foreground">美山怜子 営業支援システム</p>
      </div>
    </div>
  );
}
