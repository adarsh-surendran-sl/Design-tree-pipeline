"""Optional OCR on region crops."""

from __future__ import annotations

import re
from typing import Optional

_ocr_engine = None


def _try_ocr():
    global _ocr_engine
    if _ocr_engine is not None:
        return _ocr_engine
    if __import__("os").environ.get("PADDLE_OCR", "0") != "1":
        return None
    try:
        from paddleocr import PaddleOCR  # type: ignore

        _ocr_engine = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        return _ocr_engine
    except Exception:
        return None


def ocr_region(image_path: str, bbox: list) -> Optional[str]:
    engine = _try_ocr()
    if engine is None:
        return None
    from PIL import Image

    img = Image.open(image_path).convert("RGB")
    x0, y0, x1, y1 = [int(v) for v in bbox[:4]]
    crop = img.crop((x0, y0, x1, y1))
    import tempfile
    import os

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        crop.save(f.name)
        tmp = f.name
    try:
        result = engine.ocr(tmp, cls=True)
        lines = []
        for block in result or []:
            for line in block or []:
                if line and len(line) > 1:
                    lines.append(str(line[1][0]))
        text = " ".join(lines).strip()
        return text or None
    finally:
        try:
            os.unlink(tmp)
        except OSError:
            pass


def enrich_regions_with_ocr(image_path: str, analysis: dict) -> dict:
    """Add text field to price/badge regions when OCR available."""
    for r in analysis.get("regions", []):
        role = str(r.get("role", "")).lower()
        if r.get("text"):
            continue
        if role not in ("price", "badge", "headline", "tagline", "body_text"):
            continue
        text = ocr_region(image_path, r.get("bbox", []))
        if text:
            r["text"] = text
            if role == "price" or re.search(r"[₹$€£]|onwards", text, re.I):
                r["role"] = "price"
                r["suggestedType"] = "text"
                r["renderStrategy"] = "primitive"
    return analysis
