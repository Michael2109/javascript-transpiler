import {digit, either, eitherMany, lazy, P, rep, seq, spaces, str} from "./parser";
import {ExpressionAst} from "../compiler/ast/expression-ast";
import Expression = ExpressionAst.Expression;
import Operator = ExpressionAst.Operator;
import ABinary = ExpressionAst.ABinary;
import Subtract = ExpressionAst.Subtract;
import Add = ExpressionAst.Add;
import Divide = ExpressionAst.Divide;
import Multiply = ExpressionAst.Multiply;
import ABinOp = ExpressionAst.ABinOp;
import RBinOp = ExpressionAst.RBinOp;
import RBinary = ExpressionAst.RBinary;
import {expressionParser} from "./expression-parser";


