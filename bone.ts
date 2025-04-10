import fs from "fs";
import path from "path";
import treeify from "treeify";

function generateDirectoryTree(directoryPath) {
  const tree = {};

  function processDirectory(currentPath, currentNode) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const fullPath = path.join(currentPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        currentNode[file] = {};
        processDirectory(fullPath, currentNode[file]);
      } else {
        currentNode[file] = null;
      }
    });
  }

  processDirectory(directoryPath, tree);
  return tree;
}

// Đường dẫn đến thư mục dự án Node.js của bạn
const projectPath = "src";

// In ra cấu trúc thư mục và file sử dụng treeify
console.log(treeify.asTree(generateDirectoryTree(projectPath), true));
