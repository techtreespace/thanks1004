import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, emoji: string, color: string) => void;
  presetEmojis: string[];
  presetColors: string[];
}

export function AddCategoryModal({ open, onClose, onSubmit, presetEmojis, presetColors }: AddCategoryModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(presetEmojis[0]);
  const [color, setColor] = useState(presetColors[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim(), emoji, color);
    setName('');
    setEmoji(presetEmojis[0]);
    setColor(presetColors[0]);
    onClose();
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl p-6 shadow-float max-w-sm mx-auto"
            style={{ backgroundColor: 'hsl(var(--card))' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg text-foreground">{t('addCategory.title')}</h3>
              <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2 mb-5 p-3 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted))' }}>
              <span className="text-2xl">{emoji}</span>
              <span
                className="text-sm font-body font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `hsl(${color} / 0.15)`,
                  color: `hsl(${color})`,
                }}
              >
                {name || t('addCategory.namePlaceholder')}
              </span>
            </div>

            {/* Emoji picker */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-body mb-2">{t('addCategory.emojiLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {presetEmojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${emoji === e ? 'ring-2 ring-primary' : 'hover:bg-muted'}`}
                    style={emoji === e ? { backgroundColor: 'hsl(var(--primary) / 0.1)' } : {}}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="mb-5">
              <p className="text-xs text-muted-foreground font-body mb-2">{t('addCategory.colorLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-foreground/30 scale-110' : ''}`}
                    style={{ backgroundColor: `hsl(${c})` }}
                  />
                ))}
              </div>
            </div>

            {/* Name input */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={t('addCategory.namePlaceholder')}
              maxLength={12}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-body outline-none border transition-colors mb-4"
              style={{
                backgroundColor: 'hsl(var(--muted))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl text-sm font-body font-medium transition-all disabled:opacity-40"
              style={{
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
              }}
            >
              {t('addCategory.submit')}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
