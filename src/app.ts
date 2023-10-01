#!/usr/bin/env node

import {compilationUnit} from "./lumina/compiler/parser/statement-parser";
import {AstToIr} from "./lumina/compiler/asttoir/ast-to-ir";
import {CodeGenerator} from "./lumina/compiler/codegen/statement-to-code";
import {DeclarationAst} from "./lumina/compiler/ast/declaration-ast";
import js_beautify from "js-beautify";
import fs from 'fs';
import path from 'path';
import {parse, ParseFailure, ParseSuccess} from "./lumina/parser/parser";
import CompilationUnit = DeclarationAst.CompilationUnit;

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

function parseCommandLineArgs(args: string[]): Map<string, string> {
    const argMap = new Map<string, string>();

    for (let i = 2; i < args.length; i++) {
        const arg = args[i];

        // Check if the argument has a corresponding value
        if (arg.startsWith('--') && i + 1 < args.length) {
            const argName = arg.slice(2);
            const argValue = args[i + 1];
            argMap.set(argName, argValue);
            i++; // Skip the next element since it's the value
        } else {
            // If there's no corresponding value, just store it as a boolean flag
            argMap.set(arg, 'true');
        }
    }

    return argMap;
}

const argsMap = parseCommandLineArgs(process.argv);

const source = argsMap.get("source")
const target = argsMap.get("target")

console.log("Source: " + source)
console.log("Target: " + target)

if(!target){
    throw new Error("No --target path specified")
}

const luminaFiles = getFiles("./" + source).filter(isLuminaFile)

console.log("Lumina Files")
console.log(luminaFiles)

luminaFiles.forEach((file: any) => {

    const fileContent = fs.readFileSync("./" + source + "/" + file, 'utf8')
    const parseResult = parse(fileContent, compilationUnit());

    if (parseResult.success) {

        const parseSuccess = parseResult as ParseSuccess<CompilationUnit>
        const value: CompilationUnit = parseSuccess.value

        const code = js_beautify.js_beautify(CodeGenerator.compilationUnitToCode(AstToIr.compilationUnitToIr(value)))

        const newFileName = file.substr(0, file.lastIndexOf(".")) + ".js"



        console.log("New file name: " + newFileName)
      // Resolve the relative path to an absolute path
        const outputPath = path.isAbsolute(target) ? (target+ "\\" + newFileName) : (process.cwd() + "\\" + target + "\\" + newFileName)


      console.log(outputPath)
        ensureDirectoryExistence(outputPath)
        fs.writeFileSync(outputPath, code, 'utf8');

    } else {

        const parseFailure = parseResult as ParseFailure<CompilationUnit>
        throw new Error("Syntax error: `" + parseFailure.position + "` : `" + fileContent.slice(parseFailure.position)) + "`"
    }
})


