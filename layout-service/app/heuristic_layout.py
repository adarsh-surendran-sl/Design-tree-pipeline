"""Heuristic layout detection (always available; no Paddle required)."""

from __future__ import annotations

from PIL import Image
import numpy as np

from .ad_map import map_class_to_role, suggested_type_for_role


def _bg_color(img: Image.Image) -> tuple:
    arr = np.array(img.convert("RGB"))
    h, w = arr.shape[:2]
    corners = [arr[0, 0], arr[0, w - 1], arr[h - 1, 0], arr[h - 1, w - 1]]
    return tuple(int(c) for c in np.mean(corners, axis=0))


def _foreground_mask(arr: np.ndarray, bg: tuple, threshold: int = 28) -> np.ndarray:
    diff = np.abs(arr.astype(np.int16) - np.array(bg, dtype=np.int16))
    return (diff.sum(axis=2) >= threshold).astype(np.uint8)


def _row_stats(mask: np.ndarray):
    h, w = mask.shape
    rows = []
    for y in range(h):
        xs = np.where(mask[y] > 0)[0]
        if len(xs) == 0:
            rows.append({"count": 0, "span": 0, "span_ratio": 0.0, "min_x": 0, "max_x": 0})
            continue
        span = int(xs[-1] - xs[0] + 1)
        rows.append({
            "count": len(xs),
            "span": span,
            "span_ratio": span / w,
            "min_x": int(xs[0]),
            "max_x": int(xs[-1]),
        })
    return rows


def analyze_heuristic(image_path: str) -> dict:
    img = Image.open(image_path).convert("RGB")
    w, h = img.size
    arr = np.array(img)
    bg = _bg_color(img)
    bg_hex = "#%02x%02x%02x" % bg
    mask = _foreground_mask(arr, bg)
    rows = _row_stats(mask)

    footer_start = h
    for y in range(h - 1, -1, -1):
        r = rows[y]
        if r["span_ratio"] > 0.62 and r["count"] > w * 0.04:
            footer_start = y
        elif footer_start < h and y < footer_start - 4:
            break

    product_bottom = footer_start
    for y in range(max(0, footer_start - 12), footer_start):
        r = rows[y]
        if r["count"] > 0 and r["span_ratio"] < 0.55:
            product_bottom = min(product_bottom, y)

    center = w // 2
    half = int(w * 0.38)
    prod_pixels = []
    for y in range(product_bottom):
        for x in range(w):
            if mask[y, x] == 0:
                continue
            if abs(x - center) <= half:
                prod_pixels.append((x, y))
    if not prod_pixels:
        for y in range(product_bottom):
            for x in range(w):
                if mask[y, x]:
                    prod_pixels.append((x, y))

    regions = []
    reading_order = []

    if prod_pixels:
        xs = [p[0] for p in prod_pixels]
        ys = [p[1] for p in prod_pixels]
        x0, x1 = max(0, min(xs) - 2), min(w - 1, max(xs) + 2)
        y0, y1 = max(0, min(ys) - 2), min(h - 1, max(ys) + 2)
        bbox = [x0, y0, x1, y1]
        regions.append({
            "id": "product_1",
            "class": "image",
            "role": "product",
            "bbox": bbox,
            "confidence": 0.85,
            "renderStrategy": "crop",
            "suggestedType": "image",
        })
        reading_order.append("product_1")

    if footer_start < h:
        fb = [0, footer_start, w - 1, h - 1]
        regions.append({
            "id": "price_bar",
            "class": "footer",
            "role": "overlay",
            "bbox": fb,
            "confidence": 0.8,
            "renderStrategy": "primitive",
            "suggestedType": "shape",
        })
        reading_order.append("price_bar")

        scan_top = max(0, footer_start - int(h * 0.22))
        band_rows = 0
        bmin_x, bmin_y, bmax_x, bmax_y = w, h, 0, 0
        for y in range(scan_top, footer_start):
            r = rows[y]
            if r["count"] == 0 or r["span_ratio"] > 0.72:
                continue
            if r["span"] < w * 0.08 or r["span"] > w * 0.5:
                continue
            band_rows += 1
            bmin_x = min(bmin_x, r["min_x"])
            bmax_x = max(bmax_x, r["max_x"])
            bmin_y = min(bmin_y, y)
            bmax_y = max(bmax_y, y)
        if band_rows >= 2:
            regions.append({
                "id": "volume_badge",
                "class": "seal",
                "role": "badge",
                "bbox": [bmin_x, bmin_y, bmax_x, bmax_y],
                "confidence": 0.75,
                "renderStrategy": "primitive",
                "suggestedType": "text",
            })
            reading_order.append("volume_badge")

    return {
        "width": w,
        "height": h,
        "backgroundColor": bg_hex,
        "regions": regions,
        "reading_order": reading_order,
        "engine": "heuristic",
    }


def segment_product_heuristic(image_path: str, bbox: list) -> dict:
    full = analyze_heuristic(image_path)
    product = next((r for r in full["regions"] if r["role"] == "product"), None)
    if product:
        return {"bbox": product["bbox"], "engine": "heuristic"}
    if bbox and len(bbox) >= 4:
        return {"bbox": bbox, "engine": "heuristic_prompt"}
    return {"bbox": [0, 0, full["width"], full["height"]], "engine": "fallback"}
