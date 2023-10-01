import {spawnSync, SpawnSyncReturns} from "child_process";
import * as Process from "process";

const os = require('os');
const fs = require('fs');
const nrc = require('node-run-cmd');
const path = require('path');

function compileAndExecute(sourceDirectory: string, executableJsPath: string): Array<string> {

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir()));
    console.log(tmpDir)
    // the rest of your app goes here

    const command = `lumina --source ${sourceDirectory} --target ${tmpDir}`;

    let compilerProcess = getProcess(command)

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

    let executeProcess = getProcess(command)

    return executeProcess.stdout.toString().split(/\r?\n/)
}

function getProcess(command: string): SpawnSyncReturns<Buffer> {

    const isWindows = process.platform === "win32"
    if(isWindows){
        return  spawnSync('cmd.exe', ["/c", command]);
    } else {
        return  spawnSync( 'bash',[command]);
    }
}

function deleteDir(directory: string): void {
    fs.rmSync(directory, {recursive: true, force: true});
}

export {compileAndExecute, execute}