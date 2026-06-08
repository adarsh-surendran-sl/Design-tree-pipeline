"""Layout analysis sidecar for design-tree-pipeline-js."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel

from .layout import analyze_layout
from .heuristic_layout import segment_product_heuristic
from .ocr import enrich_regions_with_ocr

app = FastAPI(title="Layout Service", version="1.0.0")


class SegmentRequest(BaseModel):
    image_path: Optional[str] = None
    bbox: Optional[List[float]] = None


class ScoreRequest(BaseModel):
    original_path: str
    rendered_path: str


@app.get("/health")
def health():
    return {"status": "ok", "paddle_layout": os.environ.get("PADDLE_LAYOUT", "0") == "1"}


@app.post("/v1/analyze")
async def analyze(file: UploadFile = File(...)):
    suffix = Path(file.filename or "image.png").suffix or ".png"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        result = analyze_layout(tmp_path)
        result = enrich_regions_with_ocr(tmp_path, result)
        return result
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@app.post("/v1/segment/product")
async def segment_product(
    file: UploadFile = File(...),
    bbox_x0: int = 0,
    bbox_y0: int = 0,
    bbox_x1: int = 0,
    bbox_y1: int = 0,
):
    suffix = Path(file.filename or "image.png").suffix or ".png"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        bbox = [bbox_x0, bbox_y0, bbox_x1, bbox_y1]
        return segment_product_heuristic(tmp_path, bbox)
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@app.post("/v1/score")
def score_pair(req: ScoreRequest):
    """Simple MAE-based similarity (perceptual hook for future DINO)."""
    from PIL import Image
    import numpy as np

    if not os.path.isfile(req.original_path) or not os.path.isfile(req.rendered_path):
        raise HTTPException(400, "missing image paths")

    size = 256
    o = np.array(Image.open(req.original_path).convert("RGB").resize((size, size)))
    r = np.array(Image.open(req.rendered_path).convert("RGB").resize((size, size)))
    mae = float(np.abs(o.astype(np.float32) - r.astype(np.float32)).mean())
    similarity = max(0.0, 1.0 - mae / 128.0)
    return {
        "similarity": round(similarity, 4),
        "mae": round(mae, 2),
        "engine": "mae_resize",
    }
