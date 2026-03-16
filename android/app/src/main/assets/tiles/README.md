# Tashkent Offline Map Tiles

This directory is the target for bundled offline tile assets.

## Tile Structure

Tiles follow the standard OSM `z/x/y.png` hierarchy:

```
tiles/
  10/
    604/
      371.png
      372.png
      ...
    605/
      ...
  11/
    ...
  ...
  17/
    ...
```

## Generating Tiles

Use [mbtiles-extractor](https://github.com/mapbox/mbutil) or a tool such as
[tile-dl](https://github.com/deviantony/tile-dl) to download tiles for the
Tashkent bounding box:

| Parameter | Value         |
|-----------|---------------|
| West      | 69.1          |
| South     | 41.2          |
| East      | 69.45         |
| North     | 41.4          |
| Min zoom  | 10            |
| Max zoom  | 17            |
| Source    | OSM (or any compatible tile server) |

Example using `tile-dl`:
```bash
tile-dl \
  --min-zoom 10 --max-zoom 17 \
  --bbox 69.1,41.2,69.45,41.4 \
  --output android/app/src/main/assets/tiles
```

## Deployment

1. Place the generated tile folders under this directory before building.
2. On first launch the app copies the tiles from assets to the document
   directory so the offline `UrlTile` component can serve them via `file://` URIs.
