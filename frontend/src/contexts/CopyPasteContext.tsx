import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Lesson } from '../types';

interface CopyPasteContextType {
  copiedLesson: Lesson | null;
  copyLesson: (lesson: Lesson) => void;
  clearCopiedLesson: () => void;
  hasCopiedLesson: boolean;
}

const CopyPasteContext = createContext<CopyPasteContextType | undefined>(undefined);

interface CopyPasteProviderProps {
  children: ReactNode;
}

export const CopyPasteProvider: React.FC<CopyPasteProviderProps> = ({ children }) => {
  const [copiedLesson, setCopiedLesson] = useState<Lesson | null>(null);

  const copyLesson = useCallback((lesson: Lesson) => {
    setCopiedLesson(lesson);
  }, []);

  const clearCopiedLesson = useCallback(() => {
    setCopiedLesson(null);
  }, []);

  const hasCopiedLesson = copiedLesson !== null;

  const value: CopyPasteContextType = {
    copiedLesson,
    copyLesson,
    clearCopiedLesson,
    hasCopiedLesson,
  };

  return (
    <CopyPasteContext.Provider value={value}>
      {children}
    </CopyPasteContext.Provider>
  );
};

export const useCopyPaste = (): CopyPasteContextType => {
  const context = useContext(CopyPasteContext);
  if (context === undefined) {
    throw new Error('useCopyPaste must be used within a CopyPasteProvider');
  }
  return context;
};
