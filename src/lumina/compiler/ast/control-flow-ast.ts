import {ExpressionAst} from "./expression-ast";
import {StatementAst} from "./statement-ast";
import {DeclarationAst} from "./declaration-ast";

namespace ControlFlowAst {


    import Expression = ExpressionAst.Expression;
    import Statement = StatementAst.Statement;
    import Assign = DeclarationAst.Assign;
    import BBinary = ExpressionAst.BBinary;

    export class ControlFlow extends StatementAst.Statement {
    }

    export class For implements ControlFlow {
        constructor(public assign: Assign, public condition: Expression, public increment: Statement, public statements: Statement ) {
        }
    }

    export class While implements ControlFlow {
    }

    export class If implements ControlFlow {
        constructor(public condition: Expression, public ifBlock: Statement, public elseBlock?: Statement) {
        }
    }

}

export {ControlFlowAst}