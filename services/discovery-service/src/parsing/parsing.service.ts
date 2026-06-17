import { Injectable } from '@nestjs/common';
import type { FileFormat } from '@unifyos/shared-types';
import { ConsoleLogger } from '@unifyos/shared-utils';
import { LanguageDetectionService } from './language-detection.service';

export interface ParseResult {
  content: string;
  metadata: {
    language: string;
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number;
    tables?: number;
    images?: number;
    links?: number;
  };
}

@Injectable()
export class ParsingService {
  private readonly logger = new ConsoleLogger('ParsingService');

  constructor(private readonly languageDetectionService: LanguageDetectionService) {}

  async parseFile(
    filename: string,
    content: Buffer,
    format: FileFormat
  ): Promise<ParseResult> {
    try {
      let text = '';

      switch (format) {
        case 'TXT':
          text = this.parseTxt(content);
          break;
        case 'PDF':
          text = this.parsePdf(content);
          break;
        case 'JSON':
          text = this.parseJson(content);
          break;
        case 'XML':
          text = this.parseXml(content);
          break;
        case 'HTML':
          text = this.parseHtml(content);
          break;
        case 'CSV':
          text = this.parseCsv(content);
          break;
        default:
          text = this.parseGeneric(content);
      }

      const language = this.languageDetectionService.detectLanguage(text);
      const wordCount = this.countWords(text);
      const characterCount = text.length;
      const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

      return {
        content: text,
        metadata: {
          language,
          wordCount,
          characterCount,
          estimatedReadingTime,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to parse ${filename}`, error as Error);
      throw error;
    }
  }

  private parseTxt(content: Buffer): string {
    return content.toString('utf-8').trim();
  }

  private parsePdf(content: Buffer): string {
    // Simplified PDF parsing - extract text between delimiters
    const text = content.toString('utf-8', 0, Math.min(content.length, 10000));
    return text
      .replace(/[\x00-\x1f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseJson(content: Buffer): string {
    try {
      const json = JSON.parse(content.toString('utf-8'));
      return this.stringifyJson(json);
    } catch {
      return content.toString('utf-8');
    }
  }

  private stringifyJson(obj: unknown, depth: number = 0): string {
    if (depth > 10) return '...';

    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number' || typeof obj === 'boolean')
      return String(obj);
    if (obj === null) return 'null';
    if (Array.isArray(obj)) {
      return obj.map((item) => this.stringifyJson(item, depth + 1)).join('\n');
    }
    if (typeof obj === 'object') {
      return Object.entries(obj)
        .map(
          ([key, value]) =>
            `${key}: ${this.stringifyJson(value, depth + 1)}`
        )
        .join('\n');
    }
    return '';
  }

  private parseXml(content: Buffer): string {
    const text = content.toString('utf-8');
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private parseHtml(content: Buffer): string {
    const text = content.toString('utf-8');
    return text
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseCsv(content: Buffer): string {
    const text = content.toString('utf-8');
    return text
      .split('\n')
      .map((line) => line.split(',').join(' | '))
      .join('\n');
  }

  private parseGeneric(content: Buffer): string {
    return content.toString('utf-8', 0, Math.min(content.length, 10000));
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  async detectFormat(
    filename: string,
    content: Buffer
  ): Promise<FileFormat> {
    // Check file extension first
    const ext = filename.split('.').pop()?.toUpperCase();

    if (ext === 'TXT') return 'TXT';
    if (ext === 'PDF') return 'PDF';
    if (ext === 'JSON') return 'JSON';
    if (ext === 'XML') return 'XML';
    if (ext === 'HTML' || ext === 'HTM') return 'HTML';
    if (ext === 'CSV') return 'CSV';

    // Check magic bytes
    if (content.length >= 4) {
      const magic = content.slice(0, 4).toString('hex');

      if (magic.startsWith('25504446')) return 'PDF'; // %PDF
      if (magic.startsWith('ffd8ff')) return 'IMAGE'; // JPEG
      if (magic.startsWith('89504e47')) return 'IMAGE'; // PNG
      if (magic.startsWith('47494638')) return 'IMAGE'; // GIF
      if (magic.startsWith('504b03')) return 'ARCHIVE'; // ZIP/DOCX/XLSX
      if (magic.startsWith('7b')) return 'JSON'; // {
    }

    return 'UNKNOWN';
  }

  async extractMetadata(
    filename: string,
    content: Buffer,
    format: FileFormat
  ): Promise<Record<string, unknown>> {
    return {
      filename,
      size: content.length,
      format,
      charset: this.detectCharset(content),
      isText: this.isTextFile(format),
      createdAt: new Date(),
    };
  }

  private detectCharset(content: Buffer): string {
    // Check for BOM
    if (
      content.length >= 3 &&
      content[0] === 0xef &&
      content[1] === 0xbb &&
      content[2] === 0xbf
    ) {
      return 'UTF-8-BOM';
    }
    if (content.length >= 2) {
      if (content[0] === 0xff && content[1] === 0xfe)
        return 'UTF-16LE';
      if (content[0] === 0xfe && content[1] === 0xff)
        return 'UTF-16BE';
    }

    // Try UTF-8 validation
    try {
      content.toString('utf-8');
      return 'UTF-8';
    } catch {
      return 'UNKNOWN';
    }
  }

  private isTextFile(format: FileFormat): boolean {
    const textFormats = [
      'TXT',
      'PDF',
      'JSON',
      'XML',
      'HTML',
      'CSV',
      'CODE',
      'EMAIL',
    ];
    return textFormats.includes(format);
  }
}
