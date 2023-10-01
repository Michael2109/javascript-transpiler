import {spawnSync} from "child_process";

const os = require('os');
const fs = require('fs');
const nrc = require('node-run-cmd');
const path = require('path');

function compileAndExecute(sourceDirectory: string, executableJsPath: string): string {

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir()));
    console.log(tmpDir)
    // the rest of your app goes here

    const command = `lumina --source ${sourceDirectory} --target ${tmpDir}`;

    console.log("Running")

    const process = spawnSync('cmd.exe', ["/c", command]);

    if (process.error) {
        throw new Error('Error:' + process.error);
    }

    const output = execute(tmpDir + "/" + executableJsPath)

    // Cleanup
    fs.rmSync(tmpDir, {recursive: true, force: true});

    return output
}

function execute(filePath: string): string {

    const command = "node " + filePath

    const process = spawnSync('cmd.exe', ["/c", command]);

    return process.stdout.toString()
}

export {compileAndExecute, execute}