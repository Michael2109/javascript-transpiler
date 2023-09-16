import {ExpressionIr} from "./expression-ir";

namespace StatementIr {

    import Expression = ExpressionIr.Expression;

    export class CompilationUnit {
        constructor(public statements: Array<Statement>) {
        }
    }

    export class Statement {
    }

    export class ClassModel extends Statement {
        constructor(public name: string, public parent: Type | undefined, public fields: Field[], public statements: Array<Statement>) {
            super()
        }
    }

    export class ModuleMethod extends Statement {
        constructor(public name: string, public statements: Array<Statement>) {
            super()
        }
    }

    export class Method extends Statement {
        constructor(public name: string, public statements: Array<Statement>) {
            super()
        }
    }

    export class Field {
        constructor(public name: string, public required: boolean, public ref: Type, public init?: Expression) {
        }
    }


    export class Type {
    }

    export class LocalType extends Type {
        constructor(public name: string) {
            super();
        }
    }

    export class Assign extends Statement {
        constructor(public name: string,
                    public immutable: boolean,
                    public statement: Statement) {
            super()
        }
    }

    export class ExprAsStmt implements Statement {
        constructor(public expression: Expression) {
        }
    }

}

export {StatementIr}