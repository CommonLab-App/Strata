#!/usr/bin/env bash
# Builds the self-hosted basemap folder the app points at with VITE_BASEMAP_URL:
#   world.pmtiles   zoom 0..MAXZOOM extract of a Protomaps daily planet build (OpenStreetMap data, ODbL)
#   fonts/          Noto Sans glyphs (OFL) and sprites/ from protomaps/basemaps-assets
#   PROVENANCE.txt  what was built from what, when
# Needs the pmtiles CLI (github.com/protomaps/go-pmtiles releases), curl and unzip. Range requests only: nothing
# near the 139 GB planet file is downloaded. Upload the folder to the host as-is; PMTiles is read by HTTP range
# requests, so any static server works. Rebuild a few times a year to pick up map edits.
#
# Usage: scripts/build-basemap.sh [YYYYMMDD build, default yesterday] [maxzoom, default 8] [out dir, default basemap]
set -euo pipefail
BUILD=${1:-$(date -u -d yesterday +%Y%m%d)}
MAXZOOM=${2:-8}
OUT=${3:-basemap}
mkdir -p "$OUT"
pmtiles extract "https://build.protomaps.com/$BUILD.pmtiles" "$OUT/world.pmtiles" --maxzoom="$MAXZOOM"
curl -sL https://github.com/protomaps/basemaps-assets/archive/refs/heads/main.zip -o "$OUT/assets.zip"
rm -rf "$OUT/tmp" "$OUT/fonts" "$OUT/sprites"
unzip -qo "$OUT/assets.zip" -d "$OUT/tmp"
mv "$OUT/tmp/basemaps-assets-main/fonts" "$OUT/fonts"
mv "$OUT/tmp/basemaps-assets-main/sprites" "$OUT/sprites"
rm -rf "$OUT/tmp" "$OUT/assets.zip"
cat > "$OUT/PROVENANCE.txt" <<TXT
Basemap for StrataLab, built $(date -u +%F).
world.pmtiles: Protomaps planet build $BUILD (https://build.protomaps.com/$BUILD.pmtiles), zoom 0 to $MAXZOOM.
  Map data (c) OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright); tiles by Protomaps (https://protomaps.com).
fonts/, sprites/: https://github.com/protomaps/basemaps-assets; fonts under the SIL Open Font License (fonts/OFL.txt).
TXT
pmtiles show "$OUT/world.pmtiles" | head -n 12
du -sh "$OUT"
