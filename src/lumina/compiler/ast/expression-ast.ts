namespace ExpressionAst {


    export class Type {
    }

    export class LocalType extends Type {
        constructor(public name: string) {
            super();
        }
    }

    export class Super {
    }

    export class This {
    }

    export interface NameSpace {
        nameSpace: string[];
    }

    export interface QualName {
        nameSpace: NameSpace;
        name: string;
    }

    export interface Annotation {
        name: string;
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

    export interface Expression {
    }

    export class MethodCall implements Expression {
        constructor(public name: string, public expressions: Expression[]) {
        }
    }

    export class NewClassInstance implements Expression {
        constructor(public type: Type, public expression: Expression[]) {
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

    export class Multiply extends ABinOp {
        value = "Multiply"
    }

    export class Divide extends ABinOp {
        value = "Divide"
    }

    export interface BBinOp extends Operator {
    }

    export abstract class BBinOp extends Operator {

    }

    export class And extends BBinOp {
        value = "And"
    }

    export class Or extends BBinOp {
        value = "Or"
    }

    export abstract class RBinOp extends Operator {
    }

    export class GreaterEqual extends RBinOp {
        value = "GreaterEqual"
    }

    export class Greater extends RBinOp {
        value = "Greater"
    }

    export class LessEqual extends RBinOp {
        value = "LessEqual"
    }

    export class Less extends RBinOp {
        value = "Less"
    }

    export class Equal extends RBinOp {
        value = "Equal"
    }
}

export {ExpressionAst}