export function isFullyContained(rect: DOMRect, bounds: DOMRect) {
    return (
        rect.top >= bounds.top &&
        rect.bottom <= bounds.bottom &&
        rect.left >= bounds.left &&
        rect.right <= bounds.right
    );
}
