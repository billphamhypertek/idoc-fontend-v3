const fs = require('fs');
const path = require('path');

const files = [
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

// Pattern to fix corrupted structure - find the broken pattern and fix it
const brokenPattern = /(\{\/\* Breadcrumb \+ Filters - Same Row \*\/\}\s*<div className="flex items-center justify-between gap-4">)\s*(<nav className="flex items-center gap-2 text-sm text-\[hsl\(var\(--v3-muted-foreground\)\)\] shrink-0">[\s\S]*?<\/nav>)\s*(<DocumentFilters[\s\S]*?\/>)\s*(\{\/\* Tabs \+ Actions \*\/\})/g;

for (const file of files) {
    const fullPath = path.join(basePath, file);

    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${file}`);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    const newContent = content.replace(brokenPattern, (match, start, nav, filters, tabsComment) => {
        // Fix indentation and add closing div
        const fixedNav = nav.replace(/^(\s+)/gm, '                    ');
        const fixedFilters = filters.replace(/^(\s+)/gm, '                    ');

        return `{/* Breadcrumb + Filters - Same Row */}
                <div className="flex items-center justify-between gap-4">
                    <nav className="flex items-center gap-2 text-sm text-[hsl(var(--v3-muted-foreground))] shrink-0">
                        ${nav.match(/<span>.*?<\/span>/g).join('\n                        ')}
                    </nav>
                    <DocumentFilters
                        searchPlaceholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                        showDateFilter={true}
                        showAdvancedSearch={true}
                    />
                </div>

                {/* Tabs + Actions */}`;
    });

    if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Fixed: ${file}`);
    } else {
        console.log(`No changes needed or different pattern: ${file}`);
    }
}

console.log('Done!');
