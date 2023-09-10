#!/usr/bin/env node

import {compilationUnit} from "./lumina/parser/statement-parser";
import {AstToIr} from "./lumina/compiler/ast/ast-to-ir";
import {CodeGenerator} from "./lumina/compiler/codegen/code-generator";
import {Ir} from "./lumina/compiler/ast/ir";
import {Ast} from "./lumina/compiler/ast/ast";
import CompilationUnit = Ast.CompilationUnit;
import js_beautify from "js-beautify";

console.log("Do something else")
const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

getFiles(".").then(files => {
        const luminaFiles = files.filter(isLuminaFile)

    luminaFiles.forEach(file => {

        const fileContent = fs.readFileSync(file,'utf8')
        const parseResult = compilationUnit().createParser(fileContent);

        console.log(JSON.stringify(parseResult))

        const value: CompilationUnit = parseResult.value

        console.log(JSON.stringify(AstToIr.compilationUnitToIr(value)))

        const code = js_beautify.js_beautify(CodeGenerator.compilationUnitToCode(AstToIr.compilationUnitToIr(value)))

        const newFileName  = file.substr(0, file.lastIndexOf(".")) + ".js";
        console.log(newFileName)

        fs.writeFileSync(newFileName, code)
    })

    }
)

function isLuminaFile(filePath: string): boolean {
    return filePath.endsWith(".lumina")
}
