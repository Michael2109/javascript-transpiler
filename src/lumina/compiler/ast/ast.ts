namespace Ast {
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
        constructor(public name: string, public ref: Ref, public init?: Expression) {
        }
    }

    export interface Type {
        ref: Ref;
    }

    export type Ref = RefSpecial | RefLocal | RefQual;

    export class RefSpecial {
        constructor(public specialRef: SpecialRef) {

        }
    }

    export class RefLocal {
        constructor(public name: string) {
        }
    }

    export interface RefQual {
        qualName: QualName;
    }

    export type SpecialRef = Super | This;

    export class Super {
    }

    export class This {
    }

    export type TypeRel = Inherits | Extends | Equals;

    export class Inherits {
    }

    export class Extends {
    }

    export class Equals {
    }

    export interface NameSpace {
        nameSpace: string[];
    }

    export interface Name {
        value: string;
    }

    export interface QualName {
        nameSpace: NameSpace;
        name: string;
    }

    export interface Annotation {
        name: Name;
    }

    export type Modifier = Public | Protected | Private | PackageLocal | Abstract | Open | Pure;

    export class Public {
    }

    export class Protected {
    }

    export class Private {
    }

    export class PackageLocal {
    }

    export class Abstract {
    }

    export class Open {
    }

    export class Pure {
    }

    export interface Block extends Statement {
    }

    export interface Expression {
    }

    export interface Identifier extends Expression {
        name: Name;
    }

    export class MethodCall implements Expression {
        constructor(public name:string,   public expressions: Expression[]) {
        }
    }

    export class NewClassInstance implements Expression {
        constructor(public type: Type, public expression: Expression[], public anonymousClass: Statement | null) {
        }
    }

    export class StringLiteral implements Expression {
        constructor(public value: string) {
        }
    }

    export class Ternary implements Expression {
        constructor(public condition: Expression, public ifExpr: Expression, public elseExpr: Expression) {
        }
    }

    export class Tuple implements Expression {
    }

    export class BoolConst implements Expression {
        constructor(public value: boolean) {
        }
    }

    export class Not implements Expression {
    }

    export class ABinary implements Expression {
        constructor(public op: ABinOp, public expression1: Expression, public expression2: Expression) {
        }
    }

    export class BBinary implements Expression {
        constructor(public op: BBinOp, public expression1: Expression, public expression2: Expression) {
        }
    }

    export class RBinary implements Expression {
        constructor(public op: RBinOp, public expression1: Expression, public expression2: Expression) {
        }
    }

    export class IntConst implements Expression {
        constructor(public value: number) {
        }
    }

    export class IntObject implements Expression {
        constructor(public value: Statement) {
        }
    }

    export class LongConst implements Expression {
        constructor(public value: bigint) {
        }
    }

    export class DoubleConst implements Expression {
        constructor(public value: number) {
        }
    }

    export class FloatConst implements Expression {
        constructor(public value: number) {
        }
    }

    export class Variable implements Expression {
        constructor(public name: string) {
        }
    }

    export class Negate implements Expression {
        constructor(public expression: Expression) {
        }
    }

    export class ArrayValue implements Expression {
    }

    export class SpecialRefAsExpr implements Expression {
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
                    public  returnType: Ref | undefined,
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
        public  type: Ref | undefined,
        public  immutable: boolean,
        public statement: Statement) {
        }

    }

    export class Reassign implements Statement {
        constructor(public  name: string,
        public  block: Block) {
        }

    }

    export class Return implements Statement {
    }

    export class Lambda implements Statement {
    }

    export class ExprAsStmt implements Statement {
        constructor(public expression: Expression) {
        }
    }

    export class BlockStmt implements Statement {
        constructor(public statements: Statement[]) {
        }
    }

    export class Match implements Statement {
    }

    export class Case {
        constructor(public expression: Expression, public block: Block) {
        }
    }

    export abstract class Operator {
    }

    export abstract class ABinOp {

    }

    export class Add extends ABinOp {
        value = "Add"
    }
    export class Subtract extends ABinOp {
        value = "Subtract"
    }
    export class Multiply extends ABinOp {  value = "Multiply"}
    export class Divide extends ABinOp {value = "Divide"}

    export interface BBinOp extends Operator {
    }

    export abstract class BBinOp extends Operator{

    }

    export class And extends BBinOp {}
    export class Or extends BBinOp {}

    export abstract class RBinOp extends Operator {}

    export class GreaterEqual extends RBinOp {}
    export class Greater extends RBinOp {}
    export class LessEqual extends RBinOp {}
    export class Less extends RBinOp {}
    export class Equal extends RBinOp {}
}

export {Ast}