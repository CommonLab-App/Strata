#!/usr/bin/env sh
# Builds and copies dist/ to the host. The target (user@host:path) lives in .env as STRATA_DEPLOY, never in the repo.
set -eu
cd "$(dirname "$0")/.."
. ./.env
npm run build
rsync -az --delete --chmod=D755,F644 --exclude media/ --exclude basemap/ dist/ "$STRATA_DEPLOY/"
# The basemap folder is uploaded once by hand (scripts/build-basemap.sh) and lives beside the app; never deleted here.
# Media is large and changes rarely: copied without --delete so a half-finished upload never removes a video.
rsync -az --chmod=D755,F644 dist/media/ "$STRATA_DEPLOY/media/"
