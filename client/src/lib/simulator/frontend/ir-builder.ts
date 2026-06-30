import type { ASTNode } from './ast-adapter';
import type { Instruction, CompiledProgram } from '../vm/bytecode';

export class IRBuilder {
  private instructions: Instruction[] = [];
  private nextReg = 0;
  private labelCount = 0;
  private globals: Instruction[] = [];
  private functions: CompiledProgram['functions'] = {};

  constructor() {}

  private getReg(): string {
    return `R${this.nextReg++}`;
  }

  private resetRegs() {
    this.nextReg = 0;
  }

  private getLabel(): string {
    return `L${this.labelCount++}`;
  }

  public compile(ast: ASTNode): CompiledProgram {
    this.globals = [];
    this.functions = {};

    if (ast.type !== 'Program') {
      throw new Error('[IRBuilder] Root node must be a Program');
    }

    for (const node of ast.body) {
      if (node.type === 'FunctionDef') {
        this.instructions = [];
        this.resetRegs();
        this.compileFunction(node);
      } else if (node.type === 'VariableDecl') {
        this.instructions = this.globals;
        this.compileStatement(node);
        this.globals = this.instructions;
      } else {
        this.instructions = this.globals;
        this.compileStatement(node);
        this.globals = this.instructions;
      }
    }

    return {
      functions: this.functions,
      globals: this.globals,
    };
  }

  private compileFunction(node: ASTNode & { type: 'FunctionDef' }) {
    for (const stmt of node.body) {
      this.compileStatement(stmt);
    }
    // Ensure every function has a default return
    this.instructions.push({
      op: 'RET',
      args: ['R0'], // Default return value is R0
      line: node.line,
    });

    this.functions[node.name] = {
      params: node.params.map(p => p.name),
      instructions: [...this.instructions],
    };
  }

  private compileStatement(node: ASTNode) {
    const line = node.line;

    switch (node.type) {
      case 'Block': {
        for (const stmt of node.statements) {
          this.compileStatement(stmt);
        }
        break;
      }

      case 'VariableDecl': {
        if (node.initializer) {
          const reg = this.compileExpression(node.initializer);
          this.instructions.push({
            op: 'STORE',
            args: [node.name, reg],
            line,
          });
        }
        break;
      }

      case 'ExpressionStmt': {
        this.compileExpression(node.expression);
        this.resetRegs(); // Reuse registers after statement finishes
        break;
      }

      case 'If': {
        const condReg = this.compileExpression(node.condition);
        const elseLabel = this.getLabel();
        const endLabel = this.getLabel();

        // If cond is false, jump to else (or end)
        this.instructions.push({
          op: 'JMP_IF',
          args: [elseLabel, condReg, false], // Jump if false
          line,
        });

        this.compileStatement(node.consequent);
        this.instructions.push({
          op: 'JMP',
          args: [endLabel],
          line,
        });

        // Emit else label
        this.instructions.push({
          op: 'JMP', // We use JMP as a label marker in the instruction stream
          args: [elseLabel, 'LABEL'],
          line,
        });

        if (node.alternate) {
          this.compileStatement(node.alternate);
        }

        // Emit end label
        this.instructions.push({
          op: 'JMP',
          args: [endLabel, 'LABEL'],
          line,
        });

        this.resetRegs();
        break;
      }

      case 'While': {
        const startLabel = this.getLabel();
        const endLabel = this.getLabel();

        // Emit start label
        this.instructions.push({
          op: 'JMP',
          args: [startLabel, 'LABEL'],
          line,
        });

        const condReg = this.compileExpression(node.condition);
        this.instructions.push({
          op: 'JMP_IF',
          args: [endLabel, condReg, false], // Jump to end if condition is false
          line,
        });

        this.compileStatement(node.body);

        this.instructions.push({
          op: 'JMP',
          args: [startLabel],
          line,
        });

        // Emit end label
        this.instructions.push({
          op: 'JMP',
          args: [endLabel, 'LABEL'],
          line,
        });

        this.resetRegs();
        break;
      }

      case 'For': {
        const startLabel = this.getLabel();
        const endLabel = this.getLabel();

        if (node.init) {
          this.compileStatement(node.init);
        }

        // Emit start label
        this.instructions.push({
          op: 'JMP',
          args: [startLabel, 'LABEL'],
          line,
        });

        if (node.condition) {
          const condReg = this.compileExpression(node.condition);
          this.instructions.push({
            op: 'JMP_IF',
            args: [endLabel, condReg, false], // Jump to end if false
            line,
          });
        }

        this.compileStatement(node.body);

        if (node.update) {
          this.compileExpression(node.update);
        }

        this.instructions.push({
          op: 'JMP',
          args: [startLabel],
          line,
        });

        // Emit end label
        this.instructions.push({
          op: 'JMP',
          args: [endLabel, 'LABEL'],
          line,
        });

        this.resetRegs();
        break;
      }

      case 'Return': {
        let reg = 'R0';
        if (node.value) {
          reg = this.compileExpression(node.value);
        }
        this.instructions.push({
          op: 'RET',
          args: [reg],
          line,
        });
        this.resetRegs();
        break;
      }

      default:
        break;
    }
  }

