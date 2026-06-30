export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'OPERATOR'
  | 'PUNCTUATION'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

export interface ASTNode {
  type: string;
  line: number;
  [key: string]: any;
}

// C++ Keywords we recognize
const KEYWORDS = new Set([
  'void', 'int', 'float', 'double', 'char', 'bool', 'long', 'unsigned', 'short',
  'string', 'String', 'if', 'else', 'for', 'while', 'do', 'return', 'true', 'false',
  'const', 'define', 'include', 'class', 'struct'
]);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;

  while (i < code.length) {
    const char = code[i];

    // Handle newlines
    if (char === '\n') {
      line++;
      i++;
      continue;
    }

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Skip single-line comments
    if (char === '/' && code[i + 1] === '/') {
      i += 2;
      while (i < code.length && code[i] !== '\n') {
        i++;
      }
      continue;
    }

    // Skip multi-line comments
    if (char === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        if (code[i] === '\n') line++;
        i++;
      }
      i += 2;
      continue;
    }

    // Preprocessor directives (like #define or #include) - skip or tokenize simply
    if (char === '#') {
      let value = '';
      while (i < code.length && code[i] !== '\n') {
        value += code[i];
        i++;
      }
      // We can push it as a special comment or ignore
      continue;
    }

    // String literals
    if (char === '"') {
      let value = '';
      i++; // Skip opening quote
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') {
          value += code[i + 1];
          i += 2;
        } else {
          value += code[i];
          i++;
        }
      }
      i++; // Skip closing quote
      tokens.push({ type: 'STRING', value, line });
      continue;
    }

    // Character literals
    if (char === "'") {
      let value = '';
      i++;
      if (code[i] === '\\') {
        value = code[i] + code[i + 1];
        i += 2;
      } else {
        value = code[i];
        i++;
      }
      i++; // Skip closing quote
      tokens.push({ type: 'NUMBER', value: String(value.charCodeAt(0)), line }); // Convert char to ASCII code
      continue;
    }

    // Numbers
    if (/\d/.test(char) || (char === '.' && /\d/.test(code[i + 1] || ''))) {
      let value = '';
      while (i < code.length && (/\d/.test(code[i]) || code[i] === '.' || code[i].toLowerCase() === 'u' || code[i].toLowerCase() === 'l')) {
        value += code[i];
        i++;
      }
      // Remove C++ number suffixes like UL or L
      const cleanValue = value.replace(/[uUlL]+$/, '');
      tokens.push({ type: 'NUMBER', value: cleanValue, line });
      continue;
    }

    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        value += code[i];
        i++;
      }
      if (KEYWORDS.has(value)) {
        tokens.push({ type: 'KEYWORD', value, line });
      } else {
        tokens.push({ type: 'IDENTIFIER', value, line });
      }
      continue;
    }

    // Multi-character operators
    const next2 = code.substring(i, i + 2);
    if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/='].includes(next2)) {
      tokens.push({ type: 'OPERATOR', value: next2, line });
      i += 2;
      continue;
    }

    // Single character operators & punctuation
    if (['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '.', '?'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char, line });
      i++;
      continue;
    }

    if (['{', '}', '(', ')', '[', ']', ';', ',', ':'].includes(char)) {
      tokens.push({ type: 'PUNCTUATION', value: char, line });
      i++;
      continue;
    }

    // Unknown character, skip it
    i++;
  }

  tokens.push({ type: 'EOF', value: '', line });
  return tokens;
}

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType, value?: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value !== undefined && token.value !== value) return false;
    return true;
  }

  private match(type: TokenType, value?: string): boolean {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: TokenType, message: string, value?: string): Token {
    if (this.check(type, value)) return this.advance();
    throw new Error(`[Parser Line ${this.peek().line}] ${message} (Got: ${this.peek().value})`);
  }

  public parse(): ASTNode[] {
    const statements: ASTNode[] = [];
    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseDeclarationOrGlobal();
        if (stmt) statements.push(stmt);
      } catch (err) {
        console.error(err);
        // Error recovery: skip to next semicolon or brace
        this.synchronize();
      }
    }
    return statements;
  }

  private synchronize() {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().value === ';') return;
      switch (this.peek().value) {
        case 'class':
        case 'struct':
        case 'void':
        case 'int':
        case 'float':
        case 'double':
        case 'char':
        case 'bool':
        case 'for':
        case 'if':
        case 'while':
        case 'return':
          return;
      }
      this.advance();
    }
  }

  private parseDeclarationOrGlobal(): ASTNode | null {
    // Skip empty semicolons
    if (this.match('PUNCTUATION', ';')) return null;

    const line = this.peek().line;

    // Check if it's a function or variable declaration
    if (this.check('KEYWORD') || (this.check('IDENTIFIER') && this.checkNextType())) {
      const typeToken = this.advance(); // The type (e.g. void, int)
      let typeName = typeToken.value;

      // Handle modifiers like unsigned long, const int
      if (typeName === 'unsigned' || typeName === 'const') {
        if (this.check('KEYWORD') || this.check('IDENTIFIER')) {
          typeName += ' ' + this.advance().value;
        }
      }

      const nameToken = this.consume('IDENTIFIER', 'Expect identifier after type');
      const name = nameToken.value;

      // If followed by '(', it is a function declaration
      if (this.match('PUNCTUATION', '(')) {
        const params: { name: string; type: string }[] = [];
        if (!this.check('PUNCTUATION', ')')) {
          do {
            const pType = this.consume('KEYWORD', 'Expect parameter type').value;
            const pName = this.consume('IDENTIFIER', 'Expect parameter name').value;
            params.push({ name: pName, type: pType });
          } while (this.match('PUNCTUATION', ','));
        }
        this.consume('PUNCTUATION', "Expect ')' after parameters", ')');
        
        // Parse body
        this.consume('PUNCTUATION', "Expect '{' to start function body", '{');
        const body = this.parseBlock();
        
        return {
          type: 'FunctionDecl',
          name,
          returnType: typeName,
          params,
          body,
          line
        };
      }

      // Otherwise, it is a variable declaration
      let initializer: ASTNode | undefined;
      if (this.match('OPERATOR', '=')) {
        initializer = this.parseExpression();
      }
      this.consume('PUNCTUATION', "Expect ';' after variable declaration", ';');

      return {
        type: 'VarDecl',
        name,
        varType: typeName,
        initializer,
        line
      };
    }

    // Fallback to normal statement
    return this.parseStatement();
  }

  private checkNextType(): boolean {
    if (this.current + 1 >= this.tokens.length) return false;
    return this.tokens[this.current + 1].type === 'IDENTIFIER';
  }

  private parseStatement(): ASTNode {
    const line = this.peek().line;

    if (this.match('PUNCTUATION', '{')) {
      return {
        type: 'Block',
        statements: this.parseBlock(),
        line
      };
    }

    if (this.match('KEYWORD', 'if')) {
      this.consume('PUNCTUATION', "Expect '(' after 'if'", '(');
      const condition = this.parseExpression();
      this.consume('PUNCTUATION', "Expect ')' after if condition", ')');
      
      const consequent = this.parseStatement();
      let alternate: ASTNode | undefined;
      if (this.match('KEYWORD', 'else')) {
        alternate = this.parseStatement();
      }
      return {
        type: 'If',
        condition,
        consequent,
        alternate,
        line
      };
    }

    if (this.match('KEYWORD', 'while')) {
      this.consume('PUNCTUATION', "Expect '(' after 'while'", '(');
      const condition = this.parseExpression();
      this.consume('PUNCTUATION', "Expect ')' after while condition", ')');
      const body = this.parseStatement();
      return {
        type: 'While',
        condition,
        body,
        line
      };
    }

    if (this.match('KEYWORD', 'for')) {
      this.consume('PUNCTUATION', "Expect '(' after 'for'", '(');
      
      let init: ASTNode | null = null;
      if (!this.match('PUNCTUATION', ';')) {
        if (this.check('KEYWORD') || (this.check('IDENTIFIER') && this.checkNextType())) {
          const typeToken = this.advance();
          const name = this.consume('IDENTIFIER', 'Expect variable name').value;
          this.consume('OPERATOR', "Expect '=' in loop variable initialization", '=');
          const initializer = this.parseExpression();
          init = {
            type: 'VarDecl',
            name,
            varType: typeToken.value,
            initializer,
            line: typeToken.line
          };
        } else {
          init = this.parseExpression();
        }
        this.consume('PUNCTUATION', "Expect ';' after loop initialization", ';');
      }

      let condition: ASTNode | null = null;
      if (!this.match('PUNCTUATION', ';')) {
        condition = this.parseExpression();
        this.consume('PUNCTUATION', "Expect ';' after loop condition", ';');
      }

      let update: ASTNode | null = null;
      if (!this.match('PUNCTUATION', ')')) {
        update = this.parseExpression();
        this.consume('PUNCTUATION', "Expect ')' after loop update", ')');
      }

      const body = this.parseStatement();

      return {
        type: 'For',
        init,
        condition,
        update,
        body,
        line
      };
    }

    if (this.match('KEYWORD', 'return')) {
      let value: ASTNode | undefined;
      if (!this.check('PUNCTUATION', ';')) {
        value = this.parseExpression();
      }
      this.consume('PUNCTUATION', "Expect ';' after return value", ';');
      return {
        type: 'Return',
        value,
        line
      };
    }

    // Expression statement
    const expr = this.parseExpression();
    this.consume('PUNCTUATION', "Expect ';' after expression", ';');
    return {
      type: 'ExpressionStatement',
      expression: expr,
      line
    };
  }

  private parseBlock(): ASTNode[] {
    const statements: ASTNode[] = [];
    while (!this.check('PUNCTUATION', '}') && !this.isAtEnd()) {
      const stmt = this.parseDeclarationOrGlobal();
      if (stmt) statements.push(stmt);
    }
    this.consume('PUNCTUATION', "Expect '}' to close block", '}');
    return statements;
  }

  // --- EXPRESSION PARSING (Pratt Parser / Operator Precedence) ---

  private parseExpression(): ASTNode {
    return this.parseAssignment();
  }

  private parseAssignment(): ASTNode {
    const expr = this.parseLogicalOr();

    if (this.match('OPERATOR', '=')) {
      const equals = this.previous();
      const value = this.parseAssignment();

      if (expr.type === 'Identifier') {
        return {
          type: 'Assign',
          name: expr.name,
          value,
          line: equals.line
        };
      } else if (expr.type === 'MemberExpr') {
        return {
          type: 'MemberAssign',
          object: expr.object,
          property: expr.property,
          value,
          line: equals.line
        };
      }
      throw new Error(`[Parser Line ${equals.line}] Invalid assignment target.`);
    }

    if (['+=', '-=', '*=', '/='].includes(this.peek().value) && this.peek().type === 'OPERATOR') {
      const opToken = this.advance();
      const value = this.parseAssignment();
      
      // Convert e.g. x += 1 to x = x + 1
      const mathOp = opToken.value.slice(0, -1); // '+' or '-' etc

      if (expr.type === 'Identifier') {
        return {
          type: 'Assign',
          name: expr.name,
          value: {
            type: 'Binary',
            operator: mathOp,
            left: expr,
            right: value,
            line: opToken.line
          },
          line: opToken.line
        };
      }
      throw new Error(`[Parser Line ${opToken.line}] Invalid compound assignment target.`);
    }

    return expr;
  }

  private parseLogicalOr(): ASTNode {
    let expr = this.parseLogicalAnd();
    while (this.match('OPERATOR', '||')) {
      const op = this.previous();
      const right = this.parseLogicalAnd();
      expr = {
        type: 'Logical',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  private parseLogicalAnd(): ASTNode {
    let expr = this.parseEquality();
    while (this.match('OPERATOR', '&&')) {
      const op = this.previous();
      const right = this.parseEquality();
      expr = {
        type: 'Logical',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  private parseEquality(): ASTNode {
    let expr = this.parseComparison();
    while (this.match('OPERATOR', '==') || this.match('OPERATOR', '!=')) {
      const op = this.previous();
      const right = this.parseComparison();
      expr = {
        type: 'Binary',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  private parseComparison(): ASTNode {
    let expr = this.parseTerm();
    while (
      this.match('OPERATOR', '<') ||
      this.match('OPERATOR', '>') ||
      this.match('OPERATOR', '<=') ||
      this.match('OPERATOR', '>=')
    ) {
      const op = this.previous();
      const right = this.parseTerm();
      expr = {
        type: 'Binary',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  private parseTerm(): ASTNode {
    let expr = this.parseFactor();
    while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
      const op = this.previous();
      const right = this.parseFactor();
      expr = {
        type: 'Binary',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  private parseFactor(): ASTNode {
    let expr = this.parseUnary();
    while (this.match('OPERATOR', '*') || this.match('OPERATOR', '/') || this.match('OPERATOR', '%')) {
      const op = this.previous();
      const right = this.parseUnary();
      expr = {
        type: 'Binary',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  private parseUnary(): ASTNode {
    if (this.match('OPERATOR', '!') || this.match('OPERATOR', '-')) {
      const op = this.previous();
      const right = this.parseUnary();
      return {
        type: 'Unary',
        operator: op.value,
        right,
        line: op.line
      };
    }

    if (this.match('OPERATOR', '++') || this.match('OPERATOR', '--')) {
      const op = this.previous();
      const right = this.parseUnary();
      // Prefix increment/decrement
      return {
        type: 'PrefixUpdate',
        operator: op.value,
        right,
        line: op.line
      };
    }

    return this.parseCallOrMember();
  }

  private parseCallOrMember(): ASTNode {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match('PUNCTUATION', '(')) {
        expr = this.finishCall(expr);
      } else if (this.match('OPERATOR', '.')) {
        const prop = this.consume('IDENTIFIER', 'Expect property name after .');
        expr = {
          type: 'MemberExpr',
          object: expr,
          property: prop.value,
          line: prop.line
        };
      } else if (this.match('OPERATOR', '++') || this.match('OPERATOR', '--')) {
        // Postfix increment/decrement
        expr = {
          type: 'PostfixUpdate',
          operator: this.previous().value,
          left: expr,
          line: this.previous().line
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: ASTNode): ASTNode {
    const args: ASTNode[] = [];
    if (!this.check('PUNCTUATION', ')')) {
      do {
        args.push(this.parseExpression());
      } while (this.match('PUNCTUATION', ','));
    }
    const rparen = this.consume('PUNCTUATION', "Expect ')' after arguments", ')');
    return {
      type: 'Call',
      callee,
      args,
      line: rparen.line
    };
  }

  private parsePrimary(): ASTNode {
    const line = this.peek().line;

    if (this.match('KEYWORD', 'false')) return { type: 'Literal', value: false, line };
    if (this.match('KEYWORD', 'true')) return { type: 'Literal', value: true, line };
    
    if (this.match('NUMBER')) {
      const val = this.previous().value;
      const num = val.includes('.') ? parseFloat(val) : parseInt(val, 10);
      return { type: 'Literal', value: num, line };
    }

    if (this.match('STRING')) {
      return { type: 'Literal', value: this.previous().value, line };
    }

    if (this.match('IDENTIFIER')) {
      return { type: 'Identifier', name: this.previous().value, line };
    }

    if (this.match('PUNCTUATION', '(')) {
      const expr = this.parseExpression();
      this.consume('PUNCTUATION', "Expect ')' after expression", ')');
      return expr;
    }

    throw new Error(`[Parser Line ${line}] Expect expression, got '${this.peek().value}'`);
  }
}
