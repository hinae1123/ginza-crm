/**
 * LoginPage - 墨と金箔テーマ
 * 銀座の夜景背景 + 和モダンなログインフォーム
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const LOGIN_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663367484481/cPVdpBFg7PV7d2je7mmSB9/ginza-login-bg-KBSoq5gE9ZGyLwLzsiYr8Q.webp';

export default function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Brief delay for feel
    await new Promise(r => setTimeout(r, 400));
    
    if (login(password)) {
      toast.success('ようこそ、怜子さん');
    } else {
      toast.error('パスワードが違います');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-end justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${LOGIN_BG})` }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/70 to-transparent" />

      {/* Login form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm px-6 pb-12 pt-8"
      >
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-semibold tracking-wider text-gold mb-2">
            粋
          </h1>
          <p className="text-sm text-muted-foreground tracking-[0.3em] uppercase">
            CRM — 美山怜子
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/30"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={!password || isLoading}
            className="w-full h-12 bg-gold hover:bg-gold-bright text-background font-medium tracking-wider transition-all duration-300"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full"
              />
            ) : (
              'ログイン'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          銀座 粋 sui. 営業支援システム
        </p>
      </motion.div>
    </div>
  );
}
