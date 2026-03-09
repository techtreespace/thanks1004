import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ChevronDown, Plus } from 'lucide-react';
import { Category } from '@/types';
import { CategoryBadge } from './CategoryBadge';
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
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeCat = categories.find((c) => c.id === selectedCategory);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    setShowCategoryPicker(false);
    onClose();
  };

  const handleClose = () => {
    setContent('');
    setImageUrl(undefined);
    setShowCategoryPicker(false);
    onClose();
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
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-float overflow-hidden"
            style={{ background: 'hsl(var(--card))', maxWidth: '600px', margin: '0 auto' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'hsl(var(--muted))' }} />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between py-3 mb-4">
                <h2 className="font-display text-lg text-foreground">새 기록</h2>
                <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* Category picker */}
              <div className="mb-4">
                <button
                  onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                  className="flex items-center gap-2 w-full"
                >
                  {activeCat && <CategoryBadge category={activeCat} size="md" />}
                  <ChevronDown
                    size={16}
                    className="text-muted-foreground transition-transform"
                    style={{ transform: showCategoryPicker ? 'rotate(180deg)' : 'none' }}
                  />
                </button>

                <AnimatePresence>
                  {showCategoryPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setShowCategoryPicker(false);
                            }}
                            className={`transition-all rounded-full ${selectedCategory === cat.id ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                          >
                            <CategoryBadge category={cat} size="md" />
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setShowCategoryPicker(false);
                            onAddCategory();
                          }}
                          className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full font-body font-medium border border-dashed transition-colors"
                          style={{
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--muted-foreground))',
                          }}
                        >
                          <Plus size={13} />
                          카테고리 추가
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Text area */}
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘의 마음을 기록하세요..."
                className="w-full resize-none outline-none text-base font-body leading-relaxed bg-transparent text-foreground placeholder:text-muted-foreground min-h-[120px]"
              />

              {/* Photo preview */}
              {imageUrl && (
                <div className="relative mt-2 mb-3">
                  <img src={imageUrl} alt="첨부 사진" className="w-full max-h-40 object-cover rounded-xl" />
                  <button
                    onClick={() => setImageUrl(undefined)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-foreground/60"
                  >
                    <X size={12} className="text-primary-foreground" />
                  </button>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Camera size={17} />
                  <span>사진</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                <button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="px-6 py-2.5 rounded-full text-sm font-body font-medium transition-all disabled:opacity-40"
                  style={{
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  기록하기
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
