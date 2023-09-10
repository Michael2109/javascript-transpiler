import * as fs from 'fs';
import * as path from 'path';

console.log("Do something else")
function listFilesRecursivelySync(dir: string): string[] {
    try {
        const files: string[] = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Recursively process subdirectories
                const subdirectoryFiles = listFilesRecursivelySync(filePath);
                files.push(...subdirectoryFiles);
            } else {
                // Add file path to the list
                files.push(filePath);
            }
        }

        return files;
    } catch (error) {
        console.error(`Error reading directory: ${dir}`);
        console.error(error);
        return [];
    }
}

// Call the function with the current directory
const fileList = listFilesRecursivelySync(__dirname);

if (fileList.length > 0) {
    console.log('List of files:');
    fileList.forEach((file) => console.log(file));
} else {
    console.log('No files found.');
}