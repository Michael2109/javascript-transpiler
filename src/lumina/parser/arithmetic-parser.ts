import {digit, either, eitherMany, lazy, P, rep, seq, spaces, str} from "./parser";
import {Ast} from "../compiler/ast/ast";
import Expression = Ast.Expression;
import Operator = Ast.Operator;
import ABinary = Ast.ABinary;
import Subtract = Ast.Subtract;
import Add = Ast.Add;
import Divide = Ast.Divide;
import Multiply = Ast.Multiply;
import ABinOp = Ast.ABinOp;
import RBinOp = Ast.RBinOp;
import RBinary = Ast.RBinary;
import {expressionParser} from "./expression-parser";


