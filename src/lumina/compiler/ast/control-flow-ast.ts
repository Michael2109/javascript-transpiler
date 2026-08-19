import {ExpressionAst} from "./expression-ast";
import {StatementAst} from "./statement-ast";
import {DeclarationAst} from "./declaration-ast";

namespace ControlFlowAst {


    import Expression = ExpressionAst.Expression;
    import Statement = StatementAst.Statement;
    import Assign = DeclarationAst.Assign;
    import BBinary = ExpressionAst.BBinary;
    import Variable = ExpressionAst.Variable;

    export class ControlFlow extends StatementAst.Statement {
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

export {ControlFlowAst}