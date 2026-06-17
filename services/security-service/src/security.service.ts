import { Injectable } from '@nestjs/common';
import type { EntityId } from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

interface Role {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface RoleAssignment {
  id: EntityId;
  userId: EntityId;
  roleId: EntityId;
  tenantId: EntityId;
  assignedAt: Date;
}

interface AuditEvent {
  id: EntityId;
  userId: EntityId;
  tenantId: EntityId;
  action: string;
  resource: string;
  result: 'SUCCESS' | 'FAILURE';
  details: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface Key {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  algorithm: string;
  publicKey: string;
  createdAt: Date;
  rotatedAt: Date;
  active: boolean;
}

@Injectable()
export class SecurityService {
  private readonly logger = new ConsoleLogger('SecurityService');
  private roles: Map<EntityId, Role> = new Map();
  private roleAssignments: Map<EntityId, RoleAssignment> = new Map();
  private auditLog: AuditEvent[] = [];
  private mfaSecrets: Map<EntityId, string> = new Map();
  private keys: Map<EntityId, Key> = new Map();
  private userPermissions: Map<string, Set<string>> = new Map();

  async createRole(tenantId: EntityId, name: string, permissions: string[]): Promise<Role> {
    const role: Role = {
      id: generateEntityId(),
      tenantId,
      name,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(role.id, role);
    await this.logAuditEvent({
      id: generateEntityId(),
      userId: tenantId,
      tenantId,
      action: 'CREATE_ROLE',
      resource: `role:${role.id}`,
      result: 'SUCCESS',
      details: { name, permissionCount: permissions.length },
      timestamp: new Date(),
    });

    this.logger.info(`Created role: ${name} with ${permissions.length} permissions`);
    return role;
  }

  async assignRoleToUser(userId: EntityId, roleId: EntityId, tenantId?: EntityId): Promise<boolean> {
    const role = this.roles.get(roleId);
    if (!role) {
      this.logger.warn(`Role not found: ${roleId}`);
      return false;
    }

    const assignment: RoleAssignment = {
      id: generateEntityId(),
      userId,
      roleId,
      tenantId: tenantId || role.tenantId,
      assignedAt: new Date(),
    };

    this.roleAssignments.set(assignment.id, assignment);

    const permissionKey = `${userId}:${role.tenantId}`;
    const perms = this.userPermissions.get(permissionKey) || new Set();
    role.permissions.forEach((p) => perms.add(p));
    this.userPermissions.set(permissionKey, perms);

    await this.logAuditEvent({
      id: generateEntityId(),
      userId,
      tenantId: role.tenantId,
      action: 'ASSIGN_ROLE',
      resource: `user:${userId}`,
      result: 'SUCCESS',
      details: { roleId, roleName: role.name },
      timestamp: new Date(),
    });

    this.logger.info(`Assigned role ${role.name} to user ${userId}`);
    return true;
  }

  async checkPermission(userId: EntityId, permission: string, tenantId?: EntityId): Promise<boolean> {
    if (!tenantId) return false;

    const permissionKey = `${userId}:${tenantId}`;
    const perms = this.userPermissions.get(permissionKey);
    const hasPermission = perms?.has(permission) || false;

    await this.logAuditEvent({
      id: generateEntityId(),
      userId,
      tenantId,
      action: 'CHECK_PERMISSION',
      resource: permission,
      result: hasPermission ? 'SUCCESS' : 'FAILURE',
      details: { permission },
      timestamp: new Date(),
    });

    return hasPermission;
  }

  async enableMFA(userId: EntityId, tenantId: EntityId): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `UnifyOS (${userId})`,
      issuer: 'UnifyOS',
      length: 32,
    });

    this.mfaSecrets.set(userId, secret.base32);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    await this.logAuditEvent({
      id: generateEntityId(),
      userId,
      tenantId,
      action: 'ENABLE_MFA',
      resource: `user:${userId}`,
      result: 'SUCCESS',
      details: { mfaMethod: 'TOTP' },
      timestamp: new Date(),
    });

    this.logger.info(`Enabled MFA for user ${userId}`);
    return { secret: secret.base32, qrCode };
  }

  async verifyMFA(userId: EntityId, token: string): Promise<boolean> {
    const secret = this.mfaSecrets.get(userId);
    if (!secret) {
      this.logger.warn(`MFA secret not found for user ${userId}`);
      return false;
    }

    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    return isValid;
  }

