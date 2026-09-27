# Snacpac media guide

The portfolio is a static site. Project cards are in `index.html`, styling is in `site.css` and `editorial.css`, and the filter and film viewer are in `site.js`.

## Project media

- Put website videos in `assets/work/` as H.264/AAC MP4 files with fast-start metadata.
- Put card images in `assets/thumbs/` as JPG files. Archive cards use `loading="lazy"`.
- Each archive card needs matching `href` and `data-video` paths, plus `data-title`, `data-category`, `data-description`, `data-filter-category`, and `data-search` values.
- Run `python sort_archive.py` after adding a project. It measures each film with ffprobe, sorts the complete archive by duration, and updates the displayed runtimes and counts. If you add a category, add a matching `data-filter` button.
- Each project has a short brief and approach in `project_notes.json`. Update those notes with the final client-approved brief before running `sort_archive.py`; the script adds them to the archive cards and film viewer.

## Added films

| Project | Website video | Thumbnail |
| --- | --- | --- |
| HUMBL | `assets/work/humbl.mp4` | `assets/thumbs/humbl.jpg` |
| HUMBL — Product Reveal | `assets/work/humbl-pr.mp4` | `assets/thumbs/humbl-pr.jpg` |
| HUMBL — Product Spot | `assets/work/humbl-ss.mp4` | `assets/thumbs/humbl-ss.jpg` |
| Gully Gang — Spaceship | `assets/work/gully-gang-spaceship.mp4` | `assets/thumbs/gully-gang-spaceship.jpg` |
| YouTube Wrap | `assets/work/yt-wrap.mp4` | `assets/thumbs/yt-wrap.jpg` |
| Signeasy — Halvor Lines | `assets/work/halvor-lines.mp4` | `assets/thumbs/halvor-lines.jpg` |
| Scalper Zone | `assets/work/scalper-zone.mp4` | `assets/thumbs/scalper-zone.jpg` |
| Jio IPO | `assets/work/jio-ipo.mp4` | `assets/thumbs/jio-ipo.jpg` |
| MF Prime | `assets/work/prime-7.mp4` | `assets/thumbs/prime-7.jpg` |

The Gully Gang website copy is compressed and starts after the source render's production slate. The supplied source files are unchanged.
The YouTube Wrap and Halvor Lines website copies are compressed for browser playback; their source files are unchanged.
