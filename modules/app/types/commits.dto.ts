export interface LintError {
  level: number;
  valid: boolean;
  name: string;
  message: string;
}

export interface LintResult {
  valid: boolean;
  errors: LintError[];
  input: string;
  author: string;
  avatarUrl: string;
}

export interface CommitsDto {
  valid: number;
  invalid: number;
  lintResult: LintResult[];
}
