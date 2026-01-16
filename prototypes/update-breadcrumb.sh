#!/bin/bash

# List of files to update
FILES=(
    "document-in/main/page.tsx"
    "document-in/coordinate/page.tsx"
    "document-in/info/page.tsx"
    "document-in/important/page.tsx"
    "document-in/opinion/page.tsx"
    "document-in/search/page.tsx"
    "document-out/page.tsx"
    "document-out/main/page.tsx"
    "document-out/combine/page.tsx"
    "document-out/know/page.tsx"
    "document-out/important/page.tsx"
    "document-out/opinion/page.tsx"
    "document-out/search/page.tsx"
    "document-internal/page.tsx"
    "document-internal/register/page.tsx"
    "document-internal/approve/page.tsx"
    "document-internal/publish/page.tsx"
    "document-internal/search/page.tsx"
)

BASE_PATH="/Users/binhps/Works/Projects/idoc-fontend-v3/prototypes/src/app"

for file in "${FILES[@]}"; do
    FULL_PATH="$BASE_PATH/$file"
    if [ -f "$FULL_PATH" ]; then
        echo "Updating: $file"
        
        # Use perl for multiline replacement
        perl -i -0pe '
            # Pattern 1: Replace separate breadcrumb + filters with merged version
            s/{\/\* Page Header \*\/}\s*<div className="flex items-center justify-between">\s*<div>\s*(<nav className="flex items-center gap-2 text-sm text-\[hsl\(var\(--v3-muted-foreground\)\)\] mb-1">.*?<\/nav>)\s*<\/div>\s*<\/div>\s*{\/\* Filters \*\/}\s*(<DocumentFilters[^\/]*\/>)/{\/\* Breadcrumb + Filters - Same Row \*\/}\n                <div className="flex items-center justify-between gap-4">\n                    $1\n                    $2\n                <\/div>/gs;
            
            # Remove mb-1 from nav after merge
            s/(<nav className="flex items-center gap-2 text-sm text-\[hsl\(var\(--v3-muted-foreground\)\)\]) mb-1(">)/$1 shrink-0$2/g;
        ' "$FULL_PATH"
    else
        echo "File not found: $file"
    fi
done

echo "Done!"
