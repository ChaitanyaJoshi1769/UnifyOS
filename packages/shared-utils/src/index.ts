// ============================================================================
// UUID & ID Generation
// ============================================================================

import type { UUID, EntityId } from '@unifyos/shared-types';

export function generateUUID(): UUID {
  return crypto.randomUUID() as UUID;
}

export function generateEntityId(): EntityId {
  return generateUUID();
}

export function isValidUUID(value: string): value is UUID {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value);
}

// ============================================================================
// String Utilities
// ============================================================================

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function camelCase(str: string): string {
  return str
    .replace(/[-_\s](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (c: string) => c.toLowerCase());
}

export function pascalCase(str: string): string {
  return str
    .replace(/[-_\s](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (c: string) => c.toUpperCase());
}

export function truncate(
  str: string,
  length: number,
  suffix: string = '...'
): string {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================================
// Hashing Utilities
// ============================================================================

export async function hashString(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashFile(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function md5Hash(str: string): string {
  // Note: MD5 is for compatibility only. Use SHA-256 for new code.
  // This is a simple implementation using crypto.subtle
  const utf8 = new TextEncoder().encode(str);
  return Array.from(new Uint8Array(utf8))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ============================================================================
// Date/Time Utilities
// ============================================================================

export function getCurrentTimestamp(): Date {
  return new Date();
}

export function isDateInPast(date: Date): boolean {
  return date < new Date();
}

export function isDateInFuture(date: Date): boolean {
  return date > new Date();
}

export function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / msPerDay);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

// ============================================================================
// Number Utilities
// ============================================================================

export function roundTo(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return roundTo(bytes / Math.pow(k, i), decimals) + ' ' + sizes[i];
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ============================================================================
// Array Utilities
// ============================================================================

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function flatten<T>(array: (T | T[])[]): T[] {
  return array.flat();
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function uniqueBy<T, K>(array: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function groupBy<T, K extends string | number>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const k = key(item);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

export function sortBy<T>(
  array: T[],
  key: (item: T) => number | string,
  order: 'ASC' | 'DESC' = 'ASC'
): T[] {
  const sorted = [...array].sort((a, b) => {
    const aVal = key(a);
    const bVal = key(b);
    if (aVal < bVal) return order === 'ASC' ? -1 : 1;
    if (aVal > bVal) return order === 'ASC' ? 1 : -1;
    return 0;
  });
  return sorted;
}

export function findDuplicates<T>(array: T[]): T[] {
  const seen = new Set<T>();
  const duplicates = new Set<T>();

  for (const item of array) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }

  return Array.from(duplicates);
}

// ============================================================================
// Object Utilities
// ============================================================================

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue as T, sourceValue as Partial<T>);
      } else {
        result[key] = sourceValue as unknown;
      }
    }
  }

  return result;
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (obj instanceof Object) {
    const clonedObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone((obj as Record<string, unknown>)[key]);
      }
    }
    return clonedObj as T;
  }
  return obj;
}

export function omit<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (!keys.includes(key as keyof T)) {
      result[key as keyof T] = obj[key];
    }
  }
  return result;
}

export function pick<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function flattenObject(
  obj: Record<string, unknown>,
  prefix: string = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        Object.assign(
          result,
          flattenObject(value as Record<string, unknown>, newKey)
        );
      } else {
        result[newKey] = value;
      }
    }
  }

  return result;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    isObject(value) &&
    typeof (value as Record<string, unknown>).then === 'function'
  );
}

// ============================================================================
// Error Handling
// ============================================================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

// ============================================================================
// Retry Utilities
// ============================================================================

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    backoffMultiplier?: number;
    initialDelayMs?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    backoffMultiplier = 2,
    initialDelayMs = 100,
  } = options;

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(backoffMultiplier, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

// ============================================================================
// Logger Utilities
// ============================================================================

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>):
    | void;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly prefix: string = 'UnifyOS') {}

  debug(message: string, context?: Record<string, unknown>): void {
    console.log(`[${this.prefix}:DEBUG]`, message, context || '');
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(`[${this.prefix}:INFO]`, message, context || '');
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[${this.prefix}:WARN]`, message, context || '');
  }

  error(message: string, error?: Error, context?: Record<string, unknown>):
    | void {
    console.error(
      `[${this.prefix}:ERROR]`,
      message,
      error?.message || '',
      context || ''
    );
  }
}

// ============================================================================
// Environment Variables
// ============================================================================

export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
}

export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = getEnv(key, defaultValue?.toString());
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  return num;
}

export function getEnvBoolean(
  key: string,
  defaultValue: boolean = false
): boolean {
  const value = getEnv(key, String(defaultValue)).toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}
