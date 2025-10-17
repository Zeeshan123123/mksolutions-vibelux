#\!/bin/bash

echo "Searching for unused components..."
echo "=================================="

unused_count=0

# Get all component files
for component_file in $(find src/components -name "*.tsx" -type f); do
    # Extract component name from file path
    component_name=$(basename "$component_file" .tsx)
    
    # Search for imports of this component (exclude the component file itself)
    import_count=$(grep -r "import.*${component_name}" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" . 2>/dev/null | grep -v "$component_file" | wc -l)
    
    # If no imports found, it's likely unused
    if [ $import_count -eq 0 ]; then
        echo "Unused: $component_file"
        ((unused_count++))
    fi
done

echo ""
echo "Total unused components found: $unused_count"
