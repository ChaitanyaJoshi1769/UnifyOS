import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { WorkflowService } from './workflow.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class WorkflowInfo {
  @Field() id: string;
  @Field() name: string;
  @Field() description?: string;
  @Field() enabled: boolean;
  @Field() createdAt: string;
}

@ObjectType()
export class ExecutionInfo {
  @Field() id: string;
  @Field() workflowId: string;
  @Field() status: string;
  @Field() startedAt: string;
  @Field() completedAt?: string;
}

@ObjectType()
export class ExecutionStatusInfo {
  @Field() id: string;
  @Field() status: string;
  @Field() progress: number;
  @Field() startedAt: string;
}

@ObjectType()
export class ApprovalTaskInfo {
  @Field() id: string;
  @Field() description: string;
  @Field() status: string;
  @Field() createdAt: string;
}

@Resolver()
export class WorkflowResolver {
  constructor(private readonly workflowService: WorkflowService) {}

  @Mutation(() => WorkflowInfo)
  async createWorkflow(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('name', { type: () => GraphQLString }) name: string,
    @Args('description', { type: () => GraphQLString, nullable: true }) description?: string,
  ): Promise<WorkflowInfo> {
    const workflow = await this.workflowService.createWorkflow(tenantId as EntityId, {
      name,
      description,
      triggers: [{ type: 'ManualTrigger', config: {} }],
      actions: [{ type: 'SendNotification', config: { message: 'Workflow executed' } }],
      enabled: true,
    });

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      enabled: workflow.enabled,
      createdAt: workflow.createdAt.toISOString(),
    };
  }

  @Mutation(() => ExecutionInfo)
  async executeWorkflow(
    @Args('workflowId', { type: () => GraphQLString }) workflowId: string,
  ): Promise<ExecutionInfo> {
    const execution = await this.workflowService.executeWorkflow(workflowId as EntityId, {});

    return {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      startedAt: execution.startedAt.toISOString(),
      completedAt: execution.completedAt?.toISOString(),
    };
  }

  @Query(() => ExecutionStatusInfo)
  async getExecutionStatus(
    @Args('executionId', { type: () => GraphQLString }) executionId: string,
  ): Promise<ExecutionStatusInfo> {
    const status = await this.workflowService.getExecutionStatus(executionId as EntityId);

    return {
      id: status.id,
      status: status.status,
      progress: status.progress,
      startedAt: status.startedAt,
    };
  }

  @Mutation(() => GraphQLString)
  async pauseExecution(
    @Args('executionId', { type: () => GraphQLString }) executionId: string,
  ): Promise<string> {
    const success = await this.workflowService.pauseExecution(executionId as EntityId);
    return success ? 'Execution paused' : 'Failed to pause execution';
  }

  @Mutation(() => GraphQLString)
  async resumeExecution(
    @Args('executionId', { type: () => GraphQLString }) executionId: string,
  ): Promise<string> {
    const success = await this.workflowService.resumeExecution(executionId as EntityId);
    return success ? 'Execution resumed' : 'Failed to resume execution';
  }

  @Query(() => [WorkflowInfo])
  async listWorkflows(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<WorkflowInfo[]> {
    const workflows = await this.workflowService.listWorkflows(tenantId as EntityId);

    return workflows.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      enabled: w.enabled,
      createdAt: w.createdAt.toISOString(),
    }));
  }

  @Mutation(() => GraphQLString)
  async deleteWorkflow(
    @Args('workflowId', { type: () => GraphQLString }) workflowId: string,
  ): Promise<string> {
    const success = await this.workflowService.deleteWorkflow(workflowId as EntityId);
    return success ? 'Workflow deleted' : 'Workflow not found';
  }

  @Mutation(() => GraphQLString)
  async approveTask(
    @Args('taskId', { type: () => GraphQLString }) taskId: string,
    @Args('approverId', { type: () => GraphQLString }) approverId: string,
  ): Promise<string> {
    const success = await this.workflowService.approveTask(
      taskId as EntityId,
      approverId as EntityId,
    );
    return success ? 'Task approved' : 'Task not found';
  }

  @Mutation(() => GraphQLString)
  async rejectTask(
    @Args('taskId', { type: () => GraphQLString }) taskId: string,
    @Args('approverId', { type: () => GraphQLString }) approverId: string,
    @Args('reason', { type: () => GraphQLString }) reason: string,
  ): Promise<string> {
    const success = await this.workflowService.rejectTask(
      taskId as EntityId,
      approverId as EntityId,
      reason,
    );
    return success ? 'Task rejected' : 'Task not found';
  }

  @Query(() => [ApprovalTaskInfo])
  async getPendingApprovals(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<ApprovalTaskInfo[]> {
    const tasks = await this.workflowService.getPendingApprovals(tenantId as EntityId);

    return tasks.map((t) => ({
      id: t.id,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    }));
  }
}
