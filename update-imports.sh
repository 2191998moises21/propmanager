#!/bin/bash
# Script to update all relative imports to @ aliases

echo "🔄 Updating imports in all components..."

# Function to update imports in a file
update_imports() {
    local file=$1
    echo "Updating: $file"

    # Backup original
    cp "$file" "$file.bak"

    # Update imports
    sed -i "s|from '../../../types'|from '@/types'|g" "$file"
    sed -i "s|from '../../types'|from '@/types'|g" "$file"
    sed -i "s|from '../types'|from '@/types'|g" "$file"

    sed -i "s|from '../../../portals/|from '@/portals/|g" "$file"
    sed -i "s|from '../../portals/|from '@/portals/|g" "$file"

    sed -i "s|from '../../ui/|from '@/components/ui/|g" "$file"
    sed -i "s|from '../ui/|from '@/components/ui/|g" "$file"

    sed -i "s|from '../../shared/|from '@/components/shared/|g" "$file"
    sed -i "s|from '../shared/|from '@/components/shared/|g" "$file"

    sed -i "s|from '../../icons/|from '@/components/icons/|g" "$file"
    sed -i "s|from '../icons/|from '@/components/icons/|g" "$file"

    # Remove backup if successful
    rm "$file.bak"
}

# Update all component files
find src/components -name "*.tsx" -type f | while read file; do
    update_imports "$file"
done

echo "✅ All imports updated!"
