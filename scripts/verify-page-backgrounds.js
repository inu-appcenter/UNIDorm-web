import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const routerFile = path.join(projectRoot, 'src/routes/Router.tsx');
const pagesDir = path.join(projectRoot, 'src/pages');

let totalErrors = 0;

console.log('====================================================');
console.log('[1단계] Router.tsx 모든 라우트 선언적 배경색(handle.bg) 전수 검사');
console.log('====================================================');

const routerContent = fs.readFileSync(routerFile, 'utf8');

const routeItemRegex = /\{\s*(?:index:\s*true|path:\s*["'`][^"'`]+["'`])[^}]*?element:\s*<([A-Za-z0-9_]+)[^}]*?\}/gs;
let match;
let verifiedRoutes = 0;

while ((match = routeItemRegex.exec(routerContent)) !== null) {
  const block = match[0];
  const componentName = match[1];

  if (componentName === 'Navigate' || componentName === 'SubPage' || componentName === 'RootPage' || componentName === 'OutPage') {
    continue;
  }

  verifiedRoutes++;
  const hasHandleBg = /handle:\s*\{\s*bg:\s*["'`](white|gray)["'`]\s*\}/.test(block);
  if (!hasHandleBg) {
    console.error(`[라우트 배경 누락] <${componentName}> 라우트에 handle.bg가 선언되지 않았습니다:`);
    console.error(`   ${block.replace(/\s+/g, ' ')}\n`);
    totalErrors++;
  }
}

console.log(`총 ${verifiedRoutes}개 라우트 검사 완료\n`);

console.log('====================================================');
console.log('[2단계] 67개 전 페이지 컴포넌트 최상위 래퍼 배경색 전수 검사');
console.log('====================================================');

function getAllPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== '__tests__' && file !== 'layouts') {
        getAllPageFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const pageFiles = getAllPageFiles(pagesDir);
let verifiedPages = 0;

for (const filePath of pageFiles) {
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');

  verifiedPages++;

  const returnMatches = [...content.matchAll(/return\s*\(\s*<([A-Za-z0-9_]+)/g)];
  let rootTag = null;
  for (const m of returnMatches) {
    const tag = m[1];
    if (tag !== 'FeatureFlagGate' && tag !== 'Fragment' && tag !== '') {
      rootTag = tag;
      break;
    }
  }

  if (!rootTag) {
    const singleReturn = content.match(/return\s+<([A-Za-z0-9_]+)/);
    if (singleReturn && singleReturn[1] !== 'FeatureFlagGate') {
      rootTag = singleReturn[1];
    }
  }

  if (rootTag) {
    const styledRegex = new RegExp(`const\\s+${rootTag}\\s*=\\s*styled\\.[a-z0-9]+.*?\\x60([\\s\\S]*?)\\x60`, 'm');
    const styledMatch = content.match(styledRegex);
    if (styledMatch) {
      const styledBody = styledMatch[1];
      const bgLines = [];
      styledBody.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (/^background(-color)?\s*:/i.test(trimmed) && !/transparent|none/i.test(trimmed)) {
          bgLines.push(trimmed);
        }
      });

      if (bgLines.length > 0) {
        console.error(`[최상위 래퍼 배경 잔존] ${relPath} -> <${rootTag}>`);
        bgLines.forEach(l => console.error(`   ${l}`));
        totalErrors++;
      }
    }
  }
}

console.log(`총 ${verifiedPages}개 페이지 컴포넌트 검사 완료\n`);

console.log('====================================================');
if (totalErrors === 0) {
  console.log('🎉 [전수 검증 성공] 단 하나의 페이지도 누락 없이 배경색 구조가 완벽히 검증되었습니다!');
  console.log('====================================================');
  process.exit(0);
} else {
  console.error(`💥 [전수 검증 실패] 총 ${totalErrors}건의 배경색 구조 위반 사항이 발견되었습니다.`);
  console.log('====================================================');
  process.exit(1);
}
