import fs from 'fs';

const content = fs.readFileSync('d:/proyectos/ia-concepto/frontend/src/components/ManualQuoteBuilder.tsx', 'utf8');

// Strip comments
const noComments = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

const stack = [];
const tagRegex = /<([a-zA-Z0-9.]+)|<\/([a-zA-Z0-9.]+)>|{/g;
const braceStack = [];

let pos = 0;
while (pos < noComments.length) {
    const char = noComments[pos];
    
    if (char === '<') {
        // Tag?
        if (noComments[pos+1] === '/') {
            // Close tag
            const end = noComments.indexOf('>', pos);
            const tagName = noComments.substring(pos+2, end).trim();
            if (stack.length > 0) {
                const last = stack.pop();
                if (last !== tagName) {
                    // console.error(`Mismatched tag at pos ${pos}: expected </${last}>, found </${tagName}>`);
                }
            } else {
                console.error(`Unexpected close tag </${tagName}> at pos ${pos}`);
            }
            pos = end + 1;
        } else if (/[a-zA-Z]/.test(noComments[pos+1])) {
            // Open tag
            const end = noComments.indexOf('>', pos);
            const tagSlice = noComments.substring(pos+1, end);
            if (tagSlice.endsWith('/')) {
                // Self-closing
            } else {
                const tagName = tagSlice.split(/[\s\n>]/)[0];
                stack.push(tagName);
            }
            pos = end + 1;
        } else {
            pos++;
        }
    } else if (char === '{') {
        braceStack.push(pos);
        pos++;
    } else if (char === '}') {
        braceStack.pop();
        pos++;
    } else {
        pos++;
    }
}

console.log(`Open braces: ${braceStack.length}`);
console.log(`Open tags: ${stack.join(', ')}`);
