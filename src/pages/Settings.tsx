import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Upload, Trash2, AlertTriangle, CheckCircle2, Shield, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportAllData, importData, clearAllData, loadEntries, loadCategories, ExportData } from '@/lib/storage';
import { toast } from 'sonner';
import { useI18n, Locale } from '@/lib/i18n';

const Settings = () => {
  const navigate = useNavigate();
  const { t, locale, setLocale, dateLocale } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge' | null>(null);
  const [pendingData, setPendingData] = useState<ExportData | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
    toast.success(t('toast.exported'));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        if (!raw.entries || !raw.categories) {
          toast.error(t('toast.invalidFile'));
          return;
        }
        setPendingData(raw as ExportData);
        setImportMode('replace');
      } catch {
        toast.error(t('toast.fileError'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const executeImport = (mode: 'replace' | 'merge') => {
    if (!pendingData) return;

    if (mode === 'replace') {
      importData(pendingData);
      toast.success(t('toast.importedReplace', { n: pendingData.entries.length }));
    } else {
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
      toast.success(t('toast.importedMerge', { n: newEntries.length }));
    }

    setPendingData(null);
    setImportMode(null);
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    toast.success(t('toast.cleared'));
  };

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
          <h1 className="font-display text-lg font-medium text-foreground">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="px-4 pb-12 pt-4">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Language */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="p-5 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={16} style={{ color: 'hsl(var(--primary))' }} />
                <h2 className="text-sm font-body font-semibold text-foreground">{t('settings.language')}</h2>
              </div>
              <p className="text-xs font-body text-muted-foreground">{t('settings.languageDesc')}</p>
            </div>
            <div className="px-5 pb-4 flex gap-2">
              {([
                { key: 'ko' as Locale, label: '한국어' },
                { key: 'en' as Locale, label: 'English' },
              ]).map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => setLocale(lang.key)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-body font-medium transition-all"
                  style={{
                    backgroundColor: locale === lang.key ? 'hsl(var(--primary))' : 'hsl(var(--muted) / 0.6)',
                    color: locale === lang.key ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </section>

          {/* Data overview */}
          <section
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} style={{ color: 'hsl(var(--primary))' }} />
              <h2 className="text-sm font-body font-semibold text-foreground">{t('settings.myData')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--muted) / 0.6)' }}>
                <p className="text-2xl font-display font-medium text-foreground">{entries.length}</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">{t('settings.totalEntries')}</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--muted) / 0.6)' }}>
                <p className="text-2xl font-display font-medium text-foreground">{categories.length}</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">{t('settings.categories')}</p>
              </div>
            </div>
          </section>

          {/* Backup & Restore */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="p-5 pb-3">
              <h2 className="text-sm font-body font-semibold text-foreground mb-1">{t('settings.backupRestore')}</h2>
              <p className="text-xs font-body text-muted-foreground">{t('settings.keepSafe')}</p>
            </div>

            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-5 py-4 transition-colors active:scale-[0.99]"
              style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'hsl(152 55% 45% / 0.1)' }}>
                <Download size={17} style={{ color: 'hsl(152 55% 40%)' }} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-body font-medium text-foreground">{t('settings.export')}</p>
                <p className="text-xs font-body text-muted-foreground">{t('settings.exportDesc')}</p>
              </div>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 px-5 py-4 transition-colors active:scale-[0.99]"
              style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'hsl(220 60% 55% / 0.1)' }}>
                <Upload size={17} style={{ color: 'hsl(220 60% 50%)' }} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-body font-medium text-foreground">{t('settings.import')}</p>
                <p className="text-xs font-body text-muted-foreground">{t('settings.importDesc')}</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileSelect} />
          </section>

          {/* Danger zone */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="p-5 pb-3">
              <h2 className="text-sm font-body font-semibold text-destructive">{t('settings.dangerZone')}</h2>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 transition-colors active:scale-[0.99]"
              style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'hsl(var(--destructive) / 0.1)' }}>
                <Trash2 size={17} className="text-destructive" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-body font-medium text-destructive">{t('settings.clearAll')}</p>
                <p className="text-xs font-body text-muted-foreground">{t('settings.clearAllDesc')}</p>
              </div>
            </button>
          </section>

          <p className="text-center text-[11px] font-body text-muted-foreground/50 pt-4">
            Thanks. v1.0 · {t('settings.footer')}
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
                <h3 className="font-display text-lg text-foreground">{t('import.title')}</h3>
              </div>

              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: 'hsl(var(--muted) / 0.6)' }}>
                <p className="text-xs font-body text-muted-foreground">
                  {t('import.fileInfo', { n: pendingData.entries.length })}, {t('import.categoriesCount', { n: pendingData.categories.length })}
                </p>
                {pendingData.exportedAt && (
                  <p className="text-xs font-body text-muted-foreground mt-0.5">
                    {t('import.backupDate')}: {new Date(pendingData.exportedAt).toLocaleDateString(dateLocale)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => executeImport('replace')}
                  className="w-full py-3 rounded-xl text-sm font-body font-medium transition-all active:scale-[0.98]"
                  style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >
                  {t('import.replace')}
                  <span className="block text-[11px] font-normal opacity-70 mt-0.5">{t('import.replaceDesc')}</span>
                </button>
                <button
                  onClick={() => executeImport('merge')}
                  className="w-full py-3 rounded-xl text-sm font-body font-medium transition-all active:scale-[0.98]"
                  style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
                >
                  {t('import.merge')}
                  <span className="block text-[11px] font-normal opacity-70 mt-0.5">{t('import.mergeDesc')}</span>
                </button>
                <button
                  onClick={() => { setPendingData(null); setImportMode(null); }}
                  className="w-full py-2.5 text-sm font-body text-muted-foreground"
                >
                  {t('import.cancel')}
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
                <h3 className="font-display text-lg text-foreground">{t('clear.title')}</h3>
              </div>
              <p className="text-sm font-body text-muted-foreground mb-5">{t('clear.message')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-body font-medium"
                  style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
                >
                  {t('clear.cancel')}
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2.5 rounded-xl text-sm font-body font-medium"
                  style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
                >
                  {t('clear.confirm')}
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
