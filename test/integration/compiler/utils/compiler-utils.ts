import {spawnSync} from "child_process";

const os = require('os');
const fs = require('fs');
const nrc = require('node-run-cmd');
const path = require('path');

function compileAndExecute(sourceDirectory: string, executableJsPath: string): Array<string> {

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir()));
    console.log(tmpDir)
    // the rest of your app goes here

    const command = `lumina --source ${sourceDirectory} --target ${tmpDir}`;

    console.log("Running")

    const isWindows = process.platform === "win32"

    let compilerProcess
    if(isWindows){
        compilerProcess  = spawnSync('cmd.exe', ["/c", command]);
    } else {
        compilerProcess  = spawnSync( 'bash',[command]);
    }


    if (compilerProcess.error) {

        deleteDir(tmpDir)
        throw new Error(""+compilerProcess.error);
    }

    const output = execute(tmpDir + "/" + executableJsPath)

    // Cleanup
    deleteDir(tmpDir)

    return output
}

function execute(filePath: string): Array<string> {

    const command = "node " + filePath

    const process = spawnSync('cmd.exe', ["/c", command]);

    return process.stdout.toString().split(/\r?\n/)
}

function deleteDir(directory: string): void {
    fs.rmSync(directory, {recursive: true, force: true});
}

export {compileAndExecute, execute}