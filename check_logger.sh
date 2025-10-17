#!/bin/bash

echo "Files with logger usage:"
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "logger\." 2>/dev/null > /tmp/files_with_logger.txt

echo "Files with logger import:"
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*logger.*from" 2>/dev/null > /tmp/files_with_import.txt

echo "Files that need logger import:"
comm -23 <(sort /tmp/files_with_logger.txt) <(sort /tmp/files_with_import.txt) > /tmp/files_need_import.txt

while read file; do
  echo "/Users/blakelange/vibelux-app/src/$file" | sed 's|/\./|/|'
done < /tmp/files_need_import.txt

rm -f /tmp/files_with_logger.txt /tmp/files_with_import.txt /tmp/files_need_import.txt