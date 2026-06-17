import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { SecurityService } from './security.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class RoleInfo {
  @Field() id: string;
  @Field() name: string;
  @Field(() => [GraphQLString]) permissions: string[];
  @Field() createdAt: string;
}

@ObjectType()
export class MFASetup {
  @Field() secret: string;
  @Field() qrCode: string;
}

@ObjectType()
export class AuditLogEntry {
  @Field() id: string;
  @Field() action: string;
  @Field() resource: string;
  @Field() result: string;
  @Field() timestamp: string;
}

@Resolver()
export class SecurityResolver {
  constructor(private readonly securityService: SecurityService) {}

  @Mutation(() => RoleInfo)
  async createRole(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('name', { type: () => GraphQLString }) name: string,
    @Args('permissions', { type: () => [GraphQLString] }) permissions: string[],
  ): Promise<RoleInfo> {
    const role = await this.securityService.createRole(tenantId as EntityId, name, permissions);
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions,
      createdAt: role.createdAt.toISOString(),
    };
  }

  @Mutation(() => GraphQLString)
  async assignRole(
    @Args('userId', { type: () => GraphQLString }) userId: string,
    @Args('roleId', { type: () => GraphQLString }) roleId: string,
  ): Promise<string> {
    const success = await this.securityService.assignRoleToUser(
      userId as EntityId,
      roleId as EntityId,
    );
    return success ? 'Role assigned successfully' : 'Failed to assign role';
  }

  @Query(() => GraphQLString)
  async checkPermission(
    @Args('userId', { type: () => GraphQLString }) userId: string,
    @Args('permission', { type: () => GraphQLString }) permission: string,
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<string> {
    const hasPermission = await this.securityService.checkPermission(
      userId as EntityId,
      permission,
      tenantId as EntityId,
    );
    return hasPermission ? 'ALLOWED' : 'DENIED';
  }

  @Mutation(() => MFASetup)
  async enableMFA(
    @Args('userId', { type: () => GraphQLString }) userId: string,
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<MFASetup> {
    return this.securityService.enableMFA(userId as EntityId, tenantId as EntityId);
  }

  @Mutation(() => GraphQLString)
  async verifyMFA(
    @Args('userId', { type: () => GraphQLString }) userId: string,
    @Args('token', { type: () => GraphQLString }) token: string,
  ): Promise<string> {
    const isValid = await this.securityService.verifyMFA(userId as EntityId, token);
    return isValid ? 'MFA verified successfully' : 'MFA verification failed';
  }

  @Query(() => [AuditLogEntry])
  async auditLog(
    @Args('userId', { type: () => GraphQLString }) userId: string,
    @Args('limit', { type: () => GraphQLInt, defaultValue: 100 }) limit: number,
  ): Promise<AuditLogEntry[]> {
    const events = await this.securityService.getAuditLog(userId as EntityId, limit);
    return events.map((e) => ({
      id: e.id,
      action: e.action,
      resource: e.resource,
      result: e.result,
      timestamp: e.timestamp.toISOString(),
    }));
  }

  @Mutation(() => GraphQLString)
  async rotateKeys(
    @Args('keyId', { type: () => GraphQLString }) keyId: string,
  ): Promise<string> {
    const newKey = await this.securityService.rotateKeys(keyId as EntityId);
    return `Key rotated: ${newKey.id}`;
  }

  @Query(() => [RoleInfo])
  async getUserRoles(
    @Args('userId', { type: () => GraphQLString }) userId: string,
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<RoleInfo[]> {
    const roles = await this.securityService.getUserRoles(userId as EntityId, tenantId as EntityId);
    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      permissions: r.permissions,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  @Mutation(() => GraphQLString)
  async revokeRole(
    @Args('userId', { type: () => GraphQLString }) userId: string,
    @Args('roleId', { type: () => GraphQLString }) roleId: string,
  ): Promise<string> {
    const success = await this.securityService.revokeRole(userId as EntityId, roleId as EntityId);
    return success ? 'Role revoked successfully' : 'Failed to revoke role';
  }
}
