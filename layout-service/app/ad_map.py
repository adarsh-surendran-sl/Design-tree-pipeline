"""Map document/layout classes to ad reconstruction roles."""

from __future__ import annotations

DOC_CLASS_TO_ROLE = {
    "image": "product",
    "figure": "product",
    "table": "overlay",
    "text": "body_text",
    "title": "headline",
    "paragraph_title": "headline",
    "paragraph": "body_text",
    "figure_title": "tagline",
    "header": "decorative",
    "footer": "overlay",
    "seal": "badge",
    "chart": "overlay",
}


def map_class_to_role(doc_class: str, bbox: list, frame_w: int, frame_h: int) -> str:
    c = (doc_class or "image").lower()
    if c in DOC_CLASS_TO_ROLE:
        role = DOC_CLASS_TO_ROLE[c]
    else:
        role = "overlay"

    x0, y0, x1, y1 = bbox
    w = max(1, x1 - x0)
    h = max(1, y1 - y0)
    area = w * h
    frame_area = max(1, frame_w * frame_h)
    cy = (y0 + y1) / 2 / max(1, frame_h)

    if area > frame_area * 0.12 and cy < 0.72 and w < h * 1.8:
        return "product"
    if cy > 0.62 and w > frame_w * 0.5:
        return "overlay"
    if cy > 0.55 and w < frame_w * 0.45 and h < frame_h * 0.12:
        return "badge"
    if role == "body_text" and cy > 0.5:
        return "price"
    return role


def suggested_type_for_role(role: str) -> str:
    if role in ("headline", "tagline", "body_text", "price", "cta"):
        return "text"
    if role == "product":
        return "image"
    if role in ("overlay", "badge"):
        return "shape"
    return "image"
