import { useLayoutEffect, MutableRefObject } from "react";
import useResizeObserver from "@react-hook/resize-observer";

const DEFAULT_SIZE = new DOMRect(0, 0, 0, 0);

export function getSize<T extends Element>(
    target: MutableRefObject<T>,
    getSize: () => DOMRect,
    setSize: (size: DOMRect) => void,
) {
    useLayoutEffect(() => {
        setSize(target?.current.getBoundingClientRect() ?? DEFAULT_SIZE);
        console.log(target.current);
    }, [target]);
    useResizeObserver(target, (entry) => setSize(entry.contentRect));
    return getSize();
}
