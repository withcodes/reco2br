#!/bin/bash
echo ""
echo "  Pushing KnightOwl GST to GitHub..."
echo "  Repo: https://github.com/withcodes/reco2br.git"
echo ""

git init
git add .
git commit -m "feat: KnightOwl GST v2.0 - CA Edition"

git remote add origin https://github.com/withcodes/reco2br.git
git branch -M main
git push -u origin main

echo ""
echo "  Done! https://github.com/withcodes/reco2br"
