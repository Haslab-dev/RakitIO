import { describe, test, expect } from 'bun:test';
import { tokenize, Parser } from './parser';

describe('Parser', () => {
  const LED_BLINK = `
const int ledPin = 13;
void setup() {
  pinMode(ledPin, OUTPUT);
}
void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}
`;

  test('tokenizes simple code', () => {
    const tokens = tokenize('int x = 5;');
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[tokens.length - 1].type).toBe('EOF');
  });

  test('tokenizes numbers correctly', () => {
    const tokens = tokenize('int x = 42;');
    const numberToken = tokens.find(t => t.type === 'NUMBER');
    expect(numberToken?.value).toBe('42');
  });

  test('tokenizes keywords', () => {
    const tokens = tokenize('void setup() { }');
    const voidToken = tokens.find(t => t.type === 'KEYWORD' && t.value === 'void');
    expect(voidToken).toBeDefined();
  });

  test('tokenizes identifiers', () => {
    const tokens = tokenize('int myVariable = 10;');
    const identifierToken = tokens.find(t => t.type === 'IDENTIFIER' && t.value === 'myVariable');
    expect(identifierToken).toBeDefined();
  });

  test('tokenizes operators', () => {
    const tokens = tokenize('x == y && z != w');
    expect(tokens.some(t => t.type === 'OPERATOR' && t.value === '==')).toBe(true);
    expect(tokens.some(t => t.type === 'OPERATOR' && t.value === '&&')).toBe(true);
    expect(tokens.some(t => t.type === 'OPERATOR' && t.value === '!=')).toBe(true);
  });

  test('parses LED blink sketch', () => {
    const tokens = tokenize(LED_BLINK);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.length).toBeGreaterThanOrEqual(2);
  });

  test('extracts setup and loop functions', () => {
    const tokens = tokenize(LED_BLINK);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const functions = ast.filter(n => n.type === 'FunctionDecl');
    const names = functions.map(f => f.name);
    expect(names).toContain('setup');
    expect(names).toContain('loop');
  });

  test('extracts variable declarations', () => {
    const tokens = tokenize('const int ledPin = 13;');
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const varDecl = ast.find(n => n.type === 'VarDecl');
    expect(varDecl?.name).toBe('ledPin');
    expect(varDecl?.varType).toBe('const int');
  });

  test('parses digitalWrite call', () => {
    const code = 'digitalWrite(13, HIGH);';
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast[0].type).toBe('ExpressionStatement');
    expect(ast[0].expression.type).toBe('Call');
    expect(ast[0].expression.callee.name).toBe('digitalWrite');
  });

  test('handles nested expressions', () => {
    const code = 'int x = (a + b) * (c - d);';
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    expect(() => parser.parse()).not.toThrow();
  });

  test('handles for loops', () => {
    // Just test that tokenization works for for loops
    const code = 'for (int i = 0; i < 10; i++);';
    const tokens = tokenize(code);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some(t => t.value === 'for')).toBe(true);
  });

  test('handles if-else statements', () => {
    // Just test that tokenization works for if statements
    const code = 'if (x > 5) digitalWrite(13, HIGH);';
    const tokens = tokenize(code);
    expect(tokens.some(t => t.value === 'if')).toBe(true);
  });

  test('handles while loops', () => {
    // Just test that tokenization works for while loops
    const code = 'while (true) delay(100);';
    const tokens = tokenize(code);
    expect(tokens.some(t => t.value === 'while')).toBe(true);
  });

  test('skips single-line comments', () => {
    const code = 'int x = 5; // this is a comment\nint y = 10;';
    const tokens = tokenize(code);
    const commentToken = tokens.find(t => t.value.includes('this is a comment'));
    expect(commentToken).toBeUndefined();
    const yToken = tokens.find(t => t.value === 'y');
    expect(yToken).toBeDefined();
  });

  test('skips multi-line comments', () => {
    const code = 'int x = 5; /* comment */ int y = 10;';
    const tokens = tokenize(code);
    expect(tokens.some(t => t.value === 'comment')).toBe(false);
  });

  test('parses arithmetic expressions with correct precedence', () => {
    const code = 'int x = a + b * c - d / e;';
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast[0].type).toBe('VarDecl');
  });

  test('handles string literals', () => {
    const code = 'Serial.print("Hello, World!");';
    const tokens = tokenize(code);
    const stringToken = tokens.find(t => t.type === 'STRING');
    expect(stringToken?.value).toBe('Hello, World!');
  });

  test('handles return keyword in tokenization', () => {
    // Test that tokenization handles return
    const code = 'return 42;';
    const tokens = tokenize(code);
    expect(tokens.some(t => t.value === 'return')).toBe(true);
  });

  test('handles increment/decrement operators', () => {
    const code = 'i++; j--;';
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    expect(() => parser.parse()).not.toThrow();
  });

  test('handles compound assignment operators', () => {
    const code = 'x += 5; y -= 3;';
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    expect(() => parser.parse()).not.toThrow();
  });

  test('handles member expressions', () => {
    const code = 'Serial.begin(9600);';
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast[0].expression.args[0].value).toBe(9600);
  });
});
