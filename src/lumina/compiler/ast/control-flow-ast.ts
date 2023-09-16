import {ExpressionAst} from "./expression-ast";
import {StatementAst} from "./statement-ast";

namespace ControlFlowAst {


    import Expression = ExpressionAst.Expression;
    import Statement = StatementAst.Statement;

    export class ControlFlow extends StatementAst.Statement {
    }

    export class For implements ControlFlow {
    }

    export class While implements ControlFlow {
    }

    export class If implements ControlFlow {
        constructor(public condition: Expression, public ifBlock: Statement, public elseBlock?: Statement) {
        }
    }

}

export {ControlFlowAst}