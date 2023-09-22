#!/usr/bin/env node

import {compilationUnit} from "./lumina/compiler/parser/statement-parser";
import {AstToIr} from "./lumina/compiler/asttoir/ast-to-ir";
import {CodeGenerator} from "./lumina/compiler/codegen/statement-to-code";
import {DeclarationAst} from "./lumina/compiler/ast/declaration-ast";
import {StatementAst} from "./lumina/compiler/ast/statement-ast";
import js_beautify from "js-beautify";
import fs from 'fs';
import path from 'path';
import CompilationUnit = DeclarationAst.CompilationUnit;
import {parse, ParseFailure, ParseSuccess} from "./lumina/parser/parser";

function getFiles(basePath: string): string[] {
    const result: string[] = [];

    function traverseDirectory(currentPath: string) {
        const files = fs.readdirSync(currentPath);

        for (const file of files) {
            const filePath = path.join(currentPath, file);

            if (fs.statSync(filePath).isDirectory()) {
                traverseDirectory(filePath); // Recursively traverse directories
            } else {
                result.push(path.relative(basePath, filePath));
            }
        }
    }

    traverseDirectory(basePath);
    return result;
}

function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function isLuminaFile(filePath: string): boolean {
    return filePath.endsWith(".lumina")
}


const luminaFiles = getFiles("./src").filter(isLuminaFile)

console.log(luminaFiles)

luminaFiles.forEach((file: any) => {

    const fileContent = fs.readFileSync("./src/" + file, 'utf8')
    const parseResult = parse(fileContent, compilationUnit());

    if(parseResult.success){

const parseSuccess = parseResult as ParseSuccess<CompilationUnit>
        const value: CompilationUnit = parseSuccess.value

        const code = js_beautify.js_beautify(CodeGenerator.compilationUnitToCode(AstToIr.compilationUnitToIr(value)))

        const newFileName = file.substr(0, file.lastIndexOf(".")) + ".js"

        const outputPath = process.cwd() + "\\dist\\" + newFileName; // Resolve the relative path to an absolute path
        ensureDirectoryExistence(outputPath)
        fs.writeFileSync(outputPath, code, 'utf8');

    } else {

        const parseFailure = parseResult as ParseFailure<CompilationUnit>
        throw new Error("Syntax error: " +parseFailure.position + " : "+ fileContent.slice( parseFailure.position))
    }
})


