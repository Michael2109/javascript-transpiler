import {cut, P, seq, spaces} from "../../parser/parser";
import {identifier, keyword} from "./lexical-parser";
import {DeclarationAst} from "../ast/declaration-ast";
import Namespace = DeclarationAst.Namespace;
import {block} from "./statement-parser";


function namespace(): P<Namespace> {

    return seq(
        cut(keyword("namespace")),
        spaces(),
        identifier(),
        block()
    )
        .map(results => new Namespace(results[0], results[1]))
}

export {namespace}