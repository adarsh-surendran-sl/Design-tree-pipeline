"""Layout analysis entry — Paddle when available, else heuristic."""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

from .heuristic_layout import analyze_heuristic

_paddle_engine = None


def _try_paddle():
    global _paddle_engine
    if _paddle_engine is not None:
        return _paddle_engine
    if os.environ.get("PADDLE_LAYOUT", "0") != "1":
        return None
    try:
        from paddleocr import LayoutDetection  # type: ignore

        _paddle_engine = LayoutDetection(model_name="PP-DocLayoutV2")
        return _paddle_engine
    except Exception as e:
        print(f"Paddle layout unavailable: {e}")
        return None


def _analyze_paddle(image_path: str) -> Optional[Dict[str, Any]]:
    engine = _try_paddle()
    if engine is None:
        return None
    from PIL import Image

    from .ad_map import map_class_to_role, suggested_type_for_role

    img = Image.open(image_path)
    w, h = img.size
    outputs = engine.predict(image_path, batch_size=1, layout_nms=True)
    regions = []
    reading_order = []
    for res in outputs:
        data = res.json if hasattr(res, "json") else res
        boxes = data.get("res", {}).get("boxes", []) if isinstance(data, dict) else []
        for i, box in enumerate(boxes):
            label = box.get("label", "image")
            coord = box.get("coordinate") or box.get("bbox") or [0, 0, w, h]
            if len(coord) >= 4:
                x0, y0, x1, y1 = [int(round(float(c))) for c in coord[:4]]
            else:
                continue
            role = map_class_to_role(label, [x0, y0, x1, y1], w, h)
            rid = f"{role}_{i + 1}"
            regions.append({
                "id": rid,
                "class": label,
                "role": role,
                "bbox": [x0, y0, x1, y1],
                "confidence": float(box.get("score", 0.9)),
                "suggestedType": suggested_type_for_role(role),
                "renderStrategy": "primitive" if role in ("price", "headline", "tagline") else "crop",
            })
            reading_order.append(rid)
    if not regions:
        return None
    return {
        "width": w,
        "height": h,
        "backgroundColor": "#ffffff",
        "regions": regions,
        "reading_order": reading_order,
        "engine": "paddle",
    }


def analyze_layout(image_path: str) -> dict:
    paddle_result = _analyze_paddle(image_path)
    if paddle_result and paddle_result.get("regions"):
        return paddle_result
    return analyze_heuristic(image_path)
