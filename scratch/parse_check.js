const parser = require('@babel/parser');
const fs = require('fs');

const code = fs.readFileSync('d:/proyectos/ia-concepto/frontend/src/components/ManualQuoteBuilder.tsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  console.log('Parse successful!');
} catch (e) {
  console.error('Parse failed:');
  console.error(e.message);
  console.error('At position:', e.pos);
  console.error('Loc:', e.loc);
  
  // Show context
  const lines = code.split('\n');
  const line = e.loc.line;
  for (let i = Math.max(0, line - 5); i < Math.min(lines.length, line + 5); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
