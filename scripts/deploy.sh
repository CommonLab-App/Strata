#!/usr/bin/env sh
# Builds and copies dist/ to the host. The target (user@host:path) lives in .env as STRATA_DEPLOY, never in the repo.
set -eu
cd "$(dirname "$0")/.."
. ./.env
npm run build
rsync -az --delete --exclude media/ dist/ "$STRATA_DEPLOY/"
# Media is large and changes rarely: copied without --delete so a half-finished upload never removes a video.
rsync -az dist/media/ "$STRATA_DEPLOY/media/"
