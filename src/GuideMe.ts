import * as focusTrap from "focus-trap";
import { GuideOptions, GuideStep } from ".";
import { GuideMeElement } from "./GuideMeElement";

export class GuideMe {
  private guideMe: GuideMeElement | null | undefined;
  private trap: focusTrap.FocusTrap | null | undefined;
  private currentElementIndex = -1;

  constructor(private elements: GuideStep[], private options?: GuideOptions) {
    this.initialize();
  }

  update(elements: GuideStep[], options?: GuideOptions) {
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
    if (!this.guideMe) {
      throw new Error("There is no GuideMeElement");
    }

    this.guideMe.hideTooltip();

    if (!this.options?.disableOverlay) {
      this.guideMe.hideOverlay();
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
    if (!this.guideMe) {
      throw new Error("There is no GuideMeElement");
    }

    this.hide();
    this.guideMe.destroy();
    this.guideMe = null;
    this.currentElementIndex = -1;
  }

  private destroyFocusTrap() {
    if (this.trap) {
      this.trap.deactivate();
      this.trap = null;
    }
  }

  private initialize() {
    const guideMeElement = document.querySelector(
      "guide-me-element"
    ) as GuideMeElement;

    if (guideMeElement) {
      this.guideMe = guideMeElement;
    } else {
      this.guideMe = document.createElement(
        "guide-me-element"
      ) as GuideMeElement;
      document.body.appendChild(this.guideMe);
    }
  }

  private move() {
    if (!this.guideMe) {
      throw new Error("There is no GuideMeElement");
    }

    const item = this.elements[this.currentElementIndex];

    if (!item) {
      this.guideMe.hideTooltip();

      if (!this.options?.disableFocusTrap) {
        this.destroyFocusTrap();
      }

      if (!this.options?.disableOverlay) {
        this.guideMe.hideOverlay();
      }
      return;
    }

    this.guideMe.setTooltipContent(item.tooltip);
    this.guideMe.showTooltip(item.element);

    if (!this.options?.disableOverlay) {
      this.guideMe.showOverlay();
    }

    if (!this.options?.disableFocusTrap) {
      if (this.trap) {
        this.trap.deactivate();
        this.trap = null;
      }

      this.trap = focusTrap.createFocusTrap(
        [this.guideMe.tooltip, item.element],
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

    const shadowRoot = this.guideMe.shadowRoot;
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
    element.classList.add("gm-highlight");
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
    document.querySelectorAll(".gm-highlight").forEach((item) => {
      item.classList.remove("gm-highlight");
      const element = item as HTMLElement;
      element.style.position = "";
      element.style.zIndex = "";
    });
  }
}
