import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Upload, Trash2, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportAllData, importData, clearAllData, loadEntries, loadCategories, ExportData } from '@/lib/storage';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge' | null>(null);
  const [pendingData, setPendingData] = useState<ExportData | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ── Export ──
  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thanks-backup-${data.exportedAt.split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('백업 파일이 다운로드되었어요');
  };

  // ── Import ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        // Validate structure
        if (!raw.entries || !raw.categories) {
          toast.error('올바른 Thanks. 백업 파일이 아닙니다');
          return;
        }
        setPendingData(raw as ExportData);
        setImportMode('replace'); // Show choice modal
      } catch {
        toast.error('파일을 읽을 수 없습니다');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const executeImport = (mode: 'replace' | 'merge') => {
    if (!pendingData) return;

    if (mode === 'replace') {
      importData(pendingData);
      toast.success(`${pendingData.entries.length}개의 기록을 복원했어요`);
    } else {
      // Merge: add non-duplicate entries
      const existing = loadEntries();
      const existingIds = new Set(existing.map((e) => e.id));
      const newEntries = pendingData.entries.filter((e) => !existingIds.has(e.id));
      
      const existingCats = loadCategories();
      const existingCatIds = new Set(existingCats.map((c) => c.id));
      const newCats = pendingData.categories.filter((c) => !existingCatIds.has(c.id));

      importData({
        ...pendingData,
        entries: [...existing, ...newEntries],
        categories: [...existingCats, ...newCats],
      });
      toast.success(`${newEntries.length}개의 새 기록을 추가했어요`);
    }

    setPendingData(null);
    setImportMode(null);
  };

  // ── Clear All ──
  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    toast.success('모든 데이터가 삭제되었어요');
  };

  // Stats
  const entries = loadEntries();
  const categories = loadCategories();

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--gradient-warm)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 py-3 px-4"
        style={{
          backgroundColor: 'hsl(var(--background) / 0.85)',
          backdropFilter: 'blur(16px) saturate(1.5)',
        }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-xl active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="font-display text-lg font-medium text-foreground">설정</h1>
        </div>
      </header>

      <main className="px-4 pb-12 pt-4">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Data overview */}
          <section
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} style={{ color: 'hsl(var(--primary))' }} />
              <h2 className="text-sm font-body font-semibold text-foreground">내 데이터</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--muted) / 0.6)' }}>
                <p className="text-2xl font-display font-medium text-foreground">{entries.length}</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">총 기록</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--muted) / 0.6)' }}>
                <p className="text-2xl font-display font-medium text-foreground">{categories.length}</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">카테고리</p>
              </div>
            </div>
          </section>

          {/* Backup & Restore */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="p-5 pb-3">
              <h2 className="text-sm font-body font-semibold text-foreground mb-1">백업 & 복원</h2>
              <p className="text-xs font-body text-muted-foreground">데이터를 안전하게 보관하세요</p>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-5 py-4 transition-colors active:scale-[0.99]"
              style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'hsl(152 55% 45% / 0.1)' }}
              >
                <Download size={17} style={{ color: 'hsl(152 55% 40%)' }} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-body font-medium text-foreground">데이터 내보내기</p>
                <p className="text-xs font-body text-muted-foreground">JSON 파일로 백업</p>
              </div>
            </button>

            {/* Import */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 px-5 py-4 transition-colors active:scale-[0.99]"
              style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'hsl(220 60% 55% / 0.1)' }}
              >
                <Upload size={17} style={{ color: 'hsl(220 60% 50%)' }} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-body font-medium text-foreground">데이터 가져오기</p>
                <p className="text-xs font-body text-muted-foreground">백업 파일에서 복원</p>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </section>

          {/* Danger zone */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="p-5 pb-3">
              <h2 className="text-sm font-body font-semibold text-destructive">위험 영역</h2>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 transition-colors active:scale-[0.99]"
              style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'hsl(var(--destructive) / 0.1)' }}
              >
                <Trash2 size={17} className="text-destructive" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-body font-medium text-destructive">모든 데이터 삭제</p>
                <p className="text-xs font-body text-muted-foreground">모든 기록과 카테고리를 삭제합니다</p>
              </div>
            </button>
          </section>

          <p className="text-center text-[11px] font-body text-muted-foreground/50 pt-4">
            Thanks. v1.0 · 모든 데이터는 이 기기에만 저장됩니다
          </p>
        </div>
      </main>

      {/* Import mode modal */}
      <AnimatePresence>
        {pendingData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'hsl(var(--foreground) / 0.2)', backdropFilter: 'blur(4px)' }}
              onClick={() => { setPendingData(null); setImportMode(null); }}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-8 left-4 right-4 z-50 max-w-sm mx-auto rounded-2xl p-6"
              style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-float)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Upload size={18} style={{ color: 'hsl(var(--primary))' }} />
                <h3 className="font-display text-lg text-foreground">데이터 가져오기</h3>
              </div>

              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: 'hsl(var(--muted) / 0.6)' }}>
                <p className="text-xs font-body text-muted-foreground">
                  파일: <strong className="text-foreground">{pendingData.entries.length}개 기록</strong>, {pendingData.categories.length}개 카테고리
                </p>
                {pendingData.exportedAt && (
                  <p className="text-xs font-body text-muted-foreground mt-0.5">
                    백업일: {new Date(pendingData.exportedAt).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => executeImport('replace')}
                  className="w-full py-3 rounded-xl text-sm font-body font-medium transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  전체 교체
                  <span className="block text-[11px] font-normal opacity-70 mt-0.5">기존 데이터를 백업으로 교체</span>
                </button>
                <button
                  onClick={() => executeImport('merge')}
                  className="w-full py-3 rounded-xl text-sm font-body font-medium transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'hsl(var(--secondary))',
                    color: 'hsl(var(--secondary-foreground))',
                  }}
                >
                  병합하기
                  <span className="block text-[11px] font-normal opacity-70 mt-0.5">기존 데이터에 새 기록만 추가</span>
                </button>
                <button
                  onClick={() => { setPendingData(null); setImportMode(null); }}
                  className="w-full py-2.5 text-sm font-body text-muted-foreground"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear confirm modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'hsl(var(--foreground) / 0.2)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto rounded-2xl p-6"
              style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-float)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-destructive" />
                <h3 className="font-display text-lg text-foreground">정말 삭제할까요?</h3>
              </div>
              <p className="text-sm font-body text-muted-foreground mb-5">
                모든 기록과 카테고리가 삭제됩니다. 이 작업은 되돌릴 수 없어요. 먼저 백업을 권장합니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-body font-medium"
                  style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
                >
                  취소
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2.5 rounded-xl text-sm font-body font-medium"
                  style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
                >
                  삭제하기
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