  private compileExpression(node: ASTNode): string {
    const line = node.line;

    switch (node.type) {
      case 'Literal': {
        const reg = this.getReg();
        this.instructions.push({
          op: 'MOV',
          args: [reg, node.value],
          line,
        });
        return reg;
      }

      case 'Identifier': {
        const reg = this.getReg();
        this.instructions.push({
          op: 'LOAD',
          args: [reg, node.name],
          line,
        });
        return reg;
      }

      case 'Assignment': {
        const valReg = this.compileExpression(node.value);
        this.instructions.push({
          op: 'STORE',
          args: [node.name, valReg],
          line,
        });
        return valReg;
      }

      case 'MemberAssignment': {
        const valReg = this.compileExpression(node.value);
        const objReg = this.compileExpression(node.object);
        this.instructions.push({
          op: 'STORE',
          args: [`${objReg}.${node.property}`, valReg],
          line,
        });
        return valReg;
      }

      case 'Binary': {
        const leftReg = this.compileExpression(node.left);
        const rightReg = this.compileExpression(node.right);
        const destReg = this.getReg();
        this.instructions.push({
          op: 'OP',
          args: [destReg, node.operator, leftReg, rightReg],
          line,
        });
        return destReg;
      }

      case 'Unary': {
        // ++ / -- must write the result back to the variable (used heavily in for-loops).
        if ((node.operator === '++' || node.operator === '--') && node.right.type === 'Identifier') {
          const name = node.right.name;
          const curReg = this.getReg();
          this.instructions.push({ op: 'LOAD', args: [curReg, name], line });
          const resReg = this.getReg();
          this.instructions.push({ op: 'OP', args: [resReg, node.operator, curReg], line });
          this.instructions.push({ op: 'STORE', args: [name, resReg], line });
          return resReg;
        }
        const rightReg = this.compileExpression(node.right);
        const destReg = this.getReg();
        this.instructions.push({
          op: 'OP',
          args: [destReg, node.operator, rightReg],
          line,
        });
        return destReg;
      }

      case 'Call': {
        const argRegs = node.args.map(arg => this.compileExpression(arg));
        const destReg = this.getReg();

        let fnName = '';
        if (node.callee.type === 'Identifier') {
          fnName = node.callee.name;
        } else if (node.callee.type === 'MemberExpr') {
          const objName = node.callee.object.type === 'Identifier' ? node.callee.object.name : 'Unknown';
          fnName = `${objName}.${node.callee.property}`;
        }

        // Check if it's a built-in delay() which maps to a WAIT instruction
        if (fnName === 'delay' && argRegs.length > 0) {
          this.instructions.push({
            op: 'WAIT',
            args: [argRegs[0]],
            line,
          });
          this.instructions.push({
            op: 'MOV',
            args: [destReg, 0],
            line,
          });
        } else {
          this.instructions.push({
            op: 'CALL',
            args: [destReg, fnName, argRegs],
            line,
          });
        }
        return destReg;
      }

      case 'MemberExpr': {
        const objReg = this.compileExpression(node.object);
        const destReg = this.getReg();
        this.instructions.push({
          op: 'LOAD',
          args: [destReg, `${objReg}.${node.property}`],
          line,
        });
        return destReg;
      }

      default:
        return 'R0';
    }
  }
}
