# Snacpac — Image Drop Guide

Save your images into `snacpac/assets/work/` with these exact filenames:

| Filename                    | Image                                    | Card Title          |
|-----------------------------|------------------------------------------|---------------------|
| `01-glass-panels.jpg`       | 3D amber + blue glass panels render      | Design System       |
| `02-alpha-bets.jpg`         | The Alpha Bets book cover (Groww)        | The Alpha Bets      |
| `03-msf-poster.jpg`         | MSF Movement Evolution red poster        | Movement Evolution  |
| `04-msf-illustration.jpg`   | Sepia silhouette illustration            | Field Stories       |
| `05-golden-grid.jpg`        | Gold/black grid layout design            | Golden Grid         |
| `06-ar-glasses.jpg`         | Dark 3D AR glasses render                | AR Product Render   |
| `07-stats-chart.jpg`        | Purple bar chart (26% vs 81%)            | Impact in Numbers   |

**Video** — already copied:
- `graph.mp4` ✅ (already in assets/work/)

## Folder structure
```
snacpac/
  index.html
  assets/
    work/
      01-glass-panels.jpg   ← drop here
      02-alpha-bets.jpg     ← drop here
      03-msf-poster.jpg     ← drop here
      04-msf-illustration.jpg ← drop here
      05-golden-grid.jpg    ← drop here
      06-ar-glasses.jpg     ← drop here
      07-stats-chart.jpg    ← drop here
      graph.mp4             ✅ already here
```

## Tips
- Any image format works: `.jpg`, `.jpeg`, `.png`, `.webp`
- Images are cropped to 16:9 by default — centre-crop for best results
- To change the title/description, edit the `card-title` and `card-desc` in index.html
- To add more cards, duplicate a `<article class="work-card">` block
