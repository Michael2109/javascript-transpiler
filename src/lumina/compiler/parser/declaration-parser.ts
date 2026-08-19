import {cut, P, rep, seq, str} from "../../parser/parser";
import {spaces} from "./lexical-parser";
import {DeclarationAst} from "../ast/declaration-ast";
import {block, field} from "./statement-parser";
import Lambda = DeclarationAst.Lambda;


function lambda(): P<Lambda> {

    return seq(
        str("("),
        rep(field(), {sep: seq(spaces(), str(","),spaces())}),
        str(")"),
        spaces(),
        cut(str("=>")),
        block()
    )
        .map(results => new Lambda(results[0], results[1]))
}

export {lambda}
