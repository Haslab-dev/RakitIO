import type { SyntaxNode } from './tree-sitter';

export type ASTNode =
  | { type: 'Program'; body: ASTNode[]; line: number }
  | { type: 'FunctionDef'; name: string; returnType: string; params: { name: string; type: string }[]; body: ASTNode[]; line: number }
  | { type: 'VariableDecl'; name: string; varType: string; initializer?: ASTNode; line: number }
  | { type: 'Assignment'; name: string; value: ASTNode; operator: string; line: number }
  | { type: 'MemberAssignment'; object: ASTNode; property: string; value: ASTNode; operator: string; line: number }
  | { type: 'Call'; callee: ASTNode; args: ASTNode[]; line: number }
  | { type: 'MemberExpr'; object: ASTNode; property: string; line: number }
  | { type: 'If'; condition: ASTNode; consequent: ASTNode; alternate?: ASTNode; line: number }
  | { type: 'While'; condition: ASTNode; body: ASTNode; line: number }
  | { type: 'For'; init?: ASTNode; condition?: ASTNode; update?: ASTNode; body: ASTNode; line: number }
  | { type: 'Return'; value?: ASTNode; line: number }
  | { type: 'Block'; statements: ASTNode[]; line: number }
  | { type: 'Literal'; value: string | number | boolean; line: number }
  | { type: 'Identifier'; name: string; line: number }
  | { type: 'Binary'; operator: string; left: ASTNode; right: ASTNode; line: number }
  | { type: 'Unary'; operator: string; right: ASTNode; line: number }
  | { type: 'ExpressionStmt'; expression: ASTNode; line: number };

export function adapt(node: SyntaxNode): ASTNode {
  const line = node.startPosition.row;

  switch (node.type) {
    case 'translation_unit': {
      return {
        type: 'Program',
        body: node.children.map(adapt),
        line,
      };
    }

    case 'function_definition': {
      const returnType = node.children.find(c => c.type === 'type_identifier')?.text ?? 'void';
      const name = node.children.find(c => c.type === 'identifier')?.text ?? '';
      const paramList = node.children.find(c => c.type === 'parameter_list');
      const params = paramList
        ? paramList.children.map(p => {
            const pType = p.children.find(c => c.type === 'type_identifier')?.text ?? 'int';
            const pName = p.children.find(c => c.type === 'identifier')?.text ?? '';
            return { name: pName, type: pType };
          })
        : [];
      const bodyNode = node.children.find(c => c.type === 'compound_statement');
      const body = bodyNode ? bodyNode.children.map(adapt) : [];

      return {
        type: 'FunctionDef',
        name,
        returnType,
        params,
        body,
        line,
      };
    }

    case 'declaration': {
      const varType = node.children.find(c => c.type === 'type_identifier')?.text ?? 'int';
      const declarator = node.children.find(c => c.type === 'init_declarator');
      const name = declarator ? declarator.text : '';
      const initNode = declarator && declarator.children.length > 0 ? declarator.children[0] : undefined;
      const initializer = initNode ? adapt(initNode) : undefined;

      return {
        type: 'VariableDecl',
        name,
        varType,
        initializer,
        line,
      };
    }

    case 'compound_statement': {
      return {
        type: 'Block',
        statements: node.children.map(adapt),
        line,
      };
    }

    case 'expression_statement': {
      return {
        type: 'ExpressionStmt',
        expression: adapt(node.children[0]),
        line,
      };
    }

    case 'if_statement': {
      const condition = adapt(node.children[0]);
      const consequent = adapt(node.children[1]);
      const alternate = node.children[2] ? adapt(node.children[2]) : undefined;
      return {
        type: 'If',
        condition,
        consequent,
        alternate,
        line,
      };
    }

    case 'while_statement': {
      return {
        type: 'While',
        condition: adapt(node.children[0]),
        body: adapt(node.children[1]),
        line,
      };
    }

    case 'for_statement': {
      // children could contain init, condition, update, body
      // We look at children length to determine which is which, or map them
      let init: ASTNode | undefined;
      let condition: ASTNode | undefined;
      let update: ASTNode | undefined;
      let body: ASTNode;

      const bodyIdx = node.children.length - 1;
      body = adapt(node.children[bodyIdx]);

      if (bodyIdx === 3) {
        init = adapt(node.children[0]);
        condition = adapt(node.children[1]);
        update = adapt(node.children[2]);
      } else if (bodyIdx === 2) {
        init = adapt(node.children[0]);
        condition = adapt(node.children[1]);
      } else if (bodyIdx === 1) {
        condition = adapt(node.children[0]);
      }

      return {
        type: 'For',
        init,
        condition,
        update,
        body,
        line,
      };
    }

    case 'return_statement': {
      const value = node.children[0] ? adapt(node.children[0]) : undefined;
      return {
        type: 'Return',
        value,
        line,
      };
    }

    case 'assignment_expression': {
      const leftNode = node.children[0];
      const rightNode = node.children[1];
      const operator = node.text;

      if (leftNode.type === 'identifier') {
        return {
          type: 'Assignment',
          name: leftNode.text,
          value: adapt(rightNode),
          operator,
          line,
        };
      } else if (leftNode.type === 'field_expression') {
        const obj = adapt(leftNode.children[0]);
        const prop = leftNode.text;
        return {
          type: 'MemberAssignment',
          object: obj,
          property: prop,
          value: adapt(rightNode),
          operator,
          line,
        };
      }
      throw new Error(`[ASTAdapter] Unsupported assignment target type: ${leftNode.type}`);
    }

    case 'binary_expression': {
      return {
        type: 'Binary',
        operator: node.text,
        left: adapt(node.children[0]),
        right: adapt(node.children[1]),
        line,
      };
    }

    case 'update_expression': {
      // e.g. ++i or i++
      return {
        type: 'Unary',
        operator: node.text,
        right: adapt(node.children[0]),
        line,
      };
    }

    case 'call_expression': {
      const callee = adapt(node.children[0]);
      const args = node.children.slice(1).map(adapt);
      return {
        type: 'Call',
        callee,
        args,
        line,
      };
    }

    case 'field_expression': {
      const object = adapt(node.children[0]);
      const property = node.text;
      return {
        type: 'MemberExpr',
        object,
        property,
        line,
      };
    }

    case 'identifier': {
      return {
        type: 'Identifier',
        name: node.text,
        line,
      };
    }

    case 'number_literal': {
      const text = node.text;
      let num: number;
      if (/^0[xX]/.test(text)) {
        num = parseInt(text, 16);
      } else if (text.includes('.')) {
        num = parseFloat(text);
      } else {
        num = parseInt(text, 10);
      }
      return {
        type: 'Literal',
        value: num,
        line,
      };
    }

    case 'string_literal': {
      // strip quotes
      const text = node.text;
      const clean = text.startsWith('"') && text.endsWith('"') ? text.slice(1, -1) : text;
      return {
        type: 'Literal',
        value: clean,
        line,
      };
    }

    default:
      // Fallback for unknown/unhandled nodes
      return {
        type: 'Literal',
        value: node.text,
        line,
      };
  }
}
