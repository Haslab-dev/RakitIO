export interface ParsedCode {
  includes: string[];
  defines: { name: string; value: string }[];
  globals: { name: string; type: string; value?: string }[];
  setup: string;
  loop: string;
  functions: { name: string; returnType: string; params: string; body: string }[];
  pinModes: { pin: string; mode: string }[];
  serialBegin: { baudRate: number } | null;
}

function stripComments(code: string): string {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

function extractBlock(code: string, startIndex: number): { body: string; endIndex: number } {
  let depth = 0;
  let started = false;
  let i = startIndex;

  while (i < code.length) {
    const ch = code[i];
    if (ch === '{') {
      depth++;
      started = true;
    } else if (ch === '}') {
      depth--;
      if (started && depth === 0) {
        return { body: code.substring(startIndex, i + 1), endIndex: i + 1 };
      }
    }
    i++;
  }

  return { body: code.substring(startIndex), endIndex: code.length };
}

export function parseArduinoCode(code: string): ParsedCode {
  const cleaned = stripComments(code);

  const result: ParsedCode = {
    includes: [],
    defines: [],
    globals: [],
    setup: '',
    loop: '',
    functions: [],
    pinModes: [],
    serialBegin: null,
  };

  const includeRegex = /#include\s*[<"]([^>"]+)[>"]/g;
  let match: RegExpExecArray | null;
  while ((match = includeRegex.exec(cleaned)) !== null) {
    result.includes.push(match[1]);
  }

  const defineRegex = /#define\s+(\w+)(?:\s+(.*))?$/gm;
  while ((match = defineRegex.exec(cleaned)) !== null) {
    result.defines.push({
      name: match[1],
      value: (match[2] ?? '').trim(),
    });
  }

  const funcRegex = /(\w[\w\s\*]*?)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
  while ((match = funcRegex.exec(cleaned)) !== null) {
    const returnType = match[1].trim();
    const funcName = match[2];
    const params = match[3].trim();
    const blockStart = match.index + match[0].length - 1;
    const { body } = extractBlock(cleaned, blockStart);
    const fullBody = '{' + body;

    if (funcName === 'setup') {
      result.setup = fullBody;
    } else if (funcName === 'loop') {
      result.loop = fullBody;
    } else if (returnType !== '' && !['if', 'else', 'for', 'while', 'switch', 'do'].includes(funcName)) {
      result.functions.push({
        name: funcName,
        returnType,
        params,
        body: fullBody,
      });
    }
  }

  const globalRegex = /^(?!.*\()(int|float|double|char|bool|boolean|unsigned\s+\w+|long|short|byte|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t|String|const\s+\w+|volatile\s+\w+|static\s+\w+)\s+(\w+)(?:\s*=\s*([^;]+))?\s*;/gm;
  while ((match = globalRegex.exec(cleaned)) !== null) {
    const beforeMatch = cleaned.substring(0, match.index);
    const lastOpenBrace = beforeMatch.lastIndexOf('{');
    const lastCloseBrace = beforeMatch.lastIndexOf('}');
    if (lastOpenBrace > lastCloseBrace) {
      continue;
    }

    result.globals.push({
      type: match[1].trim(),
      name: match[2],
      value: match[3]?.trim(),
    });
  }

  const pinModeRegex = /pinMode\s*\(\s*([^,]+),\s*(\w+)\s*\)/g;
  while ((match = pinModeRegex.exec(cleaned)) !== null) {
    result.pinModes.push({
      pin: match[1].trim(),
      mode: match[2].trim(),
    });
  }

  const serialBeginRegex = /Serial\d*\.begin\s*\(\s*(\d+)\s*\)/;
  const serialMatch = serialBeginRegex.exec(cleaned);
  if (serialMatch) {
    result.serialBegin = { baudRate: parseInt(serialMatch[1], 10) };
  }

  return result;
}

export function generateArduinoCode(parsed: ParsedCode): string {
  const lines: string[] = [];

  for (const inc of parsed.includes) {
    lines.push(`#include <${inc}>`);
  }

  if (parsed.includes.length > 0) {
    lines.push('');
  }

  for (const def of parsed.defines) {
    if (def.value) {
      lines.push(`#define ${def.name} ${def.value}`);
    } else {
      lines.push(`#define ${def.name}`);
    }
  }

  if (parsed.defines.length > 0) {
    lines.push('');
  }

  for (const g of parsed.globals) {
    if (g.value !== undefined) {
      lines.push(`${g.type} ${g.name} = ${g.value};`);
    } else {
      lines.push(`${g.type} ${g.name};`);
    }
  }

  if (parsed.globals.length > 0) {
    lines.push('');
  }

  for (const fn of parsed.functions) {
    lines.push(`${fn.returnType} ${fn.name}(${fn.params}) ${fn.body}`);
    lines.push('');
  }

  if (parsed.setup) {
    lines.push(`void setup() ${parsed.setup}`);
    lines.push('');
  }

  if (parsed.loop) {
    lines.push(`void loop() ${parsed.loop}`);
  }

  return lines.join('\n');
}

export function extractLibraries(code: string): string[] {
  const libraries: string[] = [];
  const regex = /#include\s*[<"]([^>"]+)[>"]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    const lib = match[1];
    if (lib.endsWith('.h')) {
      libraries.push(lib.slice(0, -2));
    } else {
      libraries.push(lib);
    }
  }

  return [...new Set(libraries)];
}

export function detectBoardFromCode(code: string): string | null {
  const boardIndicators: [RegExp, string][] = [
    [/ESP32|esp32|WiFi\.h|ESP\.h|analogReadResolution\s*\(\s*12\s*\)/i, 'esp32-devkit-v1'],
    [/ESP8266|esp8266|ESP8266WiFi\.h|A0\s*==\s*0/i, 'esp8266-nodemcu'],
    [/ARDUINO_AVR_MEGA|ATmega2560|54\s*digital/i, 'arduino-mega'],
    [/ARDUINO_AVR_NANO|ATmega328.*nano/i, 'arduino-nano'],
    [/RP2040|rp2040|PICO|pico/i, 'rpi-pico'],
  ];

  for (const [pattern, boardId] of boardIndicators) {
    if (pattern.test(code)) {
      return boardId;
    }
  }

  return null;
}
