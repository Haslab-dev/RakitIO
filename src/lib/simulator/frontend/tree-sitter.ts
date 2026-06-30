export interface Point {
  row: number;
  column: number;
}

export interface SyntaxNode {
  type: string;
  text: string;
  children: SyntaxNode[];
  startPosition: Point;
  endPosition: Point;
}

// A pure-TS parser that produces a Tree-sitter C++ compatible AST.
// This allows drop-in replacement with web-tree-sitter later.
export function parse(code: string): SyntaxNode {
  // --- Preprocessor: extract & substitute simple object-like #define macros
  // (e.g. #define LED_PIN 13, #define BME_ADDR 0x76). Function-like macros and
  // multi-line macros are ignored. Substitution is whole-word.
  const defines = new Map<string, string>();
  const rawLines = code.split('\n');
  for (const line of rawLines) {
    const m = line.match(/^\s*#\s*define\s+([A-Za-z_]\w*)\s+(.+?)\s*$/);
    if (m && !m[2].includes('(')) {
      defines.set(m[1], m[2]);
    }
  }
  let src = code;
  if (defines.size > 0) {
    // Remove the #define lines themselves
    src = rawLines.filter((l) => !/^\s*#\s*define/.test(l)).join('\n');
    // Substitute (a few passes to resolve macros referencing other macros)
    for (let pass = 0; pass < 4; pass++) {
      let changed = false;
      for (const [k, v] of defines) {
        const re = new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
        if (re.test(src)) {
          src = src.replace(re, v);
          changed = true;
        }
      }
      if (!changed) break;
    }
    code = src;
  }

  const tokens: Token[] = [];
  let i = 0;
  let row = 0;
  let col = 0;

  function advanceChar() {
    const c = code[i];
    if (c === '\n') {
      row++;
      col = 0;
    } else {
      col++;
    }
    i++;
    return c;
  }

  interface Token {
    type: string;
    text: string;
    start: Point;
    end: Point;
  }

  // Tokenize C++ code
  while (i < code.length) {
    const start: Point = { row, column: col };
    const char = code[i];

    if (char === '\n' || /\s/.test(char)) {
      advanceChar();
      continue;
    }

    // Comments
    if (char === '/' && code[i + 1] === '/') {
      let text = '';
      while (i < code.length && code[i] !== '\n') {
        text += advanceChar();
      }
      tokens.push({ type: 'comment', text, start, end: { row, column: col } });
      continue;
    }

    if (char === '/' && code[i + 1] === '*') {
      let text = '';
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        text += advanceChar();
      }
      text += advanceChar(); // *
      text += advanceChar(); // /
      tokens.push({ type: 'comment', text, start, end: { row, column: col } });
      continue;
    }

    // Preprocessor
    if (char === '#') {
      let text = '';
      while (i < code.length && code[i] !== '\n') {
        text += advanceChar();
      }
      tokens.push({ type: 'preproc_directive', text, start, end: { row, column: col } });
      continue;
    }

    // String literals
    if (char === '"') {
      let text = advanceChar(); // "
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') {
          text += advanceChar() + advanceChar();
        } else {
          text += advanceChar();
        }
      }
      if (i < code.length) text += advanceChar(); // "
      tokens.push({ type: 'string_literal', text, start, end: { row, column: col } });
      continue;
    }

    // Numbers
    if (/\d/.test(char)) {
      let text = '';
      // Hex literal (0x...)
      if (char === '0' && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
        text += advanceChar(); // 0
        text += advanceChar(); // x
        while (i < code.length && /[0-9a-fA-F]/.test(code[i])) {
          text += advanceChar();
        }
      } else {
        while (i < code.length && (/\d/.test(code[i]) || code[i] === '.' || code[i].toLowerCase() === 'u' || code[i].toLowerCase() === 'l')) {
          text += advanceChar();
        }
      }
      tokens.push({ type: 'number_literal', text, start, end: { row, column: col } });
      continue;
    }

    // Identifiers
    if (/[a-zA-Z_]/.test(char)) {
      let text = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        text += advanceChar();
      }
      tokens.push({ type: 'identifier', text, start, end: { row, column: col } });
      continue;
    }

    // Double char operators
    const next2 = code.substring(i, i + 2);
    if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/='].includes(next2)) {
      advanceChar();
      advanceChar();
      tokens.push({ type: 'operator', text: next2, start, end: { row, column: col } });
      continue;
    }

    // Single char punctuation/operators
    advanceChar();
    tokens.push({ type: char, text: char, start, end: { row, column: col } });
  }

  // Parser State
  let tokenIdx = 0;
  
  function peek(): Token {
    return tokens[tokenIdx] || { type: 'EOF', text: '', start: { row, column: col }, end: { row, column: col } };
  }

  function advanceToken(): Token {
    const t = peek();
    if (tokenIdx < tokens.length) tokenIdx++;
    return t;
  }

  function match(type: string, text?: string): boolean {
    const t = peek();
    if (t.type === type && (text === undefined || t.text === text)) {
      advanceToken();
      return true;
    }
    return false;
  }

  function consume(type: string, msg: string, text?: string): Token {
    const t = peek();
    if (t.type === type && (text === undefined || t.text === text)) {
      return advanceToken();
    }
    throw new Error(`[Parser] ${msg} at line ${t.start.row + 1}. Expected: ${type} '${text || ''}', Got: ${t.type} '${t.text}'`);
  }

  // AST Builders
  function parseBlock(): SyntaxNode {
    const startNode = consume('{', 'Expect { to start block');
    const children: SyntaxNode[] = [];
    while (peek().type !== '}' && peek().type !== 'EOF') {
      children.push(parseStatement());
    }
    const endNode = consume('}', 'Expect } to close block');
    return {
      type: 'compound_statement',
      text: code.substring(getOffset(startNode.start), getOffset(endNode.end)),
      children,
      startPosition: startNode.start,
      endPosition: endNode.end,
    };
  }

  function parseStatement(): SyntaxNode {
    const t = peek();
    const start = t.start;

    if (t.type === '{') {
      return parseBlock();
    }

    if (t.type === 'identifier' && t.text === 'if') {
      advanceToken();
      consume('(', "Expect '(' after 'if'");
      const condition = parseExpression();
      consume(')', "Expect ')' after if condition");
      const consequent = parseStatement();
      let alternate: SyntaxNode | null = null;
      if (peek().type === 'identifier' && peek().text === 'else') {
        advanceToken();
        alternate = parseStatement();
      }
      const children = [condition, consequent];
      if (alternate) children.push(alternate);

      return {
        type: 'if_statement',
        text: 'if',
        children,
        startPosition: start,
        endPosition: children[children.length - 1].endPosition,
      };
    }

    if (t.type === 'identifier' && t.text === 'while') {
      advanceToken();
      consume('(', "Expect '(' after 'while'");
      const condition = parseExpression();
      consume(')', "Expect ')' after while condition");
      const body = parseStatement();
      return {
        type: 'while_statement',
        text: 'while',
        children: [condition, body],
        startPosition: start,
        endPosition: body.endPosition,
      };
    }

    if (t.type === 'identifier' && t.text === 'for') {
      advanceToken();
      consume('(', "Expect '(' after 'for'");
      
      let init: SyntaxNode | null = null;
      if (peek().type !== ';') {
        init = parseDeclarationOrExpression();
      } else {
        consume(';', "Expect ';'");
      }

      let condition: SyntaxNode | null = null;
      if (peek().type !== ';') {
        condition = parseExpression();
      }
      consume(';', "Expect ';'");

      let update: SyntaxNode | null = null;
      if (peek().type !== ')') {
        update = parseExpression();
      }
      consume(')', "Expect ')'");

      const body = parseStatement();
      const children: SyntaxNode[] = [];
      if (init) children.push(init);
      if (condition) children.push(condition);
      if (update) children.push(update);
      children.push(body);

      return {
        type: 'for_statement',
        text: 'for',
        children,
        startPosition: start,
        endPosition: body.endPosition,
      };
    }

    if (t.type === 'identifier' && t.text === 'return') {
      const retToken = advanceToken();
      let value: SyntaxNode | null = null;
      if (peek().type !== ';') {
        value = parseExpression();
      }
      const semiToken = consume(';', "Expect ';' after return");
      return {
        type: 'return_statement',
        text: 'return',
        children: value ? [value] : [],
        startPosition: retToken.start,
        endPosition: semiToken.end,
      };
    }

    // Check if declaration (type followed by identifier)
    if (isTypeToken(t)) {
      return parseDeclaration();
    }

    // Expression statement
    const expr = parseExpression();
    const semiToken = consume(';', "Expect ';' after expression");
    return {
      type: 'expression_statement',
      text: expr.text,
      children: [expr],
      startPosition: start,
      endPosition: semiToken.end,
    };
  }

  function isTypeToken(t: Token): boolean {
    const types = ['void', 'int', 'float', 'double', 'char', 'bool', 'long', 'unsigned', 'short', 'String', 'uint8_t', 'uint16_t', 'uint32_t', 'size_t'];
    return t.type === 'identifier' && types.includes(t.text);
  }

  function parseDeclarationOrExpression(): SyntaxNode {
    if (isTypeToken(peek())) {
      return parseDeclaration();
    }
    const expr = parseExpression();
    consume(';', "Expect ';'");
    return expr;
  }

  function parseDeclaration(): SyntaxNode {
    const start = peek().start;
    const typeToken = advanceToken(); // type
    const nameToken = consume('identifier', 'Expect variable name');
    
    let init: SyntaxNode | null = null;
    if (match('=')) {
      init = parseExpression();
    }
    
    const semiToken = consume(';', "Expect ';'");
    
    const declarator: SyntaxNode = {
      type: 'init_declarator',
      text: nameToken.text,
      children: init ? [init] : [],
      startPosition: nameToken.start,
      endPosition: init ? init.endPosition : nameToken.end,
    };

    return {
      type: 'declaration',
      text: typeToken.text + ' ' + nameToken.text,
      children: [
        { type: 'type_identifier', text: typeToken.text, children: [], startPosition: typeToken.start, endPosition: typeToken.end },
        declarator
      ],
      startPosition: start,
      endPosition: semiToken.end,
    };
  }

  function parseExpression(): SyntaxNode {
    return parseAssignment();
  }

  function parseAssignment(): SyntaxNode {
    const expr = parseLogical();
    if (['=', '+=', '-=', '*=', '/='].includes(peek().text)) {
      const opToken = advanceToken();
      const right = parseAssignment();
      return {
        type: 'assignment_expression',
        text: opToken.text,
        children: [expr, right],
        startPosition: expr.startPosition,
        endPosition: right.endPosition,
      };
    }
    return expr;
  }

  function parseLogical(): SyntaxNode {
    let expr = parseEquality();
    while (['&&', '||'].includes(peek().text)) {
      const opToken = advanceToken();
      const right = parseEquality();
      expr = {
        type: 'binary_expression',
        text: opToken.text,
        children: [expr, right],
        startPosition: expr.startPosition,
        endPosition: right.endPosition,
      };
    }
    return expr;
  }

  function parseEquality(): SyntaxNode {
    let expr = parseComparison();
    while (['==', '!='].includes(peek().text)) {
      const opToken = advanceToken();
      const right = parseComparison();
      expr = {
        type: 'binary_expression',
        text: opToken.text,
        children: [expr, right],
        startPosition: expr.startPosition,
        endPosition: right.endPosition,
      };
    }
    return expr;
  }

  function parseComparison(): SyntaxNode {
    let expr = parseTerm();
    while (['<', '>', '<=', '>='].includes(peek().text)) {
      const opToken = advanceToken();
      const right = parseTerm();
      expr = {
        type: 'binary_expression',
        text: opToken.text,
        children: [expr, right],
        startPosition: expr.startPosition,
        endPosition: right.endPosition,
      };
    }
    return expr;
  }

  function parseTerm(): SyntaxNode {
    let expr = parseFactor();
    while (['+', '-'].includes(peek().text)) {
      const opToken = advanceToken();
      const right = parseFactor();
      expr = {
        type: 'binary_expression',
        text: opToken.text,
        children: [expr, right],
        startPosition: expr.startPosition,
        endPosition: right.endPosition,
      };
    }
    return expr;
  }

  function parseFactor(): SyntaxNode {
    let expr = parseUnary();
    while (['*', '/', '%'].includes(peek().text)) {
      const opToken = advanceToken();
      const right = parseUnary();
      expr = {
        type: 'binary_expression',
        text: opToken.text,
        children: [expr, right],
        startPosition: expr.startPosition,
        endPosition: right.endPosition,
      };
    }
    return expr;
  }

  function parseUnary(): SyntaxNode {
    if (['!', '-', '++', '--'].includes(peek().text)) {
      const opToken = advanceToken();
      const right = parseUnary();
      return {
        type: 'update_expression',
        text: opToken.text,
        children: [right],
        startPosition: opToken.start,
        endPosition: right.endPosition,
      };
    }
    return parseCallOrMember();
  }

  function parseCallOrMember(): SyntaxNode {
    let expr = parsePrimary();

    while (true) {
      if (peek().type === '(') {
        advanceToken(); // (
        const args: SyntaxNode[] = [];
        if (peek().type !== ')') {
          do {
            args.push(parseExpression());
          } while (match(','));
        }
        const rparen = consume(')', "Expect ')'");
        expr = {
          type: 'call_expression',
          text: 'call',
          children: [expr, ...args],
          startPosition: expr.startPosition,
          endPosition: rparen.end,
        };
      } else if (peek().type === '.') {
        advanceToken(); // .
        const propToken = consume('identifier', 'Expect member property name');
        expr = {
          type: 'field_expression',
          text: propToken.text,
          children: [expr],
          startPosition: expr.startPosition,
          endPosition: propToken.end,
        };
      } else if (['++', '--'].includes(peek().text)) {
        const opToken = advanceToken();
        expr = {
          type: 'update_expression',
          text: opToken.text,
          children: [expr],
          startPosition: expr.startPosition,
          endPosition: opToken.end,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  function parsePrimary(): SyntaxNode {
    const t = peek();
    if (t.type === 'number_literal') {
      advanceToken();
      return { type: 'number_literal', text: t.text, children: [], startPosition: t.start, endPosition: t.end };
    }
    if (t.type === 'string_literal') {
      advanceToken();
      return { type: 'string_literal', text: t.text, children: [], startPosition: t.start, endPosition: t.end };
    }
    if (t.type === 'identifier') {
      advanceToken();
      return { type: 'identifier', text: t.text, children: [], startPosition: t.start, endPosition: t.end };
    }
    if (t.type === '(') {
      advanceToken();
      const expr = parseExpression();
      consume(')', "Expect ')'");
      return expr;
    }
    throw new Error(`[Parser] Unexpected token: ${t.type} '${t.text}' at line ${t.start.row + 1}`);
  }

  function getOffset(p: Point): number {
    let offset = 0;
    let r = 0;
    let c = 0;
    while (offset < code.length && (r < p.row || (r === p.row && c < p.column))) {
      if (code[offset] === '\n') {
        r++;
        c = 0;
      } else {
        c++;
      }
      offset++;
    }
    return offset;
  }

  // Parse Global translation unit
  const rootChildren: SyntaxNode[] = [];
  while (tokenIdx < tokens.length) {
    if (peek().type === 'preproc_directive') {
      const pt = advanceToken();
      rootChildren.push({ type: 'preproc_directive', text: pt.text, children: [], startPosition: pt.start, endPosition: pt.end });
      continue;
    }

    // Parse global declarations or functions
    if (isTypeToken(peek())) {
      const start = peek().start;
      const typeToken = advanceToken(); // void / int
      const nameToken = consume('identifier', 'Expect name');
      
      if (peek().type === '(') {
        // Function definition
        advanceToken(); // (
        const params: SyntaxNode[] = [];
        if (peek().type !== ')') {
          do {
            const pType = consume('identifier', 'Expect parameter type');
            const pName = consume('identifier', 'Expect parameter name');
            params.push({
              type: 'parameter_declaration',
              text: pType.text + ' ' + pName.text,
              children: [
                { type: 'type_identifier', text: pType.text, children: [], startPosition: pType.start, endPosition: pType.end },
                { type: 'identifier', text: pName.text, children: [], startPosition: pName.start, endPosition: pName.end }
              ],
              startPosition: pType.start,
              endPosition: pName.end,
            });
          } while (match(','));
        }
        consume(')', "Expect ')' after parameters");
        
        const body = parseBlock();
        
        rootChildren.push({
          type: 'function_definition',
          text: typeToken.text + ' ' + nameToken.text,
          children: [
            { type: 'type_identifier', text: typeToken.text, children: [], startPosition: typeToken.start, endPosition: typeToken.end },
            { type: 'identifier', text: nameToken.text, children: [], startPosition: nameToken.start, endPosition: nameToken.end },
            { type: 'parameter_list', text: 'params', children: params, startPosition: start, endPosition: nameToken.end },
            body
          ],
          startPosition: start,
          endPosition: body.endPosition,
        });
      } else {
        // Global Variable
        let init: SyntaxNode | null = null;
        if (match('=')) {
          init = parseExpression();
        }
        const semiToken = consume(';', "Expect ';'");
        rootChildren.push({
          type: 'declaration',
          text: typeToken.text + ' ' + nameToken.text,
          children: [
            { type: 'type_identifier', text: typeToken.text, children: [], startPosition: typeToken.start, endPosition: typeToken.end },
            {
              type: 'init_declarator',
              text: nameToken.text,
              children: init ? [init] : [],
              startPosition: nameToken.start,
              endPosition: init ? init.endPosition : nameToken.end,
            }
          ],
          startPosition: start,
          endPosition: semiToken.end,
        });
      }
    } else {
      advanceToken(); // skip unknown global token to avoid infinite loop
    }
  }

  return {
    type: 'translation_unit',
    text: code,
    children: rootChildren,
    startPosition: { row: 0, column: 0 },
    endPosition: { row, column: col },
  };
}
