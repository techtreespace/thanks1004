import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Locale = 'ko' | 'en';

const STORAGE_KEY = 'thanks_locale';

// ── Translation dictionary ──

const translations = {
  // Navigation / Views
  'nav.today': { ko: '오늘', en: 'Today' },
  'nav.yesterdayToday': { ko: '어제·오늘', en: 'Yesterday·Today' },
  'nav.todayTomorrow': { ko: '오늘·내일', en: 'Today·Tomorrow' },
  'nav.weekly': { ko: '주간', en: 'Week' },
  'nav.monthly': { ko: '월간', en: 'Month' },
  'nav.stats': { ko: '통계', en: 'Stats' },

  // Greetings
  'greeting.night': { ko: '고요한 밤', en: 'Quiet night' },
  'greeting.morning': { ko: '좋은 아침', en: 'Good morning' },
  'greeting.afternoon': { ko: '따뜻한 오후', en: 'Good afternoon' },
  'greeting.evening': { ko: '편안한 저녁', en: 'Good evening' },

  // Day labels
  'day.sun': { ko: '일', en: 'S' },
  'day.mon': { ko: '월', en: 'M' },
  'day.tue': { ko: '화', en: 'T' },
  'day.wed': { ko: '수', en: 'W' },
  'day.thu': { ko: '목', en: 'T' },
  'day.fri': { ko: '금', en: 'F' },
  'day.sat': { ko: '토', en: 'S' },

  // Empty state
  'empty.noEntries': { ko: '아직 기록이 없어요', en: 'No entries yet' },
  'empty.tapToStart': { ko: '+ 버튼을 눌러 시작하세요', en: 'Tap + to get started' },
  'empty.noEntriesDay': { ko: '이 날의 기록이 없어요', en: 'No entries for this day' },

  // Entry card
  'entry.answered': { ko: '응답됨', en: 'Answered' },
  'entry.stillPraying': { ko: '계속 기도 중', en: 'Still praying' },
  'entry.answeredSameDay': { ko: '같은 날 응답됨', en: 'Answered same day' },
  'entry.answeredInDays': { ko: '{n}일 만에 응답됨', en: 'Answered in {n} days' },
  'entry.markAnswered': { ko: '🙏 응답 표시', en: '🙏 Mark answered' },
  'entry.markAsAnswered': { ko: '✨ 응답됨으로 표시', en: '✨ Mark as answered' },
  'entry.delete': { ko: '삭제', en: 'Delete' },
  'entry.confirm': { ko: '확인', en: 'Confirm' },
  'entry.photo': { ko: '기록 사진', en: 'Entry photo' },

  // Add entry modal
  'addEntry.placeholder': { ko: '오늘의 마음을 기록하세요...', en: 'Write your thoughts...' },
  'addEntry.photo': { ko: '사진', en: 'Photo' },
  'addEntry.submit': { ko: '기록', en: 'Save' },
  'addEntry.attachedPhoto': { ko: '첨부 사진', en: 'Attached photo' },
  'addEntry.addCategory': { ko: '추가', en: 'Add' },

  // Add category modal
  'addCategory.title': { ko: '카테고리 추가', en: 'Add Category' },
  'addCategory.namePlaceholder': { ko: '카테고리 이름', en: 'Category name' },
  'addCategory.emojiLabel': { ko: '이모지 선택', en: 'Choose emoji' },
  'addCategory.colorLabel': { ko: '색상 선택', en: 'Choose color' },
  'addCategory.submit': { ko: '추가하기', en: 'Add' },

  // Stats
  'stats.totalEntries': { ko: '전체 기록', en: 'Total entries' },
  'stats.last7': { ko: '최근 7일', en: 'Last 7 days' },
  'stats.last30': { ko: '최근 30일', en: 'Last 30 days' },
  'stats.allTime': { ko: '전체', en: 'All time' },
  'stats.range7': { ko: '7일', en: '7d' },
  'stats.range30': { ko: '30일', en: '30d' },
  'stats.rangeAll': { ko: '전체', en: 'All' },
  'stats.byCategory': { ko: '카테고리별', en: 'By category' },
  'stats.prayerStats': { ko: '기도 통계', en: 'Prayer stats' },
  'stats.responseRate': { ko: '응답률', en: 'Response rate' },
  'stats.answered': { ko: '응답됨', en: 'Answered' },
  'stats.praying': { ko: '기도 중', en: 'Praying' },
  'stats.avgResponse': { ko: '평균 응답', en: 'Avg. response' },
  'stats.entries': { ko: '기록', en: 'entries' },
  'stats.unit': { ko: '개', en: '' },
  'stats.days': { ko: '일', en: 'd' },

  // Monthly calendar
  'calendar.yearMonth': { ko: '{y}년 {m}월', en: '{month} {y}' },
  'calendar.entryCount': { ko: '{n}개', en: '{n}' },

  // Weekly view
  'weekly.dateRange': { ko: '{sm}월 {sd}일 – {em}월 {ed}일', en: '{sm}/{sd} – {em}/{ed}' },

  // Settings
  'settings.title': { ko: '설정', en: 'Settings' },
  'settings.myData': { ko: '내 데이터', en: 'My Data' },
  'settings.totalEntries': { ko: '총 기록', en: 'Total entries' },
  'settings.categories': { ko: '카테고리', en: 'Categories' },
  'settings.backupRestore': { ko: '백업 & 복원', en: 'Backup & Restore' },
  'settings.keepSafe': { ko: '데이터를 안전하게 보관하세요', en: 'Keep your data safe' },
  'settings.export': { ko: '데이터 내보내기', en: 'Export data' },
  'settings.exportDesc': { ko: 'JSON 파일로 백업', en: 'Backup as JSON file' },
  'settings.import': { ko: '데이터 가져오기', en: 'Import data' },
  'settings.importDesc': { ko: '백업 파일에서 복원', en: 'Restore from backup file' },
  'settings.dangerZone': { ko: '위험 영역', en: 'Danger zone' },
  'settings.clearAll': { ko: '모든 데이터 삭제', en: 'Delete all data' },
  'settings.clearAllDesc': { ko: '모든 기록과 카테고리를 삭제합니다', en: 'Delete all entries and categories' },
  'settings.footer': { ko: '모든 데이터는 이 기기에만 저장됩니다', en: 'All data is stored on this device only' },
  'settings.language': { ko: '언어', en: 'Language' },
  'settings.languageDesc': { ko: '앱 표시 언어를 선택하세요', en: 'Choose display language' },

  // Settings - import modal
  'import.title': { ko: '데이터 가져오기', en: 'Import data' },
  'import.fileInfo': { ko: '파일: {n}개 기록', en: 'File: {n} entries' },
  'import.categoriesCount': { ko: '{n}개 카테고리', en: '{n} categories' },
  'import.backupDate': { ko: '백업일', en: 'Backup date' },
  'import.replace': { ko: '전체 교체', en: 'Replace all' },
  'import.replaceDesc': { ko: '기존 데이터를 백업으로 교체', en: 'Replace existing data with backup' },
  'import.merge': { ko: '병합하기', en: 'Merge' },
  'import.mergeDesc': { ko: '기존 데이터에 새 기록만 추가', en: 'Add only new records to existing data' },
  'import.cancel': { ko: '취소', en: 'Cancel' },

  // Settings - clear modal
  'clear.title': { ko: '정말 삭제할까요?', en: 'Delete everything?' },
  'clear.message': { ko: '모든 기록과 카테고리가 삭제됩니다. 이 작업은 되돌릴 수 없어요. 먼저 백업을 권장합니다.', en: 'All entries and categories will be deleted. This cannot be undone. We recommend backing up first.' },
  'clear.cancel': { ko: '취소', en: 'Cancel' },
  'clear.confirm': { ko: '삭제하기', en: 'Delete' },

  // Toasts
  'toast.exported': { ko: '백업 파일이 다운로드되었어요', en: 'Backup file downloaded' },
  'toast.importedReplace': { ko: '{n}개의 기록을 복원했어요', en: 'Restored {n} entries' },
  'toast.importedMerge': { ko: '{n}개의 새 기록을 추가했어요', en: 'Added {n} new entries' },
  'toast.invalidFile': { ko: '올바른 Thanks. 백업 파일이 아닙니다', en: 'Not a valid Thanks. backup file' },
  'toast.fileError': { ko: '파일을 읽을 수 없습니다', en: 'Could not read file' },
  'toast.cleared': { ko: '모든 데이터가 삭제되었어요', en: 'All data deleted' },

  // Install prompt
  'install.addToHome': { ko: '홈 화면에 추가', en: 'Add to Home Screen' },
  'install.openQuickly': { ko: '앱처럼 빠르게 열 수 있어요', en: 'Open quickly like an app' },
  'install.button': { ko: '설치', en: 'Install' },
  'install.iosTitle': { ko: 'iOS에서 설치하기', en: 'Install on iOS' },
  'install.iosStep1': { ko: 'Safari 하단의 <strong>공유 버튼</strong> (⬆) 을 탭하세요', en: 'Tap the <strong>Share button</strong> (⬆) at the bottom of Safari' },
  'install.iosStep2': { ko: '스크롤하여 <strong>"홈 화면에 추가"</strong> 를 탭하세요', en: 'Scroll and tap <strong>"Add to Home Screen"</strong>' },
  'install.iosStep3': { ko: '<strong>"추가"</strong> 를 탭하면 완료!', en: 'Tap <strong>"Add"</strong> and you\'re done!' },
  'install.iosOk': { ko: '알겠어요', en: 'Got it' },

  // Date display
  'date.today': { ko: '오늘', en: 'Today' },
  'date.yesterday': { ko: '어제', en: 'Yesterday' },
  'date.tomorrow': { ko: '내일', en: 'Tomorrow' },

  // FAB
  'fab.add': { ko: '새 기록 추가', en: 'Add new entry' },
  'settings.ariaLabel': { ko: '설정', en: 'Settings' },
} as const;

