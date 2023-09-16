
import {ExpressionAst} from "./expression-ast";

namespace StatementAst {

    import NameSpace = ExpressionAst.NameSpace;
    import Expression = ExpressionAst.Expression;
    import Type = ExpressionAst.Type;
    import Annotation = ExpressionAst.Annotation;
    import Modifier = ExpressionAst.Modifier;


    export class CompilationUnit {
        constructor(   public nameSpace: NameSpace,
                       public imports: Import[],
                       public statements: Model[]) {
        }

    }

    export class Import {
        constructor(public loc: string[]) {
        }
    }

    export class Field {
        constructor(public name: string, public required: boolean, public ref: Type, public init?: Expression) {
        }
    }

    export interface Model extends Statement {
    }

    export interface Statement {
    }

    export class ClassModel implements Model {
        constructor(
            public  name: string,
            public modifiers: Modifier[],
            public fields: Field[],
            public parent: Type | undefined,
            public  parentArguments: Expression[],
            public  interfaces: Type[],
            public  statements: Statement[]
        ) {
        }

    }

    export class Method implements Statement {
        constructor(public  name: string,
                    public annotations: Annotation[],
                    public fields: Field[],
                    public modifiers: Modifier[],
                    public  returnType: Type | undefined,
                    public   statements: Array<Statement>) {
        }

    }

    export class For implements Statement {
    }

    export class While implements Statement {
    }

    export class If implements Statement {
        constructor(public condition: Expression, public ifBlock: Statement, public elseBlock?: Statement) {
        }
    }

    export class Assign implements Statement {
        constructor(public name: string,
                    public  type: Type | undefined,
                    public  immutable: boolean,
                    public statement: Statement) {
        }

    }

    export class Reassign implements Statement {
        constructor(public  name: string,
                    public statement: Statement) {
        }

    }

    export class Return implements Statement {
    }



    export class ExprAsStmt implements Statement {
        constructor(public expression: Expression) {
        }
    }

}

export {StatementAst}