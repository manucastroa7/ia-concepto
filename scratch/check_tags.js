import fs from 'fs';

const content = fs.readFileSync('d:/proyectos/ia-concepto/frontend/src/components/ManualQuoteBuilder.tsx', 'utf8');

// Simple tag counter
let openTags = 0;
let closeTags = 0;
const tagRegex = /<([a-zA-Z0-9]+)|<\/([a-zA-Z0-9]+)>/g;
let m;
while ((m = tagRegex.exec(content)) !== null) {
    if (m[1]) {
        // Self-closing?
        const start = m.index;
        const end = content.indexOf('>', start);
        if (content[end-1] !== '/') {
            openTags++;
        }
    } else if (m[2]) {
        closeTags++;
    }
}

console.log(`Open Tags: ${openTags}, Close Tags: ${closeTags}, Diff: ${openTags - closeTags}`);

// Parentheses and Braces
let openBraces = 0;
let closeBraces = 0;
let openParens = 0;
let closeParens = 0;

for (let char of content) {
    if (char === '{') openBraces++;
    if (char === '}') closeBraces++;
    if (char === '(') openParens++;
    if (char === ')') closeParens++;
}

console.log(`Braces: ${openBraces} / ${closeBraces}, Diff: ${openBraces - closeBraces}`);
console.log(`Parens: ${openParens} / ${closeParens}, Diff: ${openParens - closeParens}`);
