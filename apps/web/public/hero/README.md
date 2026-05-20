# Hero layer assets

| File | Layer |
|------|--------|
| `sky` (CSS gradient) | Background sky + sunset |
| `cloud.png` | Cloud cutout on black (`mix-blend-mode: screen`) |
| `tower.png` | **Primary building** — glass high-rise cutout (RGBA) |
| `tower-source.jpg` | Unsplash source for `tower.png` |
| `apartment.png` | Legacy building cutout |
| `victoria.png` | Legacy Hamptons cutout |
| `building.png` | Legacy short strip (unused) |

Stack (back → front): sky → sunset → property clouds → **tower** → headline → text clouds → copy.

## Regenerate tower cutout

```sh
cd apps/web
python3 scripts/prepare-tower-hero.py
```

Tower source: [Unsplash — luxury residential glass high-rise](https://unsplash.com/photos/4ZeTJcaspAk) by Aalo Lens (`photo-1758448511487-15f69dd6107b`).
