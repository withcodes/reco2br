@echo off
echo.
echo   Pushing KnightOwl GST to GitHub...
echo   Repo: https://github.com/withcodes/reco2br.git
echo.

git init
git add .
git commit -m "feat: KnightOwl GST v2.0 - CA Edition

- Full GSTR-2B vs Purchase Register reconciliation engine
- O to 0 normalization, fuzzy matching, split-rate aggregation
- Smart flags: RCM, ITC Blocked, Transport, Prior Period
- ITC leakage detection (tested: Rs 24,194 gap on real data)
- 5-tab Excel export with ITC Summary
- Multi-tenant SaaS with Supabase auth
- KnightOwl landing page with 3 pricing tiers
- CA firm modules: Clients, Team, Supplier Health, Notices, Due Dates
- GSTR-3B draft pre-fill, real pagination, action tracker
- Docker + Railway + Vercel deployment ready"

git remote add origin https://github.com/withcodes/reco2br.git
git branch -M main
git push -u origin main

echo.
echo   Done! Check: https://github.com/withcodes/reco2br
pause
