/**
 * One-shot migration: Text → OMMText, TextInput → OMMTextInput,
 * ban bold weights (→ Satoshi-Medium), normalize monochrome palette.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SKIP_FILES = new Set(['OMMText.tsx', 'OMMTextInput.tsx']);

function* walkTsx(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.name === 'node_modules') continue;
    if (ent.isDirectory()) yield* walkTsx(p);
    else if (ent.name.endsWith('.tsx')) yield p;
  }
}

function splitImportInner(inner) {
  /** Handles "Text" and "type Foo" etc. */
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of inner) {
    if (ch === '{' || ch === '<') depth++;
    if (ch === '}' || ch === '>') depth--;
    if (ch === ',' && depth === 0) {
      if (cur.trim()) parts.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function transformFile(filePath) {
  if (SKIP_FILES.has(path.basename(filePath))) return false;
  let s = fs.readFileSync(filePath, 'utf8');
  const original = s;

  let needsText = false;
  let needsInput = false;

  s = s.replace(/import\s*\{([^}]*)\}\s*from\s*['"]react-native['"]/g, (full, innerRaw) => {
    const parts = splitImportInner(innerRaw);
    const keep = [];
    for (const p of parts) {
      const base = p.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
      if (base === 'Text') {
        needsText = true;
        continue;
      }
      if (base === 'TextInput') {
        needsInput = true;
        continue;
      }
      keep.push(p);
    }
    if (keep.length === 0) return '';
    return `import { ${keep.join(', ')} } from 'react-native'`;
  });

  /** Collapse accidental double newlines from empty import removal */
  s = s.replace(/\nimport\s*\{\s*\}\s*from\s*['"]react-native['"]\n/g, '\n');

  const lines = s.split('\n');
  const firstRnImport = lines.findIndex((l) => l.includes("from 'react-native'") || l.includes('from "react-native"'));
  const inserts = [];
  if (needsText) inserts.push("import { Text } from '@/components/OMMText';");
  if (needsInput) inserts.push("import { TextInput } from '@/components/OMMTextInput';");
  if (inserts.length) {
    if (firstRnImport >= 0) {
      lines.splice(firstRnImport, 0, ...inserts);
      s = lines.join('\n');
    } else {
      /** no react-native import left — prepend after first import block */
      let pos = 0;
      const nl = s.indexOf('\n\n');
      if (nl >= 0) pos = nl + 2;
      s = s.slice(0, pos) + inserts.join('\n') + '\n' + s.slice(pos);
    }
  }

  /** Font weights → Satoshi-Medium (custom font: do not use fontWeight bold) */
  s = s.replace(/fontWeight:\s*['"]700['"]/g, "fontFamily: 'Satoshi-Medium'");
  s = s.replace(/fontWeight:\s*['"]800['"]/g, "fontFamily: 'Satoshi-Medium'");
  s = s.replace(/fontWeight:\s*['"]600['"]/g, "fontFamily: 'Satoshi-Medium'");
  s = s.replace(/fontWeight:\s*['"]bold['"]/gi, "fontFamily: 'Satoshi-Medium'");
  s = s.replace(/fontWeight:\s*['"]500['"]/g, "fontFamily: 'Satoshi-Medium'");

  /** Monochrome ink + surfaces */
  s = s.replace(/#1c1c1e/gi, '#000000');
  s = s.replace(/#1a1a1a/gi, '#000000');
  s = s.replace(/#3c3c43/gi, '#000000');
  s = s.replace(/#fefdfb/gi, '#ffffff');
  s = s.replace(/#f5f5f5/gi, '#ffffff');
  s = s.replace(/#f7f7f5/gi, '#ffffff');
  s = s.replace(/#f7f7f7/gi, '#ffffff');

  /** Warm greys → neutral black-opacity (cards / chips still read in B&W) */
  s = s.replace(/#ebe8e2/gi, 'rgba(0,0,0,0.06)');
  s = s.replace(/#e8e4df/gi, 'rgba(0,0,0,0.06)');
  s = s.replace(/#f5f1ed/gi, '#ffffff');
  s = s.replace(/#f0ebe4/gi, 'rgba(0,0,0,0.04)');
  s = s.replace(/#f4f1eb/gi, 'rgba(0,0,0,0.04)');
  s = s.replace(/#f2f2f7/gi, '#ffffff');

  /** iOS system label greys → black-opacity */
  s = s.replace(/rgba\(60,\s*60,\s*67,/gi, 'rgba(0, 0, 0,');

  /** Accent blue in messages search dot → black */
  s = s.replace(/#007aff/gi, '#000000');
  s = s.replace(/#2f95dc/gi, '#000000');

  /** Misc neutrals */
  s = s.replace(/#454545/gi, '#000000');
  s = s.replace(/#555555/gi, 'rgba(0,0,0,0.55)');
  s = s.replace(/#555\b/gi, 'rgba(0,0,0,0.55)');
  s = s.replace(/#666666/gi, 'rgba(0,0,0,0.55)');
  s = s.replace(/#666\b/gi, 'rgba(0,0,0,0.55)');
  s = s.replace(/#737373/gi, 'rgba(0,0,0,0.55)');
  s = s.replace(/#2d2d2d/gi, '#000000');

  if (s !== original) {
    fs.writeFileSync(filePath, s, 'utf8');
    return true;
  }
  return false;
}

let n = 0;
for (const dir of ['app', 'components']) {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) continue;
  for (const f of walkTsx(d)) {
    if (transformFile(f)) {
      n++;
      console.log('updated', path.relative(ROOT, f));
    }
  }
}
console.log('files changed:', n);