  async logAuditEvent(event: AuditEvent): Promise<void> {
    this.auditLog.push(event);
    if (this.auditLog.length > 10000) {
      this.auditLog.shift();
    }
    this.logger.debug(`Audit event logged: ${event.action} on ${event.resource}`);
  }

  async getAuditLog(userId: EntityId, limit: number = 100): Promise<AuditEvent[]> {
    return this.auditLog
      .filter((e) => e.userId === userId)
      .slice(-limit)
      .reverse();
  }

  async rotateKeys(keyId: EntityId): Promise<Key> {
    const existingKey = this.keys.get(keyId);
    if (!existingKey) {
      this.logger.error(`Key not found: ${keyId}`);
      throw new Error(`Key not found: ${keyId}`);
    }

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const newKey: Key = {
      id: generateEntityId(),
      tenantId: existingKey.tenantId,
      name: `${existingKey.name}-rotated-${new Date().toISOString()}`,
      algorithm: 'RSA-4096',
      publicKey: publicKey.toString(),
      createdAt: new Date(),
      rotatedAt: new Date(),
      active: true,
    };

    existingKey.active = false;
    this.keys.set(newKey.id, newKey);

    await this.logAuditEvent({
      id: generateEntityId(),
      userId: existingKey.tenantId,
      tenantId: existingKey.tenantId,
      action: 'ROTATE_KEY',
      resource: `key:${keyId}`,
      result: 'SUCCESS',
      details: { newKeyId: newKey.id, algorithm: newKey.algorithm },
      timestamp: new Date(),
    });

    this.logger.info(`Rotated key: ${keyId} -> ${newKey.id}`);
    return newKey;
  }

  async encryptData(data: string, keyId: EntityId): Promise<string> {
    const key = this.keys.get(keyId);
    if (!key || !key.active) {
      this.logger.error(`Active key not found: ${keyId}`);
      throw new Error(`Active key not found: ${keyId}`);
    }

    const encrypted = crypto.publicEncrypt(key.publicKey, Buffer.from(data));
    return encrypted.toString('base64');
  }

  async decryptData(encryptedData: string, keyId: EntityId): Promise<string> {
    const key = this.keys.get(keyId);
    if (!key) {
      this.logger.error(`Key not found: ${keyId}`);
      throw new Error(`Key not found: ${keyId}`);
    }

    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: crypto.createPrivateKey({ key: key.publicKey, format: 'pem' }),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(encryptedData, 'base64'),
      );
      return decrypted.toString('utf-8');
    } catch (error) {
      this.logger.error('Decryption failed');
      throw new Error('Decryption failed');
    }
  }

  async getAuditLogTenant(tenantId: EntityId, limit: number = 100): Promise<AuditEvent[]> {
    return this.auditLog
      .filter((e) => e.tenantId === tenantId)
      .slice(-limit)
      .reverse();
  }

  async getUserRoles(userId: EntityId, tenantId: EntityId): Promise<Role[]> {
    return Array.from(this.roleAssignments.values())
      .filter((a) => a.userId === userId && a.tenantId === tenantId)
      .map((a) => this.roles.get(a.roleId))
      .filter(Boolean) as Role[];
  }

  async revokeRole(userId: EntityId, roleId: EntityId): Promise<boolean> {
    const assignment = Array.from(this.roleAssignments.values()).find(
      (a) => a.userId === userId && a.roleId === roleId,
    );

    if (!assignment) return false;

    this.roleAssignments.delete(assignment.id);

    const role = this.roles.get(roleId);
    if (role) {
      const permissionKey = `${userId}:${role.tenantId}`;
      const perms = this.userPermissions.get(permissionKey);
      if (perms) {
        role.permissions.forEach((p) => perms.delete(p));
        if (perms.size === 0) {
          this.userPermissions.delete(permissionKey);
        }
      }

      await this.logAuditEvent({
        id: generateEntityId(),
        userId,
        tenantId: role.tenantId,
        action: 'REVOKE_ROLE',
        resource: `user:${userId}`,
        result: 'SUCCESS',
        details: { roleId, roleName: role.name },
        timestamp: new Date(),
      });
    }

    return true;
  }
}
