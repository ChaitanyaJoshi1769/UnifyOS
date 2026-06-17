import { Injectable } from '@nestjs/common';
import type { EntityId } from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';

type TriggerType =
  | 'ManualTrigger'
  | 'ScheduledTrigger'
  | 'EventTrigger'
  | 'DocumentTrigger'
  | 'DataQualityTrigger';

type ActionType =
  | 'SendNotification'
  | 'CreateTask'
  | 'UpdateDocument'
  | 'CallAPI'
  | 'ExecuteSQL'
  | 'RunScript'
  | 'SendEmail';

interface WorkflowInput {
  name: string;
  description?: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  enabled: boolean;
}

interface WorkflowTrigger {
  type: TriggerType;
  config: Record<string, unknown>;
}

interface WorkflowAction {
  type: ActionType;
  config: Record<string, unknown>;
}

interface WorkflowCondition {
  field: string;
  operator: string;
  value: unknown;
}

interface Workflow {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  description?: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ExecutionResult {
  id: EntityId;
  workflowId: EntityId;
  tenantId: EntityId;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  startedAt: Date;
  completedAt?: Date;
  results: Record<string, unknown>;
  error?: string;
}

interface ExecutionStatus {
  id: EntityId;
  workflowId: EntityId;
  status: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
}

interface ApprovalTask {
  id: EntityId;
  executionId: EntityId;
  workflowId: EntityId;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: EntityId;
  rejectionReason?: string;
}

@Injectable()
export class WorkflowService {
  private readonly logger = new ConsoleLogger('WorkflowService');
  private workflows: Map<EntityId, Workflow> = new Map();
  private executions: Map<EntityId, ExecutionResult> = new Map();
  private approvalTasks: Map<EntityId, ApprovalTask> = new Map();
  private executionPausedTasks: Map<EntityId, Set<EntityId>> = new Map();

  async createWorkflow(tenantId: EntityId, input: WorkflowInput): Promise<Workflow> {
    const workflow: Workflow = {
      id: generateEntityId(),
      tenantId,
      name: input.name,
      description: input.description,
      triggers: input.triggers,
      actions: input.actions,
      conditions: input.conditions,
      enabled: input.enabled,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(workflow.id, workflow);
    this.logger.info(`Created workflow: ${input.name}`);
    return workflow;
  }

  async executeWorkflow(
    workflowId: EntityId,
    variables: Record<string, unknown>,
  ): Promise<ExecutionResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execution: ExecutionResult = {
      id: generateEntityId(),
      workflowId,
      tenantId: workflow.tenantId,
      status: 'RUNNING',
      startedAt: new Date(),
      results: {},
    };

    this.executions.set(execution.id, execution);

    try {
      const results = await this.executeActions(workflow, variables, execution.id);
      execution.status = 'COMPLETED';
      execution.results = results;
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'FAILED';
      execution.error = (error as Error).message;
      execution.completedAt = new Date();
    }

    this.executions.set(execution.id, execution);
    this.logger.info(`Workflow ${workflow.name} execution completed`);
    return execution;
  }

  private async executeActions(
    workflow: Workflow,
    variables: Record<string, unknown>,
    executionId: EntityId,
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    for (const action of workflow.actions) {
      const actionResult = await this.executeAction(action, variables);
      results[action.type] = actionResult;

      if (actionResult.requiresApproval) {
        const task: ApprovalTask = {
          id: generateEntityId(),
          executionId,
          workflowId: workflow.id,
          description: `Approval needed for ${action.type}`,
          status: 'PENDING',
          createdAt: new Date(),
        };

        this.approvalTasks.set(task.id, task);
        const pausedSet = this.executionPausedTasks.get(executionId) || new Set();
        pausedSet.add(task.id);
        this.executionPausedTasks.set(executionId, pausedSet);
      }
    }

    return results;
  }

