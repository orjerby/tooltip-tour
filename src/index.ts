import { GuideMe } from "./GuideMe";
import { GuideMeElement } from "./GuideMeElement";

export const createGuide = (elements: GuideStep[], options?: GuideOptions) => {
  return new GuideMe(elements, options);
};

export type GuideOptions = {
  disableOverlay?: boolean;
  disableFocusTrap?: boolean;
  disableHighlight?: boolean;
  disableAutoScroll?: boolean;
};

export type GuideStep = {
  element: HTMLElement;
  tooltip: Node;
};

customElements.define("guide-me-element", GuideMeElement);
