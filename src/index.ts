import { TooltipTour } from "./TooltipTour";
import { TooltipTourElement } from "./TooltipTourElement";

export const createTooltipTour = (
  elements: TooltipTourStep[],
  options?: TooltipTourOptions
) => {
  return new TooltipTour(elements, options);
};

export type TooltipTourOptions = {
  disableOverlay?: boolean;
  disableFocusTrap?: boolean;
  disableHighlight?: boolean;
  disableAutoScroll?: boolean;
};

export type TooltipTourStep = {
  element: HTMLElement;
  tooltip: Node;
};

customElements.define("tooltip-tour-element", TooltipTourElement);
