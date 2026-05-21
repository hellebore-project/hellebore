import { beforeEach, describe, expect, it, vi } from "vitest";

import { IsMobile } from "@/lib/services/is-mobile.svelte";

interface MockMediaQueryList extends EventTarget {
    matches: boolean;
    media: string;
    onchange:
        | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
        | null;
}

function createMediaQueryList(initialMatches: boolean, media: string) {
    const target = new EventTarget() as MockMediaQueryList;
    target.matches = initialMatches;
    target.media = media;
    target.onchange = null;

    return {
        queryList: target as unknown as MediaQueryList,
        setMatches(nextMatches: boolean) {
            target.matches = nextMatches;
            const event = new Event("change");
            target.dispatchEvent(event);
        },
    };
}

describe("IsMobile", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("uses the default mobile breakpoint query", () => {
        const mediaQuery = createMediaQueryList(false, "(max-width: 767px)");
        const matchMediaSpy = vi
            .spyOn(window, "matchMedia")
            .mockReturnValue(mediaQuery.queryList);

        const service = new IsMobile();

        expect(matchMediaSpy).toHaveBeenCalledWith("(max-width: 767px)");
        expect(service.current).toBe(false);
    });

    it("uses a custom breakpoint query when provided", () => {
        const mediaQuery = createMediaQueryList(true, "(max-width: 1023px)");
        const matchMediaSpy = vi
            .spyOn(window, "matchMedia")
            .mockReturnValue(mediaQuery.queryList);

        const service = new IsMobile(1024);

        expect(matchMediaSpy).toHaveBeenCalledWith("(max-width: 1023px)");
        expect(service.current).toBe(true);
    });

    it("reflects media query match changes in current", () => {
        const mediaQuery = createMediaQueryList(false, "(max-width: 767px)");
        vi.spyOn(window, "matchMedia").mockReturnValue(mediaQuery.queryList);

        const service = new IsMobile();

        expect(service.current).toBe(false);

        mediaQuery.setMatches(true);
        expect(service.current).toBe(true);

        mediaQuery.setMatches(false);
        expect(service.current).toBe(false);
    });
});
