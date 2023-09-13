
namespace Ir {

    export class CompilationUnit {
        constructor(public statements: Array<Statement>) {
        }
    }

    export class Expression {}
    export class Statement {}

   export class ClassModel extends Statement{
        constructor(public name: string,    public fields: Field[],public statements: Array<Statement>) {
            super()
        }
    }

    export class ModuleMethod extends Statement{
        constructor(public name: string, public statements: Array<Statement>) {
            super()
        }
    }
    export class Method extends Statement{
        constructor(public name: string, public statements: Array<Statement>) {
            super()
        }
    }

    export class Field {
        constructor(public name: string, public required: boolean, public ref: Ref, public init?: Expression) {
        }
    }

    export type Ref = RefLocal ;


    export class RefLocal {
        constructor(public name: string) {
        }
    }

    export class Assign extends Statement{
        constructor(public name: string,
                    public  immutable: boolean,
                    public statement: Statement) {
            super()
        }
    }

    export class ExprAsStmt implements Statement {
        constructor(public expression: Expression) {
        }
    }


    export class ABinary implements Expression {
        constructor(public op: ABinOp, public expression1: Expression, public expression2: Expression) {
        }
    }

    export abstract class Operator extends Expression{
    }

    export abstract class ABinOp extends Operator{

    }

    export class Add extends ABinOp {
        value = "Add"
    }
    export class Subtract extends ABinOp {
        value = "Subtract"
    }
    export class Multiply extends ABinOp {  value = "Multiply"}
    export class Divide extends ABinOp {value = "Divide"}

    export class IntConst implements Expression {
        constructor(public value: number) {
        }
    }

}

export {Ir}