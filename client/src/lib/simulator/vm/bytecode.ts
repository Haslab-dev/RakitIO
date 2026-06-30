export type Opcode =
  | 'MOV'       // MOV dest_reg, value (constant or reg)
  | 'LOAD'      // LOAD dest_reg, var_name
  | 'STORE'     // STORE var_name, src_reg
  | 'CALL'      // CALL dest_reg, fn_name, [arg_regs]
  | 'JMP'       // JMP label_index
  | 'JMP_IF'    // JMP_IF label_index, cond_reg
  | 'RET'       // RET src_reg
  | 'WAIT'      // WAIT src_reg (time in ms)
  | 'OP';       // OP dest_reg, operator, reg1, reg2

export interface Instruction {
  op: Opcode;
  args: any[];
  line: number; // Mapped line number in original source code
}

export type Register = string; // e.g. "R0", "R1", "R2", etc.

export interface CompiledProgram {
  functions: Record<string, {
    params: string[];
    instructions: Instruction[];
  }>;
  globals: Instruction[];
}
