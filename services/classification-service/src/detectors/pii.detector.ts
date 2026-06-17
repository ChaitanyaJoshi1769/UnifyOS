import { Injectable } from '@nestjs/common';

@Injectable()
export class PiiDetector {
  private keywords: Map<string, string[]> = new Map([
    [
      'NAME',
      [
        'name',
        'full name',
        'first name',
        'last name',
        'given name',
        'surname',
      ],
    ],
    [
      'EMAIL',
      ['email', 'e-mail', 'email address', 'electronic mail'],
    ],
    [
      'PHONE',
      [
        'phone',
        'telephone',
        'mobile',
        'cell phone',
        'phone number',
        'contact number',
      ],
    ],
    [
      'ADDRESS',
      [
        'address',
        'street address',
        'mailing address',
        'home address',
        'office address',
        'street',
        'zip code',
        'postal code',
      ],
    ],
    [
      'SSN',
      ['ssn', 'social security number', 'tax id', 'tin'],
    ],
    [
      'DOB',
      ['date of birth', 'dob', 'birth date', 'birthday'],
    ],
    [
      'DRIVERS_LICENSE',
      [
        "driver's license",
        'drivers license',
        'license number',
        'dl number',
      ],
    ],
    [
      'PASSPORT',
      ['passport', 'passport number'],
    ],
    [
      'CREDIT_CARD',
      [
        'credit card',
        'card number',
        'credit card number',
        'cc number',
      ],
    ],
  ]);

  private sensitiveKeywords: string[] = [
    'password',
    'secret',
    'token',
    'api key',
    'private key',
    'confidential',
    'internal use only',
  ];

  detectPii(text: string): { type: string; confidence: number }[] {
    const detections: { type: string; confidence: number }[] = [];
    const lowerText = text.toLowerCase();

    for (const [type, keywords] of this.keywords) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          detections.push({
            type,
            confidence: 0.7,
          });
          break;
        }
      }
    }

    return detections;
  }

  detectSensitiveContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.sensitiveKeywords.some((keyword) =>
      lowerText.includes(keyword)
    );
  }

  calculateRiskScore(
    text: string,
    detectedEntities: Array<{ type: string; confidence: number }>
  ): number {
    let score = 0;

    // Entity-based risk
    const entityRisk = detectedEntities.reduce(
      (acc, entity) => acc + entity.confidence * 20,
      0
    );
    score += Math.min(entityRisk, 50);

    // Sensitive keyword risk
    if (this.detectSensitiveContent(text)) {
      score += 25;
    }

    // Text length risk (longer documents = more risk)
    const lengthRisk = Math.min((text.length / 1000) * 5, 20);
    score += lengthRisk;

    return Math.min(score, 100);
  }
}
