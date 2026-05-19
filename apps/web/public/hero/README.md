# Hero layer assets

| File | Layer |
|------|--------|
| `sky.png` | Background sky |
| `cloud.png` | Cloud cutout on black (`mix-blend-mode: screen`) — back + front stacks |
| `apartment.png` | Building cutout (RGBA) |
| `clouds-back.png` | Legacy generated strip (unused) |
| `clouds-front.png` | Legacy generated strip (unused) |

Stack (back → front): sky → clouds-back → apartment → title → clouds-on-text → copy → clouds-front.

Replace any file to tune the composition. `clouds-*.png` were extracted from the bottom of `sky.png`; swap for designer exports when ready.
