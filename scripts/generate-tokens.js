import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const tokensJsonPath = path.join(projectRoot, "src", "styles", "tokens", "tokens.json");
const outputCssPath = path.join(projectRoot, "src", "styles", "tokens", "tokens.css");
const outputTsPath = path.join(projectRoot, "src", "styles", "tokens", "index.ts");

const rawData = JSON.parse(fs.readFileSync(tokensJsonPath, "utf-8"));
const tokenSet = rawData["Variable collection/Mode 1"] || rawData;

// Helper to look up raw token value by path like ["Blue", "Blue600"] or ["fontFamilies", "pretendard"]
function getRawTokenByPath(pathArray) {
  let current = tokenSet;
  for (const key of pathArray) {
    if (!current || typeof current !== "object") return undefined;
    current = current[key];
  }
  return current;
}

// Helper to resolve alias string like "{Blue.Blue600}"
function resolveValue(val, depth = 0) {
  if (depth > 10) return val; // prevent infinite loop
  if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
    const refPath = val.slice(1, -1).split(".");
    const targetToken = getRawTokenByPath(refPath);
    if (targetToken && targetToken.$value !== undefined) {
      return resolveValue(targetToken.$value, depth + 1);
    }
  }
  return val;
}

// Convert fontWeight names to CSS numeric weights
function normalizeFontWeight(weightStr) {
  const resolved = resolveValue(weightStr);
  if (typeof resolved === "number") return resolved;
  const str = String(resolved).toLowerCase();
  if (str.includes("bold") && !str.includes("semi")) return 700;
  if (str.includes("semibold")) return 600;
  if (str.includes("regular") || str.includes("normal")) return 400;
  if (str.includes("medium")) return 500;
  if (str.includes("light")) return 300;
  return 400;
}

// Convert fontSize to px
function normalizeFontSize(sizeVal) {
  const resolved = resolveValue(sizeVal);
  if (typeof resolved === "number") return `${resolved}px`;
  if (typeof resolved === "string") {
    if (resolved.endsWith("px") || resolved.endsWith("rem") || resolved.endsWith("em")) return resolved;
    if (!isNaN(Number(resolved))) return `${resolved}px`;
  }
  return String(resolved);
}

// Convert lineHeight
function normalizeLineHeight(lhVal) {
  const resolved = resolveValue(lhVal);
  if (typeof resolved === "string" && resolved.endsWith("%")) {
    const num = parseFloat(resolved) / 100;
    return String(num);
  }
  return String(resolved);
}

// Convert letterSpacing
function normalizeLetterSpacing(lsVal) {
  const resolved = resolveValue(lsVal);
  if (typeof resolved === "string" && resolved.endsWith("%")) {
    const num = parseFloat(resolved) / 100;
    return `${num}em`;
  }
  return String(resolved);
}

// Flatten color categories
const colorCategories = ["Main", "Bg", "Gray", "Blue", "Gold", "Text", "CTA", "Status"];
const cssVariables = [];
const tsColors = {};

colorCategories.forEach((cat) => {
  const catObj = tokenSet[cat];
  if (!catObj) return;

  tsColors[cat.toLowerCase()] = {};

  Object.keys(catObj).forEach((itemKey) => {
    const item = catObj[itemKey];
    if (!item || item.$value === undefined) return;

    const rawVal = item.$value;
    const resolvedVal = resolveValue(rawVal);
    
    // Create CSS Variable name: e.g., --color-main-main1, --color-gray-100, --color-cta-default
    const varName = `--color-${cat.toLowerCase()}-${itemKey.toLowerCase()}`;
    cssVariables.push(`  ${varName}: ${resolvedVal};`);

    tsColors[cat.toLowerCase()][itemKey.toLowerCase()] = resolvedVal;
  });
});

// Process Font Tokens
const fontFamilies = {};
if (tokenSet.fontFamilies) {
  Object.keys(tokenSet.fontFamilies).forEach((key) => {
    const val = resolveValue(tokenSet.fontFamilies[key].$value);
    fontFamilies[key] = val;
    cssVariables.push(`  --font-family-${key.toLowerCase()}: '${val}', sans-serif;`);
  });
}

// Process Typography Tokens
const typographyCssClasses = [];
const typographyTsDefinitions = {};

const fontKeys = Object.keys(tokenSet).filter((key) => {
  const item = tokenSet[key];
  return item && item.$type === "typography" && item.$value;
});

fontKeys.forEach((key) => {
  const typoObj = tokenSet[key].$value;
  const family = resolveValue(typoObj.fontFamily);
  const weight = normalizeFontWeight(typoObj.fontWeight);
  const size = normalizeFontSize(typoObj.fontSize);
  const lineHeight = normalizeLineHeight(typoObj.lineHeight);
  const letterSpacing = normalizeLetterSpacing(typoObj.letterSpacing);

  const className = `typo-${key.toLowerCase().replace(/[\s_]+/g, "-")}`;
  const camelName = key
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join("");

  typographyTsDefinitions[camelName] = {
    fontFamily: family,
    fontWeight: weight,
    fontSize: size,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
  };

  typographyCssClasses.push(`.${className} {
  font-family: '${family}', sans-serif;
  font-weight: ${weight};
  font-size: ${size};
  line-height: ${lineHeight};
  letter-spacing: ${letterSpacing};
}`);
});

// Generate CSS File Content
const cssContent = `/* Auto-generated design tokens from src/styles/tokens/tokens.json */
:root {
${cssVariables.join("\n")}
}

${typographyCssClasses.join("\n\n")}
`;

fs.writeFileSync(outputCssPath, cssContent, "utf-8");
console.log(`Generated CSS tokens at ${outputCssPath}`);

// Generate TypeScript File Content
const tsContent = `/* Auto-generated design tokens from src/styles/tokens/tokens.json */
import { css } from "styled-components";

export const colors = ${JSON.stringify(tsColors, null, 2)} as const;

export const fontFamilies = ${JSON.stringify(fontFamilies, null, 2)} as const;

export const typographySpecs = ${JSON.stringify(typographyTsDefinitions, null, 2)} as const;

export type TypographyName = keyof typeof typographySpecs;

export const typography = {
${Object.entries(typographyTsDefinitions)
  .map(
    ([name, spec]) => `  ${name}: css\`
    font-family: '\${typographySpecs.${name}.fontFamily}', sans-serif;
    font-weight: \${typographySpecs.${name}.fontWeight};
    font-size: \${typographySpecs.${name}.fontSize};
    line-height: \${typographySpecs.${name}.lineHeight};
    letter-spacing: \${typographySpecs.${name}.letterSpacing};
  \`,`
  )
  .join("\n")}
};

export const tokens = {
  colors,
  fontFamilies,
  typographySpecs,
  typography,
} as const;

export type Tokens = typeof tokens;
export default tokens;
`;

fs.writeFileSync(outputTsPath, tsContent, "utf-8");
console.log(`Generated TS tokens at ${outputTsPath}`);