  private async executeAction(
    action: WorkflowAction,
    variables: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    switch (action.type) {
      case 'SendNotification':
        return {
          type: 'notification',
          message: `Notification sent: ${action.config.message || 'No message'}`,
          requiresApproval: false,
        };
      case 'CreateTask':
        return {
          type: 'task',
          taskId: generateEntityId(),
          title: action.config.title || 'Untitled Task',
          requiresApproval: true,
        };
      case 'UpdateDocument':
        return {
          type: 'document',
          documentId: action.config.documentId || 'N/A',
          updated: true,
          requiresApproval: false,
        };
      case 'CallAPI':
        return {
          type: 'api',
          endpoint: action.config.endpoint || 'N/A',
          status: 'success',
          requiresApproval: false,
        };
      case 'ExecuteSQL':
        return {
          type: 'sql',
          query: action.config.query || 'N/A',
          rowsAffected: Math.floor(Math.random() * 1000),
          requiresApproval: false,
        };
      case 'RunScript':
        return {
          type: 'script',
          scriptName: action.config.scriptName || 'N/A',
          exitCode: 0,
          requiresApproval: false,
        };
      case 'SendEmail':
        return {
          type: 'email',
          to: action.config.to || 'N/A',
          subject: action.config.subject || 'No subject',
          sent: true,
          requiresApproval: false,
        };
      default:
        return { error: 'Unknown action type' };
    }
  }

  async getExecutionStatus(executionId: EntityId): Promise<ExecutionStatus> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const progress = execution.status === 'COMPLETED' ? 100 :
                    execution.status === 'FAILED' ? 0 :
                    execution.status === 'PAUSED' ? 50 : 75;

    return {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      progress,
      startedAt: execution.startedAt.toISOString(),
      completedAt: execution.completedAt?.toISOString(),
    };
  }

  async pauseExecution(executionId: EntityId): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    if (execution.status === 'RUNNING') {
      execution.status = 'PAUSED';
      this.executions.set(executionId, execution);
      this.logger.info(`Paused execution: ${executionId}`);
      return true;
    }

    return false;
  }

  async resumeExecution(executionId: EntityId): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    if (execution.status === 'PAUSED') {
      execution.status = 'RUNNING';
      this.executions.set(executionId, execution);
      this.logger.info(`Resumed execution: ${executionId}`);
      return true;
    }

    return false;
  }

  async listWorkflows(tenantId: EntityId): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter((w) => w.tenantId === tenantId);
  }

  async deleteWorkflow(workflowId: EntityId): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    this.workflows.delete(workflowId);
    this.logger.info(`Deleted workflow: ${workflow.name}`);
    return true;
  }

  async approveTask(taskId: EntityId, approverId: EntityId): Promise<boolean> {
    const task = this.approvalTasks.get(taskId);
    if (!task) return false;

    task.status = 'APPROVED';
    task.approvedAt = new Date();
    task.approvedBy = approverId;
    this.approvalTasks.set(taskId, task);

    const pausedSet = this.executionPausedTasks.get(task.executionId);
    if (pausedSet) {
      pausedSet.delete(taskId);
      if (pausedSet.size === 0) {
        const execution = this.executions.get(task.executionId);
        if (execution && execution.status === 'PAUSED') {
          execution.status = 'RUNNING';
          this.executions.set(task.executionId, execution);
        }
        this.executionPausedTasks.delete(task.executionId);
      }
    }

    this.logger.info(`Task approved: ${taskId}`);
    return true;
  }

  async rejectTask(taskId: EntityId, approverId: EntityId, reason: string): Promise<boolean> {
    const task = this.approvalTasks.get(taskId);
    if (!task) return false;

    task.status = 'REJECTED';
    task.approvedAt = new Date();
    task.approvedBy = approverId;
    task.rejectionReason = reason;
    this.approvalTasks.set(taskId, task);

    const execution = this.executions.get(task.executionId);
    if (execution && execution.status === 'PAUSED') {
      execution.status = 'FAILED';
      execution.error = `Task rejected: ${reason}`;
      execution.completedAt = new Date();
      this.executions.set(task.executionId, execution);
    }

    this.logger.info(`Task rejected: ${taskId} - ${reason}`);
    return true;
  }

  async getApprovalTasks(executionId: EntityId): Promise<ApprovalTask[]> {
    return Array.from(this.approvalTasks.values()).filter((t) => t.executionId === executionId);
  }

  async getPendingApprovals(tenantId: EntityId): Promise<ApprovalTask[]> {
    const workflowIds = new Set(
      Array.from(this.workflows.values())
        .filter((w) => w.tenantId === tenantId)
        .map((w) => w.id),
    );

    return Array.from(this.approvalTasks.values()).filter(
      (t) => t.status === 'PENDING' && workflowIds.has(t.workflowId),
    );
  }
}
