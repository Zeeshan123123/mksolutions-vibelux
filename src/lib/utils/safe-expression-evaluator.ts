/**
 * Safe expression evaluator that replaces eval() for simple expressions
 * Supports basic arithmetic, comparisons, and logical operations
 */

type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
type LogicalOperator = '&&' | '||';
type ArithmeticOperator = '+' | '-' | '*' | '/';

export class SafeExpressionEvaluator {
  private static readonly COMPARISON_OPS: Set<string> = new Set(['>', '<', '>=', '<=', '==', '!=']);
  private static readonly LOGICAL_OPS: Set<string> = new Set(['&&', '||']);
  private static readonly ARITHMETIC_OPS: Set<string> = new Set(['+', '-', '*', '/']);
  
  /**
   * Evaluate a simple expression safely without using eval()
   * @param expression The expression to evaluate (e.g., "temperature > 25 && humidity < 60")
   * @param variables Object containing variable values
   * @returns The result of the expression
   */
  static evaluate(expression: string, variables: Record<string, any>): any {
    // Replace variables with their values
    let processedExpression = expression;
    
    // Replace ${variable} syntax
    processedExpression = processedExpression.replace(/\${(\w+)}/g, (_, key) => {
      const value = variables[key];
      if (value === undefined) {
        throw new Error(`Variable ${key} is not defined`);
      }
      return JSON.stringify(value);
    });
    
    // Replace plain variable names
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      processedExpression = processedExpression.replace(regex, JSON.stringify(variables[key]));
    });
    
    // Parse and evaluate the expression
    return this.parseExpression(processedExpression);
  }
  
  private static parseExpression(expr: string): any {
    expr = expr.trim();
    
    // Handle logical OR (lowest precedence)
    const orParts = this.splitByOperator(expr, '||');
    if (orParts.length > 1) {
      return orParts.some(part => this.parseExpression(part));
    }
    
    // Handle logical AND
    const andParts = this.splitByOperator(expr, '&&');
    if (andParts.length > 1) {
      return andParts.every(part => this.parseExpression(part));
    }
    
    // Handle comparisons
    for (const op of ['<=', '>=', '==', '!=', '<', '>']) {
      const parts = this.splitByOperator(expr, op);
      if (parts.length === 2) {
        const left = this.parseArithmetic(parts[0]);
        const right = this.parseArithmetic(parts[1]);
        return this.compare(left, op as ComparisonOperator, right);
      }
    }
    
    // Handle arithmetic or single value
    return this.parseArithmetic(expr);
  }
  
  private static parseArithmetic(expr: string): any {
    expr = expr.trim();
    
    // Handle addition/subtraction (lowest precedence in arithmetic)
    for (const op of ['+', '-']) {
      const parts = this.splitByOperator(expr, op, true);
      if (parts.length === 2) {
        const left = this.parseArithmetic(parts[0]);
        const right = this.parseArithmetic(parts[1]);
        return op === '+' ? left + right : left - right;
      }
    }
    
    // Handle multiplication/division
    for (const op of ['*', '/']) {
      const parts = this.splitByOperator(expr, op, true);
      if (parts.length === 2) {
        const left = this.parseArithmetic(parts[0]);
        const right = this.parseArithmetic(parts[1]);
        return op === '*' ? left * right : left / right;
      }
    }
    
    // Handle parentheses
    if (expr.startsWith('(') && expr.endsWith(')')) {
      return this.parseExpression(expr.slice(1, -1));
    }
    
    // Handle literals
    return this.parseLiteral(expr);
  }
  
  private static parseLiteral(expr: string): any {
    expr = expr.trim();
    
    // Boolean
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    
    // Null
    if (expr === 'null') return null;
    
    // Number
    const num = Number(expr);
    if (!isNaN(num)) return num;
    
    // String (with quotes)
    if ((expr.startsWith('"') && expr.endsWith('"')) || 
        (expr.startsWith("'") && expr.endsWith("'"))) {
      return JSON.parse(expr);
    }
    
    throw new Error(`Invalid literal: ${expr}`);
  }
  
  private static compare(left: any, op: ComparisonOperator, right: any): boolean {
    switch (op) {
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '==': return left == right;
      case '!=': return left != right;
      default: throw new Error(`Unknown comparison operator: ${op}`);
    }
  }
  
  private static splitByOperator(expr: string, operator: string, lastOccurrence = false): string[] {
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    const indices: number[] = [];
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      // Handle string boundaries
      if ((char === '"' || char === "'") && (i === 0 || expr[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        // Handle parentheses
        if (char === '(') depth++;
        if (char === ')') depth--;
        
        // Check for operator at current position
        if (depth === 0 && expr.substr(i, operator.length) === operator) {
          indices.push(i);
        }
      }
    }
    
    if (indices.length === 0) {
      return [expr];
    }
    
    const splitIndex = lastOccurrence ? indices[indices.length - 1] : indices[0];
    return [
      expr.substring(0, splitIndex).trim(),
      expr.substring(splitIndex + operator.length).trim()
    ];
  }
}

// Helper function for simple use cases
export function evaluateExpression(expression: string, variables: Record<string, any> = {}): any {
  return SafeExpressionEvaluator.evaluate(expression, variables);
}