import * as focusTrap from "focus-trap";
import { TooltipTourOptions, TooltipTourStep } from ".";
import { TooltipTourElement } from "./TooltipTourElement";

export class TooltipTour {
  private tooltipTourElement: TooltipTourElement | null | undefined;
  private trap: focusTrap.FocusTrap | null | undefined;
  private currentElementIndex = -1;

  constructor(
    private elements: TooltipTourStep[],
    private options?: TooltipTourOptions
  ) {
    this.initialize();
  }

  update(elements: TooltipTourStep[], options?: TooltipTourOptions) {
    this.elements = elements;
    this.options = options;
    this.currentElementIndex = -1;

    this.initialize();
  }

  prev() {
    this.currentElementIndex--;
    this.move();
  }

  next() {
    this.currentElementIndex++;
    this.move();
  }

  hide() {
    if (!this.tooltipTourElement) {
      throw new Error("There is no TooltipTourElement");
    }

    this.tooltipTourElement.hideTooltip();

    if (!this.options?.disableOverlay) {
      this.tooltipTourElement.hideOverlay();
    }

    if (!this.options?.disableFocusTrap) {
      this.destroyFocusTrap();
    }

    if (!this.options?.disableHighlight) {
      setTimeout(() => {
        this.unsetHighlights();
      }, 1000);
    }
  }

  destroy() {
    if (!this.tooltipTourElement) {
      throw new Error("There is no TooltipTourElement");
    }

    this.hide();
    this.tooltipTourElement.destroy();
    this.tooltipTourElement = null;
    this.currentElementIndex = -1;
  }

  private destroyFocusTrap() {
    if (this.trap) {
      this.trap.deactivate();
      this.trap = null;
    }
  }

  private initialize() {
    const tooltipTourElement = document.querySelector(
      "tooltip-tour-element"
    ) as TooltipTourElement;

    if (tooltipTourElement) {
      this.tooltipTourElement = tooltipTourElement;
    } else {
      this.tooltipTourElement = document.createElement(
        "tooltip-tour-element"
      ) as TooltipTourElement;
      document.body.appendChild(this.tooltipTourElement);
    }
  }

  private move() {
    if (!this.tooltipTourElement) {
      throw new Error("There is no TooltipTourElement");
    }

    const item = this.elements[this.currentElementIndex];

    if (!item) {
      this.tooltipTourElement.hideTooltip();

      if (!this.options?.disableFocusTrap) {
        this.destroyFocusTrap();
      }

      if (!this.options?.disableOverlay) {
        this.tooltipTourElement.hideOverlay();
      }
      return;
    }

    this.tooltipTourElement.setTooltipContent(item.tooltip);
    this.tooltipTourElement.showTooltip(item.element);

    if (!this.options?.disableOverlay) {
      this.tooltipTourElement.showOverlay();
    }

    if (!this.options?.disableFocusTrap) {
      if (this.trap) {
        this.trap.deactivate();
        this.trap = null;
      }

      this.trap = focusTrap.createFocusTrap(
        [this.tooltipTourElement.tooltip, item.element],
        {
          fallbackFocus: item.element,
        }
      );
      this.trap.activate();
    }

    if (!this.options?.disableHighlight) {
      this.unsetHighlights();
      this.setHighlight(item.element);
    }

    if (!this.options?.disableAutoScroll) {
      item.element.scrollIntoView({ behavior: "smooth" });
    }

    const shadowRoot = this.tooltipTourElement.shadowRoot;
    const prevButton = shadowRoot?.querySelector("[slot=prev]");
    const nextButton = shadowRoot?.querySelector("[slot=next]");
    const skipButton = shadowRoot?.querySelector("[slot=skip]");

    prevButton?.addEventListener("click", () => {
      this.prev();
    });

    nextButton?.addEventListener("click", () => {
      this.next();
    });

    skipButton?.addEventListener("click", () => {
      this.hide();
    });
  }

  private setHighlight(element: HTMLElement) {
    element.classList.add("tt-highlight");
    element.style.zIndex = "10000";

    if (
      element.style.position !== "relative" &&
      element.style.position !== "absolute" &&
      element.style.position !== "fixed" &&
      element.style.position !== "sticky"
    ) {
      element.style.position = "relative";
    }
  }

  private unsetHighlights() {
    document.querySelectorAll(".tt-highlight").forEach((item) => {
      item.classList.remove("tt-highlight");
      const element = item as HTMLElement;
      element.style.position = "";
      element.style.zIndex = "";
    });
  }
}
