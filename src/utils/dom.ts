import { useLayoutEffect, MutableRefObject } from "react";
import useResizeObserver from "@react-hook/resize-observer";

export function getSize<T extends Element>(
    target: MutableRefObject<T>,
    getSize: () => DOMRect,
    setSize: (size: DOMRect) => void,
) {
    useLayoutEffect(() => {
        setSize(
            target?.current.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0),
        );
    }, [target]);
    useResizeObserver(target, (entry) => setSize(entry.contentRect));
    return getSize();
}
