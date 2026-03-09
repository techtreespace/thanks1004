import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Check if iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('thanks_install_dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 3 * 24 * 60 * 60 * 1000) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('thanks_install_dismissed', String(Date.now()));
  };

  // Don't show if already installed, dismissed, or no prompt available (and not iOS)
  const shouldShow = !dismissed && (deferredPrompt || isIOS);
  if (!shouldShow) return null;

  return (
    <>
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ delay: 2, type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 left-4 right-4 z-20 max-w-lg mx-auto"
          >
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                backgroundColor: 'hsl(var(--card))',
                boxShadow: 'var(--shadow-float)',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'hsl(var(--primary) / 0.12)' }}
              >
                <Smartphone size={20} style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-foreground">홈 화면에 추가</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">앱처럼 빠르게 열 수 있어요</p>
              </div>
              <button
                onClick={handleInstall}
                className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-body font-semibold active:scale-95 transition-transform"
                style={{
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                }}
              >
                설치
              </button>
              <button
                onClick={handleDismiss}
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS install guide modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'hsl(var(--foreground) / 0.2)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowIOSGuide(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-8 left-4 right-4 z-50 max-w-sm mx-auto rounded-2xl p-6"
              style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-float)' }}
            >
              <h3 className="font-display text-lg text-foreground mb-4">iOS에서 설치하기</h3>
              <ol className="space-y-3 text-sm font-body text-foreground/80">
                <li className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>1</span>
                  <span>Safari 하단의 <strong>공유 버튼</strong> (⬆) 을 탭하세요</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>2</span>
                  <span>스크롤하여 <strong>"홈 화면에 추가"</strong> 를 탭하세요</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>3</span>
                  <span><strong>"추가"</strong> 를 탭하면 완료!</span>
                </li>
              </ol>
              <button
                onClick={() => {
                  setShowIOSGuide(false);
                  handleDismiss();
                }}
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-body font-medium"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                알겠어요
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
