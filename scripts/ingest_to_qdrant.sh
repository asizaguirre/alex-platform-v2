#!/bin/bash

# Placeholder ingestion script.
# Iterates over rag/documents and prints metadata.
BASE="/IA/workspace/alex-platform-v2/rag/documents"
for f in "$BASE"/*; do
  echo 'FILE:' $f
  if [[ $f == *.meta.json ]]; then continue; fi
  meta="$f.meta.json"
  if [ -f "$meta" ]; then
    echo 'Found metadata for' $f
  fi
done
