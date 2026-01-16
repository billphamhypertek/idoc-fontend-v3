const fs = require('fs');
const path = require('path');

const files = [
    'document-in/coordinate/page.tsx',
    'document-in/important/page.tsx',
    'document-in/info/page.tsx',
    'document-in/opinion/page.tsx',
    'document-in/search/page.tsx',
    'document-internal/approve/page.tsx',
    'document-internal/publish/page.tsx',
    'document-internal/register/page.tsx',
    'document-internal/search/page.tsx',
    'document-out/combine/page.tsx',
    'document-out/important/page.tsx',
    'document-out/know/page.tsx',
    'document-out/main/page.tsx',
    'document-out/opinion/page.tsx',
    'document-out/search/page.tsx',
];

const basePath = '/Users/binhps/Works/Projects/idoc-fontend-v3/prototypes/src/app';

// Pattern to match the old structure
const oldPattern = /\{\/\* Page Header \*\/\}\s*<div className="flex items-center justify-between">\s*<div>\s*(<nav className="flex items-center gap-2 text-sm text-\[hsl\(var\(--v3-muted-foreground\)\)\] mb-1">[\s\S]*?<\/nav>)\s*<\/div>\s*<\/div>\s*\{\/\* Filters \*\/\}\s*(<DocumentFilters[\s\S]*?\/>)/g;

for (const file of files) {
    const fullPath = path.join(basePath, file);

    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${file}`);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    const newContent = content.replace(oldPattern, (match, navPart, filterPart) => {
        // Fix nav styling: remove mb-1, add shrink-0
        const fixedNav = navPart.replace('mb-1">', ' shrink-0">');

        return `{/* Breadcrumb + Filters - Same Row */}
                <div className="flex items-center justify-between gap-4">
                    ${fixedNav}
                    ${filterPart}
                </div>`;
    });

    if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated: ${file}`);
    } else {
        console.log(`No changes: ${file}`);
    }
}

console.log('Done!');
