#!/usr/bin/env python3
"""Import one turntable recording of a mineral or rock into the sample media folder.

    scripts/import_sample.py recording.mp4 --id quartz
    scripts/import_sample.py IMG_0231.MOV --id granite --start 2 --end 62

Writes public/media/samples/<id>/turntable.mp4 (H.264, yuv420p, 30 fps, at most 1280 wide, silent, faststart,
at most 60 s), poster.jpg (a frame from one second in), and meta.json. Every tag in the source is dropped: phone
recordings carry GPS and device fields, and the project stores no location data. The output is probed afterwards and
the import fails if any tag survived. public/media/ is not in git: copy it to the server with the build.

Provenance: a small tag (default "<year> stratalab.app", see --tag) is drawn into the bottom-right corner of every
frame, so it survives screenshots, and written as the file's one `comment` tag, so it survives copying. It is a
mark of origin, not a copyright notice.

Needs ffmpeg with drawtext (libfreetype) and ffprobe on PATH, and a TrueType font (--font; found with fc-match).
"""
import shutil
import tempfile
import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

MAX_WIDTH = 1280
MAX_SECONDS = 60
FPS = 30
CRF = 24  # about 3 to 5 MB per minute at 720p
DEFAULT_TAG = f"{date.today().year} stratalab.app"
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def run(*args: str) -> str:
    try:
        return subprocess.run(args, check=True, capture_output=True, text=True).stdout
    except FileNotFoundError:
        sys.exit(f"{args[0]} not found: install ffmpeg")
    except subprocess.CalledProcessError as e:
        sys.exit(f"{args[0]} failed:\n{e.stderr.strip()}")


def probe(path: Path) -> dict:
    return json.loads(run("ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)))


def tags(info: dict) -> dict:
    found = dict(info.get("format", {}).get("tags", {}))
    for stream in info.get("streams", []):
        found.update(stream.get("tags", {}))
    return found


def find_font(explicit: str | None) -> Path:
    if explicit:
        if Path(explicit).is_file():
            return Path(explicit)
        sys.exit(f"font not found: {explicit}")
    if shutil.which("fc-match"):
        found = subprocess.run(["fc-match", "-f", "%{file}", "sans-serif"], capture_output=True, text=True).stdout.strip()
        if found and Path(found).is_file():
            return Path(found)
    for candidate in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/System/Library/Fonts/Helvetica.ttc", "C:/Windows/Fonts/arial.ttf"):
        if Path(candidate).is_file():
            return Path(candidate)
    sys.exit("no font found for the provenance tag: pass --font path/to/font.ttf")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("video", type=Path)
    p.add_argument("--id", required=True, help="sample id as in data/samples/*.json, e.g. quartz")
    p.add_argument("--start", type=float, default=0, help="seconds to skip at the start")
    p.add_argument("--end", type=float, help="seconds; default is start + 60 or the end of the file")
    p.add_argument("--out", type=Path, default=Path("public/media/samples"))
    p.add_argument("--tag", default=DEFAULT_TAG, help=f"provenance text drawn into the frame and kept as the comment tag (default: {DEFAULT_TAG!r}); empty disables")
    p.add_argument("--font", help="TrueType font file for the tag; default: fc-match sans-serif")
    a = p.parse_args()

    if not ID_RE.match(a.id):
        sys.exit(f"--id must be kebab-case: {a.id!r}")
    if not a.video.is_file():
        sys.exit(f"no such file: {a.video}")

    src = probe(a.video)
    video_streams = [s for s in src["streams"] if s["codec_type"] == "video"]
    if not video_streams:
        sys.exit("no video stream")
    duration = float(src["format"].get("duration", 0))
    end = min(a.end if a.end is not None else a.start + MAX_SECONDS, duration if duration else a.start + MAX_SECONDS)
    length = min(end - a.start, MAX_SECONDS)
    if length <= 0:
        sys.exit("nothing left after --start/--end")

    out = a.out / a.id
    out.mkdir(parents=True, exist_ok=True)
    mp4, poster, meta = out / "turntable.mp4", out / "poster.jpg", out / "meta.json"

    # The tag goes in via a text file so no character needs escaping for the filter parser. Size and margin scale
    # with the frame height; white with a dark shadow reads on light and dark backgrounds alike.
    filters = [f"scale='min({MAX_WIDTH},iw)':-2", f"fps={FPS}"]
    tagfile = None
    if a.tag:
        tagfile = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8")
        tagfile.write(a.tag)
        tagfile.close()
        font = str(find_font(a.font)).replace("\\", "/").replace(":", "\\:")
        filters.append(
            f"drawtext=fontfile='{font}':textfile='{tagfile.name}':fontsize=h/36:fontcolor=white@0.85"
            ":shadowcolor=black@0.6:shadowx=2:shadowy=2:x=w-tw-h/40:y=h-th-h/40"
        )
    # -map_metadata -1 drops container and stream tags; -map 0:v:0 drops audio, subtitles and data tracks (where
    # phones keep motion and GPS tracks); the scale keeps even dimensions for yuv420p.
    try:
        run(
            "ffmpeg", "-y", "-v", "error", "-ss", str(a.start), "-t", f"{length:.3f}", "-i", str(a.video),
            "-map", "0:v:0", "-map_metadata", "-1", "-map_chapters", "-1",
            "-vf", ",".join(filters),
            *(["-metadata", f"comment={a.tag}"] if a.tag else []),
            "-c:v", "libx264", "-preset", "slow", "-crf", str(CRF), "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            str(mp4),
        )
    finally:
        if tagfile:
            Path(tagfile.name).unlink(missing_ok=True)
    run("ffmpeg", "-y", "-v", "error", "-ss", str(min(1.0, length / 2)), "-i", str(mp4), "-frames:v", "1", "-vf", "scale='min(640,iw)':-2", "-q:v", "3", str(poster))

    done = probe(mp4)
    harmless = {"encoder", "handler_name", "vendor_id", "language", "major_brand", "minor_version", "compatible_brands"}
    leftover = {k: v for k, v in tags(done).items() if k.lower() not in harmless and not (k.lower() == "comment" and v == a.tag)}
    if leftover:
        mp4.unlink()
        sys.exit(f"tags survived the import, refusing to keep the file: {leftover}")

    stream = next(s for s in done["streams"] if s["codec_type"] == "video")
    record = {
        "id": a.id,
        "file": mp4.name,
        "poster": poster.name,
        "seconds": round(float(done["format"]["duration"]), 2),
        "width": stream["width"],
        "height": stream["height"],
        "bytes": mp4.stat().st_size,
        "imported": date.today().isoformat(),
        "tag": a.tag or None,
        "source_sha256": hashlib.sha256(a.video.read_bytes()).hexdigest(),
    }
    meta.write_text(json.dumps(record, indent=2) + "\n")
    print(json.dumps(record, indent=2))
    print(f"\nadd to the library entry for {a.id}:\n  \"turntable\": {{ \"file\": \"turntable.mp4\", \"poster\": \"poster.jpg\", \"seconds\": {record['seconds']} }}")


if __name__ == "__main__":
    main()
