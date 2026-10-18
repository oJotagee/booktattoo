export const ATTEMPT_LIMITER = Symbol('ATTEMPT_LIMITER');

export type AttemptResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export interface AttemptLimiter {
  consume(key: string, limit: number, windowSeconds: number): Promise<AttemptResult>;

  peek(key: string, limit: number): Promise<AttemptResult>;

  reset(key: string): Promise<void>;
}
