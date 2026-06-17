import { Injectable } from '@nestjs/common';
import type {
  ClassificationResult,
  DataClassification,
  EntityId,
  SensitivityLevel,
  DetectedEntity,
} from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';
import { PiiDetector } from './detectors/pii.detector';
import { PatternDetector } from './detectors/pattern.detector';

@Injectable()
export class ClassificationService {
  private readonly logger = new ConsoleLogger('ClassificationService');
  private results: Map<EntityId, ClassificationResult> = new Map();

  constructor(
    private readonly piiDetector: PiiDetector,
    private readonly patternDetector: PatternDetector
  ) {}

  async classifyDocument(
    documentId: EntityId,
    content: string,
    tenantId: EntityId
  ): Promise<ClassificationResult> {
    this.logger.info(`Classifying document: ${documentId}`);

    // Detect patterns and entities
    const detectedPatterns = this.patternDetector.detect(content);
    const piiDetections = this.piiDetector.detectPii(content);
    const hasSensitiveKeywords =
      this.piiDetector.detectSensitiveContent(content);

    // Convert patterns to detected entities
    const detectedEntities: DetectedEntity[] = detectedPatterns.map((p) => ({
      type: p.type,
      value: p.value,
      confidence: p.confidence,
      position: p.position,
      shouldRedact: this.shouldRedact(p.type),
    }));

    // Determine classifications
    const classifications = this.determineClassifications(
      content,
      detectedPatterns,
      piiDetections
    );

    // Determine sensitivity level
    const sensitivityLevel = this.determineSensitivityLevel(
      classifications,
      detectedPatterns,
      hasSensitiveKeywords
    );

    // Calculate risk score
    const riskScore = this.piiDetector.calculateRiskScore(
      content,
      piiDetections
    );

    const result: ClassificationResult = {
      documentId,
      classifications,
      sensitivityLevel,
      containsPII: detectedPatterns.some((p) => p.type === 'EMAIL' || p.type === 'PHONE' || p.type === 'SSN'),
      containsPHI: this.checkForPhi(content),
      containsPCI: detectedPatterns.some((p) => p.type === 'CC_NUMBER'),
      riskLevel:
        riskScore > 75
          ? 'CRITICAL'
          : riskScore > 50
            ? 'HIGH'
            : riskScore > 25
              ? 'MEDIUM'
              : 'LOW',
      riskScore,
      detectedEntities,
      recommendedActions: this.getRecommendedActions(
        classifications,
        sensitivityLevel,
        riskScore
      ),
      classifiedAt: new Date(),
      classifiedBy: tenantId,
    };

    this.results.set(documentId, result);
    return result;
  }

  private determineClassifications(
    content: string,
    detectedPatterns: Array<{ type: string }>,
    piiDetections: Array<{ type: string }>
  ): Array<{
    type: DataClassification;
    confidence: number;
    reason?: string;
  }> {
    const classifications: Array<{
      type: DataClassification;
      confidence: number;
      reason?: string;
    }> = [];
    const lowerContent = content.toLowerCase();

    // Check for PII
    if (piiDetections.length > 0 || detectedPatterns.some((p) => p.type === 'EMAIL' || p.type === 'PHONE')) {
      classifications.push({
        type: 'PII',
        confidence: 0.9,
        reason: 'Contains personal identifiable information',
      });
    }

    // Check for PHI
    if (this.checkForPhi(content)) {
      classifications.push({
        type: 'PHI',
        confidence: 0.85,
        reason: 'Contains protected health information',
      });
    }

    // Check for PCI
    if (detectedPatterns.some((p) => p.type === 'CC_NUMBER')) {
      classifications.push({
        type: 'PCI',
        confidence: 0.98,
        reason: 'Contains credit card information',
      });
    }

    // Check for financial
    if (
      lowerContent.includes('invoice') ||
      lowerContent.includes('payment') ||
      lowerContent.includes('balance') ||
      lowerContent.includes('account')
    ) {
      classifications.push({
        type: 'FINANCIAL',
        confidence: 0.75,
        reason: 'Contains financial information',
      });
    }

    // Check for IP
    if (lowerContent.includes('trade secret') || lowerContent.includes('patent')) {
      classifications.push({
        type: 'INTELLECTUAL_PROPERTY',
        confidence: 0.8,
        reason: 'Contains intellectual property',
      });
    }

    if (classifications.length === 0) {
      classifications.push({
        type: 'UNCLASSIFIED',
        confidence: 1.0,
      });
    }

    return classifications;
  }

  private determineSensitivityLevel(
    classifications: Array<{ type: string }>,
    detectedPatterns: Array<{ type: string }>,
    hasSensitiveKeywords: boolean
  ): SensitivityLevel {
    const hasHighRisk = classifications.some((c) =>
      ['PII', 'PHI', 'PCI', 'INTELLECTUAL_PROPERTY'].includes(c.type)
    );
    const hasPatterns = detectedPatterns.length > 3;

    if (hasHighRisk || (hasPatterns && hasSensitiveKeywords)) {
      return 'RESTRICTED';
    }
    if (hasHighRisk || hasPatterns) {
      return 'CONFIDENTIAL';
    }
    if (
      classifications.some((c) =>
        ['FINANCIAL', 'CONTRACT', 'NDA'].includes(c.type)
      )
    ) {
      return 'INTERNAL';
    }
    return 'PUBLIC';
  }

  private checkForPhi(content: string): boolean {
    const phiKeywords = [
      'patient',
      'medical',
      'diagnosis',
      'treatment',
      'prescription',
      'health',
      'disease',
      'condition',
    ];
    const lowerContent = content.toLowerCase();
    return phiKeywords.some((keyword) => lowerContent.includes(keyword));
  }

  private shouldRedact(type: string): boolean {
    const redactTypes = [
      'EMAIL',
      'PHONE',
      'SSN',
      'CC_NUMBER',
      'PASSPORT',
      'DRIVERS_LICENSE',
    ];
    return redactTypes.includes(type);
  }

  private getRecommendedActions(
    classifications: Array<{ type: string }>,
    sensitivityLevel: string,
    riskScore: number
  ): string[] {
    const actions: string[] = [];

    if (classifications.some((c) => c.type === 'PII')) {
      actions.push('Redact personally identifiable information');
      actions.push('Restrict access to authorized personnel only');
    }

    if (classifications.some((c) => c.type === 'PHI')) {
      actions.push('Ensure HIPAA compliance');
      actions.push('Encrypt document with AES-256');
    }

    if (classifications.some((c) => c.type === 'PCI')) {
      actions.push('Comply with PCI DSS requirements');
      actions.push('Tokenize credit card numbers');
    }

    if (sensitivityLevel === 'RESTRICTED') {
      actions.push('Apply role-based access control');
      actions.push('Log all access attempts');
      actions.push('Set expiration date for document');
    }

    if (riskScore > 75) {
      actions.push('Schedule compliance review');
      actions.push('Notify data protection officer');
    }

    return actions;
  }

  async getClassificationResult(documentId: EntityId): Promise<ClassificationResult | null> {
    return this.results.get(documentId) || null;
  }

  async listClassifications(
    tenantId: EntityId
  ): Promise<ClassificationResult[]> {
    return Array.from(this.results.values()).filter(
      (r) => r.classifiedBy === tenantId
    );
  }
}