export type TranslationKey = keyof typeof translations;

// ── Month names for English ──
const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Context ──

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatDisplayDate: (dateStr: string) => string;
  formatMonthYear: (year: number, month: number) => string;
  weekdayShort: (dateStr: string) => string;
  dateLocale: string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem(STORAGE_KEY) as Locale) || 'ko';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const entry = translations[key];
    if (!entry) return key;
    let text = entry[locale] ?? entry.ko;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, String(v));
      });
    }
    return text;
  }, [locale]);

  const formatDisplayDate = useCallback((dateStr: string): string => {
    const today = new Date();
    const todayS = today.toISOString().split('T')[0];
    const yd = new Date(today); yd.setDate(yd.getDate() - 1);
    const tm = new Date(today); tm.setDate(tm.getDate() + 1);

    if (dateStr === todayS) return t('date.today');
    if (dateStr === yd.toISOString().split('T')[0]) return t('date.yesterday');
    if (dateStr === tm.toISOString().split('T')[0]) return t('date.tomorrow');

    const d = new Date(dateStr);
    if (locale === 'en') return `${MONTH_NAMES_EN[d.getMonth()]} ${d.getDate()}`;
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }, [locale, t]);

  const formatMonthYear = useCallback((year: number, month: number): string => {
    if (locale === 'en') return `${MONTH_NAMES_EN[month - 1]} ${year}`;
    return `${year}년 ${month}월`;
  }, [locale]);

  const weekdayShort = useCallback((dateStr: string): string => {
    const d = new Date(dateStr);
    if (locale === 'en') return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('ko-KR', { weekday: 'short' });
  }, [locale]);

  const dateLocale = locale === 'en' ? 'en-US' : 'ko-KR';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatDisplayDate, formatMonthYear, weekdayShort, dateLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
