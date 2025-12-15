import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Language } from '@/services/types';

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  disabled?: boolean;
}

const LANGUAGES: { value: Language; label: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript', icon: 'JS' },
  { value: 'python', label: 'Python', icon: 'PY' },
];

export function LanguageSelector({
  language,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  const currentLanguage = LANGUAGES.find((l) => l.value === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          className="gap-2 font-mono"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-xs font-bold text-primary">
            {currentLanguage?.icon}
          </span>
          {currentLanguage?.label}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => onLanguageChange(lang.value)}
            className="gap-2 font-mono"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-xs font-bold text-primary">
              {lang.icon}
            </span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
