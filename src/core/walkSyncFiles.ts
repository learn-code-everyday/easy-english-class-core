import fs from "fs";
import path from "path";

export const walkSyncFiles = (dir: string, fileList: string[] = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(function (file: any) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            fileList = walkSyncFiles(path.join(dir, file), fileList);
        } else {
            fileList.push(path.join(dir, file));
        }
    });
    return fileList;
}