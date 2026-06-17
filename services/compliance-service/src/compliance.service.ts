import { Injectable } from '@nestjs/common';
import type { ComplianceMapping, ComplianceReport, ComplianceFramework, EntityId } from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';

@Injectable()
export class ComplianceService {
  private readonly logger = new ConsoleLogger('ComplianceService');
  private mappings: Map<EntityId, ComplianceMapping> = new Map();
  private reports: Map<EntityId, ComplianceReport> = new Map();

  private frameworkRequirements: Record<ComplianceFramework, string[]> = {
    GDPR: [
      'Data subject rights (access, deletion, portability)',
      'Consent management',
      'Data protection impact assessments',
      'Data breach notification (72 hours)',
      'Privacy by design',
      'Data retention limits',
    ],
    HIPAA: [
      'Patient privacy protection',
      'Security safeguards',
      'Breach notification',
      'Minimum necessary standard',
      'Authorization and consent',
      'Access controls',
      'Encryption at rest and in transit',
    ],
    CCPA: [
      'Consumer privacy rights',
      'Opt-out mechanisms',
      'Data sale transparency',
      'Data deletion requests',
      'Vendor compliance',
      'Annual audits',
    ],
    SOX: [
      'Financial data integrity',
      'Internal controls',
      'Management assertions',
      'Audit trails',
      'Document retention',
      'Financial reporting controls',
    ],
    ISO_27001: [
      'Information security policy',
      'Access control',
      'Cryptography',
      'Physical security',
      'Incident management',
      'Business continuity',
    ],
    FEDRAMP: [
      'Security authorization',
      'Continuous monitoring',
      'Incident response',
      'System security plans',
      'Configuration management',
      'Supply chain risk management',
    ],
    SOC2: [
      'Security',
      'Availability',
      'Processing integrity',
      'Confidentiality',
      'Privacy',
    ],
    PCI_DSS: [
      'Network security',
      'Cardholder data protection',
      'Vulnerability management',
      'Access control',
      'Monitoring and testing',
      'Policy maintenance',
    ],
    NIST: [
      'Identify function',
      'Protect function',
      'Detect function',
      'Respond function',
      'Recover function',
    ],
  };

  async createMapping(
    tenantId: EntityId,
    framework: ComplianceFramework,
    requirement: string
  ): Promise<ComplianceMapping> {
    const mapping: ComplianceMapping = {
      id: generateEntityId(),
      tenantId,
      framework,
      requirement,
      mappedPolicies: [],
      mappedControls: [],
      status: 'PARTIALLY_COMPLIANT',
      evidence: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: tenantId,
      updatedBy: tenantId,
      deleted: false,
    };

    this.mappings.set(mapping.id, mapping);
    this.logger.info(`Created compliance mapping: ${framework} - ${requirement}`);
    return mapping;
  }

  async updateComplianceStatus(
    mappingId: EntityId,
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT'
  ): Promise<ComplianceMapping | null> {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) return null;

    mapping.status = status;
    mapping.lastAssessedAt = new Date();
    mapping.updatedAt = new Date();
    this.mappings.set(mappingId, mapping);

    return mapping;
  }

  async addEvidence(mappingId: EntityId, evidence: string): Promise<ComplianceMapping | null> {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) return null;

    mapping.evidence.push(evidence);
    mapping.updatedAt = new Date();
    this.mappings.set(mappingId, mapping);

    return mapping;
  }

  async generateReport(
    tenantId: EntityId,
    framework: ComplianceFramework,
    periodFrom: Date,
    periodTo: Date
  ): Promise<ComplianceReport> {
    const mappings = Array.from(this.mappings.values()).filter(
      (m) => m.tenantId === tenantId && m.framework === framework && !m.deleted
    );

    const compliant = mappings.filter((m) => m.status === 'COMPLIANT').length;
    const nonCompliant = mappings.filter((m) => m.status === 'NON_COMPLIANT').length;
    const partialCompliant = mappings.filter((m) => m.status === 'PARTIALLY_COMPLIANT').length;

    const overallStatus =
      nonCompliant === 0 && partialCompliant === 0
        ? 'COMPLIANT'
        : nonCompliant === 0
          ? 'PARTIALLY_COMPLIANT'
          : 'NON_COMPLIANT';

    const complianceScore =
      (compliant * 100 + partialCompliant * 50) /
      (compliant + partialCompliant + nonCompliant || 1);

    const report: ComplianceReport = {
      id: generateEntityId(),
      tenantId,
      framework,
      period: { from: periodFrom, to: periodTo },
      summary: `Compliance assessment for ${framework}`,
      findings: nonCompliant > 0 ? [
        {
          id: '1',
          title: 'Non-compliant requirements found',
          description: `${nonCompliant} requirements are not compliant`,
          severity: 'HIGH',
          recommendation: 'Develop remediation plan',
          evidence: [],
        },
      ] : [],
      overallStatus,
      complianceScore: Math.round(complianceScore),
      generatedAt: new Date(),
      generatedBy: tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: tenantId,
      updatedBy: tenantId,
      deleted: false,
    };

    this.reports.set(report.id, report);
    this.logger.info(`Generated ${framework} compliance report`);
    return report;
  }

  async getFrameworkRequirements(framework: ComplianceFramework): Promise<string[]> {
    return this.frameworkRequirements[framework] || [];
  }

  async getMappings(tenantId: EntityId, framework?: ComplianceFramework): Promise<ComplianceMapping[]> {
    let mappings = Array.from(this.mappings.values()).filter(
      (m) => m.tenantId === tenantId && !m.deleted
    );

    if (framework) {
      mappings = mappings.filter((m) => m.framework === framework);
    }

    return mappings;
  }

  async getComplianceScore(tenantId: EntityId, framework: ComplianceFramework): Promise<number> {
    const mappings = await this.getMappings(tenantId, framework);
    if (mappings.length === 0) return 0;

    const compliant = mappings.filter((m) => m.status === 'COMPLIANT').length;
    const partialCompliant = mappings.filter((m) => m.status === 'PARTIALLY_COMPLIANT').length;

    return Math.round((compliant * 100 + partialCompliant * 50) / mappings.length);
  }
}
