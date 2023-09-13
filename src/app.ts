#!/usr/bin/env node

import {compilationUnit} from "./lumina/parser/statement-parser";
import {AstToIr} from "./lumina/compiler/ast/ast-to-ir";
import {CodeGenerator} from "./lumina/compiler/codegen/code-generator";
import {Ir} from "./lumina/compiler/ast/ir";
import {Ast} from "./lumina/compiler/ast/ast";
import CompilationUnit = Ast.CompilationUnit;
import js_beautify from "js-beautify";

const { promisify } = require('util');
const { resolve } = require('path');
import fs from 'fs';
import path from 'path';

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

        const fileContent = fs.readFileSync("./src/"+file,'utf8')
        const parseResult = compilationUnit().createParser(fileContent);

        const value: CompilationUnit = parseResult.value

        const code = js_beautify.js_beautify(CodeGenerator.compilationUnitToCode(AstToIr.compilationUnitToIr(value)))

        const newFileName  = file.substr(0, file.lastIndexOf(".")) + ".js"

        const outputPath = process.cwd() + "\\dist\\"+newFileName; // Resolve the relative path to an absolute path
        ensureDirectoryExistence(outputPath)
        fs.writeFileSync(outputPath, code, 'utf8');

    })


