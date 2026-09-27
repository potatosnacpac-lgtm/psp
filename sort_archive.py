"""Rebuild the project archive in descending film duration order."""

from concurrent.futures import ThreadPoolExecutor
from html import escape, unescape
from pathlib import Path
import json
import re
import subprocess


ROOT = Path(__file__).parent
PAGE = ROOT / "index.html"
NOTES = json.loads((ROOT / "project_notes.json").read_text(encoding="utf-8"))
html = PAGE.read_text(encoding="utf-8")
start_marker = '<div class="archive-grid" id="archive-grid">'
end_marker = '</div>\n      <p class="archive-empty"'
start = html.index(start_marker) + len(start_marker)
end = html.index(end_marker, start)


def attrs(tag):
    return {key: unescape(value) for key, value in re.findall(r'([\w-]+)="([^"]*)"', tag)}


records = {}
for match in re.finditer(r'<a class="archive-card[^\n]*?</a>', html[start:end]):
    card = match.group(0)
    data = attrs(card[: card.index(">") + 1])
    image = re.search(r'<img\s+([^>]+)>', card)
    if image:
        data["thumb"] = attrs(image.group(0))["src"]
    else:
        data["thumb"] = "assets/thumbs/mtf.jpg"
    records[data["data-video"]] = data

for match in re.finditer(r'<a class="feature-media media-trigger"[^>]+>[\s\S]*?</a>', html):
    card = match.group(0)
    data = attrs(card[: card.index(">") + 1])
    image = re.search(r'<img\s+([^>]+)>', card)
    data["thumb"] = attrs(image.group(0))["src"]
    records.setdefault(data["data-video"], data)

reel = re.search(r'<a class="reel-media media-trigger"[^>]+>', html)
reel_data = attrs(reel.group(0))
reel_data["thumb"] = "assets/thumbs/reel2026.jpg"
records.setdefault(reel_data["data-video"], reel_data)

# Watchlist has a local film and thumbnail but did not yet have a project card.
records.setdefault("assets/work/watchlist.mp4", {
    "data-video": "assets/work/watchlist.mp4",
    "data-title": "Watchlist",
    "data-category": "SaaS",
    "data-description": "Motion design for a product watchlist.",
    "thumb": "assets/thumbs/watchlist.jpg",
})
records.setdefault("assets/work/humbl-pr.mp4", {
    "data-video": "assets/work/humbl-pr.mp4",
    "data-title": "HUMBL — Product Reveal",
    "data-category": "Film",
    "data-description": "A cinematic product reveal for HUMBL eyewear.",
    "thumb": "assets/thumbs/humbl-pr.jpg",
})
records.setdefault("assets/work/humbl-ss.mp4", {
    "data-video": "assets/work/humbl-ss.mp4",
    "data-title": "HUMBL — Product Spot",
    "data-category": "Film",
    "data-description": "A short product spot for HUMBL eyewear.",
    "thumb": "assets/thumbs/humbl-ss.jpg",
})
records.setdefault("assets/work/yt-wrap.mp4", {
    "data-video": "assets/work/yt-wrap.mp4",
    "data-title": "YouTube Wrap",
    "data-category": "Film",
    "data-description": "A vertical year-in-review film for YouTube.",
    "thumb": "assets/thumbs/yt-wrap.jpg",
})
records.setdefault("assets/work/halvor-lines.mp4", {
    "data-video": "assets/work/halvor-lines.mp4",
    "data-title": "Signeasy — Halvor Lines",
    "data-category": "Film",
    "data-description": "A Signeasy brand story featuring Halvor Lines.",
    "thumb": "assets/thumbs/halvor-lines.jpg",
})
records.setdefault("assets/work/scalper-zone.mp4", {
    "data-video": "assets/work/scalper-zone.mp4",
    "data-title": "Scalper Zone",
    "data-category": "SaaS",
    "data-description": "A product film for Groww's Scalper Zone.",
    "thumb": "assets/thumbs/scalper-zone.jpg",
})
records.setdefault("assets/work/jio-ipo.mp4", {
    "data-video": "assets/work/jio-ipo.mp4",
    "data-title": "Jio IPO",
    "data-category": "SaaS",
    "data-description": "A Groww film for the Reliance Jio IPO.",
    "thumb": "assets/thumbs/jio-ipo.jpg",
})
records.setdefault("assets/work/prime-7.mp4", {
    "data-video": "assets/work/prime-7.mp4",
    "data-title": "MF Prime",
    "data-category": "SaaS",
    "data-description": "A vertical product film introducing MF Prime.",
    "thumb": "assets/thumbs/prime-7.jpg",
})


def duration(record):
    result = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1",
         str(ROOT / record["data-video"])], text=True
    )
    return float(result.strip())


with ThreadPoolExecutor(max_workers=8) as pool:
    durations = dict(zip(records, pool.map(duration, records.values())))

missing_notes = {Path(video).name for video in records} - NOTES.keys()
if missing_notes:
    raise ValueError(f"Missing project notes: {sorted(missing_notes)}")


def runtime(seconds):
    total = round(seconds)
    return f"{total // 60:02d}:{total % 60:02d}"


cards = []
for number, (video, data) in enumerate(
    sorted(records.items(), key=lambda pair: durations[pair[0]], reverse=True), 1
):
    title = data["data-title"]
    category = data["data-category"]
    description = data.get("data-description", "")
    thumb = data["thumb"]
    note = NOTES[Path(video).name]
    brief = note["brief"]
    approach = note["approach"]
    seconds = durations[video]
    fresh = video in {
        "assets/work/humbl.mp4", "assets/work/gully-gang-spaceship.mp4",
        "assets/work/humbl-pr.mp4", "assets/work/humbl-ss.mp4",
        "assets/work/yt-wrap.mp4", "assets/work/halvor-lines.mp4",
        "assets/work/scalper-zone.mp4", "assets/work/jio-ipo.mp4",
        "assets/work/prime-7.mp4",
    }
    badge = '<span class="archive-new" aria-hidden="true">NEW</span>' if fresh else ""
    classes = "archive-card archive-card-new media-trigger" if fresh else "archive-card media-trigger"
    search = f"{title} {category} {description} {brief} {approach}".lower()
    cards.append(
        f'<a class="{classes}" href="{escape(video)}" data-video="{escape(video)}" '
        f'data-title="{escape(title)}" data-category="{escape(category)}" '
        f'data-description="{escape(description)}" data-brief="{escape(brief)}" '
        f'data-approach="{escape(approach)}" data-filter-category="{escape(category)}" '
        f'data-duration="{seconds:.3f}" data-search="{escape(search)}" '
        f'aria-label="Play {escape(title)}">'
        f'<span class="archive-image"><img src="{escape(thumb)}" alt="Still from {escape(title)}" '
        f'loading="lazy" decoding="async">{badge}<span class="archive-play" aria-hidden="true">↗</span></span>'
        f'<span class="archive-info"><span><b>{escape(title)}</b>'
        f'<small>{escape(category)} · {runtime(seconds)}</small></span>'
        f'<span class="archive-num">{number:02d}</span></span>'
        f'<p class="archive-note">{escape(brief)} {escape(approach)}</p></a>'
    )

html = html[:start] + "\n".join(cards) + html[end:]
html = re.sub(r'id="archive-count">\d+', f'id="archive-count">{len(cards)}', html)
html = re.sub(r'id="film-index">FRAME 01 / \d+', f'id="film-index">FRAME 01 / {len(cards):02d}', html)
PAGE.write_text(html, encoding="utf-8")
print(f"Sorted {len(cards)} films, {runtime(max(durations.values()))} to {runtime(min(durations.values()))}.")
