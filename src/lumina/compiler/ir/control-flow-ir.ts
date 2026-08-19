import {StatementIr} from "./statement-ir";
import {ExpressionIr} from "./expression-ir";

namespace ControlFlowIr {


    import Expression = ExpressionIr.Expression;
    import Statement = StatementIr.Statement;

    export class ControlFlow extends StatementIr.Statement {
    }

    export class For extends ControlFlow {
        constructor(public variableName: string, public collection: Expression, public statements: Statement ) {
            super()
        }
    }

    export class DoWhile extends ControlFlow {
        constructor(public condition: Expression, public statements: Array<Statement>) {
            super()
        }
    }

    export class While extends ControlFlow {
        constructor(public condition: Expression, public statements: Array<Statement>) {
            super()
        }
    }

    export class If extends ControlFlow {
        constructor(public condition: Expression, public ifBlock: Statement, public elseBlock?: Statement) {
            super()
        }
    }

}

export {ControlFlowIr}