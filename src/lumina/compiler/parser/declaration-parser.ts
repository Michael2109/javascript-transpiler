import {cut, P, rep, seq, spaces, str} from "../../parser/parser";
import {identifier, keyword} from "./lexical-parser";
import {DeclarationAst} from "../ast/declaration-ast";
import Namespace = DeclarationAst.Namespace;
import {block, field} from "./statement-parser";
import Lambda = DeclarationAst.Lambda;


function namespace(): P<Namespace> {

    return seq(
        cut(keyword("namespace")),
        spaces(),
        identifier(),
        block()
    )
        .map(results => new Namespace(results[0], results[1]))
}

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

export {namespace, lambda}