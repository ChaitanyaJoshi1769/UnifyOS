import { Injectable } from '@nestjs/common';

export interface PatternMatch {
  type: string;
  value: string;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}

@Injectable()
export class PatternDetector {
  private patterns: Map<
    string,
    { regex: RegExp; confidence: number }
  > = new Map([
    [
      'EMAIL',
      {
        regex:
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        confidence: 0.95,
      },
    ],
    [
      'PHONE',
      {
        regex: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
        confidence: 0.85,
      },
    ],
    [
      'SSN',
      {
        regex: /\b\d{3}-\d{2}-\d{4}\b/g,
        confidence: 0.98,
      },
    ],
    [
      'CC_NUMBER',
      {
        regex:
          /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{13,19}\b/g,
        confidence: 0.85,
      },
    ],
    [
      'IP_ADDRESS',
      {
        regex:
          /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        confidence: 0.9,
      },
    ],
    [
      'URL',
      {
        regex:
          /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)/g,
        confidence: 0.9,
      },
    ],
    [
      'DATE',
      {
        regex:
          /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/g,
        confidence: 0.8,
      },
    ],
    [
      'PASSPORT',
      {
        regex: /[A-Z]{1,2}[0-9]{6,9}/g,
        confidence: 0.75,
      },
    ],
  ]);

  detect(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];

    for (const [type, { regex, confidence }] of this.patterns) {
      let match;
      const regexCopy = new RegExp(regex.source, 'g');

      while ((match = regexCopy.exec(text)) !== null) {
        matches.push({
          type,
          value: match[0],
          confidence,
          position: {
            start: match.index,
            end: match.index + match[0].length,
          },
        });
      }
    }

    return matches.sort((a, b) => a.position.start - b.position.start);
  }

  detectType(type: string, text: string): PatternMatch[] {
    const pattern = this.patterns.get(type);
    if (!pattern) return [];

    const matches: PatternMatch[] = [];
    let match;
    const regexCopy = new RegExp(pattern.regex.source, 'g');

    while ((match = regexCopy.exec(text)) !== null) {
      matches.push({
        type,
        value: match[0],
        confidence: pattern.confidence,
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
      });
    }

    return matches;
  }

  getAvailablePatterns(): string[] {
    return Array.from(this.patterns.keys());
  }
}
