import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Plus, Send } from 'lucide-react';
import { Category } from '@/types';
import { AddEntryData } from '@/hooks/useEntries';

interface AddEntryModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: AddEntryData) => void;
  defaultDate: string;
  onAddCategory: () => void;
}

export function AddEntryModal({
  open,
  onClose,
  categories,
  onSubmit,
  defaultDate,
  onAddCategory,
}: AddEntryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? '');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset & focus on open
  useEffect(() => {
    if (open) {
      setSelectedCategory(categories[0]?.id ?? '');
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [open, categories]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compress for localStorage
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({
      categoryId: selectedCategory,
      content: content.trim(),
      imageUrl,
      recordDate: defaultDate,
    });
    setContent('');
    setImageUrl(undefined);
    onClose();
  };

  const handleClose = () => {
    setContent('');
    setImageUrl(undefined);
    onClose();
  };

  // Submit on Cmd/Ctrl+Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'hsl(var(--foreground) / 0.18)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden"
            style={{
              background: 'hsl(var(--card))',
              maxWidth: '600px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-float)',
              maxHeight: '85vh',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'hsl(var(--border))' }} />
            </div>

            <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 24px)' }}>
              {/* Category horizontal scroll (always visible) */}
              <div className="flex gap-2 overflow-x-auto pb-4 pt-1 scrollbar-none -mx-1 px-1">
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-body font-medium transition-all active:scale-95"
                      style={{
                        backgroundColor: active
                          ? `hsl(${cat.color} / 0.18)`
                          : 'hsl(var(--muted) / 0.6)',
                        color: active ? `hsl(${cat.color})` : 'hsl(var(--muted-foreground))',
                        border: active
                          ? `1.5px solid hsl(${cat.color} / 0.35)`
                          : '1.5px solid transparent',
                      }}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
                <button
                  onClick={onAddCategory}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-2xl text-sm font-body border border-dashed transition-colors active:scale-95"
                  style={{
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  <Plus size={14} />
                  <span>추가</span>
                </button>
              </div>

              {/* Text input */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="오늘의 마음을 기록하세요..."
                rows={4}
                className="w-full resize-none outline-none text-[15px] font-body leading-[1.7] bg-transparent text-foreground placeholder:text-muted-foreground/60"
                style={{ minHeight: '100px' }}
              />

              {/* Photo preview */}
              <AnimatePresence>
                {imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative mb-3 overflow-hidden"
                  >
                    <img src={imageUrl} alt="첨부 사진" className="w-full max-h-36 object-cover rounded-2xl" />
                    <button
                      onClick={() => setImageUrl(undefined)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'hsl(var(--foreground) / 0.5)' }}
                    >
                      <X size={12} className="text-primary-foreground" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'hsl(var(--border) / 0.6)' }}>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body transition-colors active:scale-95"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    <Camera size={18} />
                    <span>사진</span>
                  </button>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                <button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-body font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:scale-100"
                  style={{
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  <Send size={14} />
                  <span>기록</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
