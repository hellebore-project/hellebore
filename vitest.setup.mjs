import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => { };

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
}

class IntersectionObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
  takeRecords() { return []; }
}

window.ResizeObserver = ResizeObserver;
window.IntersectionObserver = IntersectionObserver;

function getBoundingClientRect() {
  const rec = {
    x: 0,
    y: 0,
    left: 0,
    right: 10,
    top: 0,
    bottom: 10,
    width: 10,
    height: 10,
  };
  return { ...rec, toJSON: () => rec };
}

class FakeDOMRectList extends Array {
  item(index) {
    return this[index];
  }
}

document.elementFromPoint = () => null;

Object.defineProperty(window, 'visualViewport', {
  value: {
    width: 1024,
    height: 768,
    offsetLeft: 0,
    offsetTop: 0,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

HTMLElement.prototype.getBoundingClientRect = getBoundingClientRect;
HTMLElement.prototype.getClientRects = function () {
  return new FakeDOMRectList(this.getBoundingClientRect());
};
Object.defineProperties(HTMLElement.prototype, {
  offsetWidth: { get: () => 100, configurable: true },
  offsetHeight: { get: () => 100, configurable: true },
  offsetParent: { get: () => document.body, configurable: true },
});

Range.prototype.getBoundingClientRect = getBoundingClientRect;
Range.prototype.getClientRects = function () {
  return new FakeDOMRectList(this.getBoundingClientRect());
};