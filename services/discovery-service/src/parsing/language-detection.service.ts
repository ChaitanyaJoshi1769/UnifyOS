import { Injectable } from '@nestjs/common';

@Injectable()
export class LanguageDetectionService {
  private readonly languagePatterns: Map<string, RegExp> = new Map();

  constructor() {
    // Common language detection patterns
    this.languagePatterns.set('en', /\b(the|is|and|of|to|in|a|for|that)\b/gi);
    this.languagePatterns.set('es', /\b(el|la|es|y|de|en|un|una|que|para)\b/gi);
    this.languagePatterns.set('fr', /\b(le|la|est|et|de|à|un|une|que|pour)\b/gi);
    this.languagePatterns.set('de', /\b(der|die|das|ist|und|von|in|ein|eine|was)\b/gi);
    this.languagePatterns.set('it', /\b(il|la|è|e|di|a|un|una|che|per)\b/gi);
    this.languagePatterns.set('pt', /\b(o|a|é|e|de|em|um|uma|que|para)\b/gi);
    this.languagePatterns.set('zh', /[一-鿿]+/g);
    this.languagePatterns.set('ja', /[぀-ゟ゠-ヿ]+/g);
    this.languagePatterns.set('ko', /[가-힯]+/g);
    this.languagePatterns.set('ar', /[؀-ۿ]+/g);
  }

  detectLanguage(text: string): string {
    if (!text || text.length < 50) return 'en'; // Default to English for short texts

    const sample = text.slice(0, 500); // Sample first 500 chars
    const scores: Record<string, number> = {};

    for (const [lang, pattern] of this.languagePatterns) {
      const matches = sample.match(pattern) || [];
      scores[lang] = matches.length;
    }

    const detectedLang = Object.entries(scores).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    return detectedLang || 'en';
  }

  getLanguageName(code: string): string {
    const names: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
      ar: 'Arabic',
    };
    return names[code] || 'Unknown';
  }
}
