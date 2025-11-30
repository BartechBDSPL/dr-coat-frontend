const fs = require('fs');
const path = require('path');

const DEFAULT_DIRS = ['components', 'app', 'lib', 'utils', 'hooks'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function removeComments(content) {
  let result = '';
  let i = 0;
  let inString = false;
  let stringChar = '';
  let inTemplateString = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let inJSXComment = false;

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1] || '';
    const prevChar = content[i - 1] || '';

    // Handle string literals
    if (!inSingleLineComment && !inMultiLineComment && !inJSXComment) {
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
          if (char === '`') inTemplateString = true;
        } else if (char === stringChar) {
          inString = false;
          inTemplateString = false;
          stringChar = '';
        }
        result += char;
        i++;
        continue;
      }
    }

    // Skip if we're inside a string
    if (inString) {
      result += char;
      i++;
      continue;
    }

    // Handle JSX comments {/* */}
    if (char === '{' && nextChar === '/' && content[i + 2] === '*') {
      inJSXComment = true;
      i += 3;
      continue;
    }

    if (
      inJSXComment &&
      char === '*' &&
      nextChar === '/' &&
      content[i + 2] === '}'
    ) {
      inJSXComment = false;
      i += 3;
      continue;
    }

    if (inJSXComment) {
      i++;
      continue;
    }

    // Handle single-line comments
    if (char === '/' && nextChar === '/' && !inMultiLineComment) {
      inSingleLineComment = true;
      i += 2;
      continue;
    }

    if (inSingleLineComment && char === '\n') {
      inSingleLineComment = false;
      result += char;
      i++;
      continue;
    }

    if (inSingleLineComment) {
      i++;
      continue;
    }

    // Handle multi-line comments
    if (char === '/' && nextChar === '*' && !inSingleLineComment) {
      inMultiLineComment = true;
      i += 2;
      continue;
    }

    if (inMultiLineComment && char === '*' && nextChar === '/') {
      inMultiLineComment = false;
      i += 2;
      continue;
    }

    if (inMultiLineComment) {
      i++;
      continue;
    }

    result += char;
    i++;
  }

  // Clean up multiple blank lines (more than 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  // Remove trailing whitespace from lines
  result = result
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');

  return result;
}

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = removeComments(content);

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ Processed: ${filePath}`);
      return true;
    } else {
      console.log(`- No changes: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let processedCount = 0;

  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return 0;
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (item !== 'node_modules' && !item.startsWith('.')) {
        processedCount += processDirectory(itemPath);
      }
    } else if (stat.isFile()) {
      if (processFile(itemPath)) {
        processedCount++;
      }
    }
  }

  return processedCount;
}

// Main execution
const args = process.argv.slice(2);
let target = args[0];

console.log('\n🧹 Comment Remover\n');
console.log('Removing comments from TypeScript/JavaScript files...\n');

let totalProcessed = 0;

if (target) {
  // Process specific file or directory
  const targetPath = path.resolve(process.cwd(), target);

  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      totalProcessed = processDirectory(targetPath);
    } else if (stat.isFile()) {
      if (processFile(targetPath)) {
        totalProcessed = 1;
      }
    }
  } else {
    console.error(`Path not found: ${target}`);
    process.exit(1);
  }
} else {
  // Process default directories
  for (const dir of DEFAULT_DIRS) {
    const dirPath = path.resolve(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      console.log(`\nProcessing ${dir}/...`);
      totalProcessed += processDirectory(dirPath);
    }
  }
}

console.log(`\n✨ Done! Modified ${totalProcessed} file(s).\n`);
