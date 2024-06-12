import { Instance, createPopper } from "@popperjs/core";

export class GuideMeElement extends HTMLElement {
  private _tooltip: HTMLElement;
  private mainSlot: HTMLSlotElement;
  private overlay: HTMLElement;
  private popperInstance: Instance | null | undefined;

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
        <style>
          [part=tooltip] {
            display: none;
            opacity: 0;
            transition: display opacity;
            transition-duration: 1s;
            transition-behavior: allow-discrete;
            z-index: 100000;
            background-color: white;
            color: black;
            padding: 10px;
            border-radius: 5px;
          }
  
          [part=tooltip][open] {
            display: block;
            opacity: 1;
  
            @starting-style {
              opacity: 0;
            }
          }
  
          [part=overlay] {
            opacity: 0;
            display: none;
            transition-property: display opacity;
            transition-duration: 1s;
            transition-behavior: allow-discrete;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
          }
  
          [part=overlay][open] {
            display: block;
            opacity: 1;
  
            @starting-style {
              opacity: 0;
            }
          }
  
          [part=arrow],
          [part=arrow]::before {
            position: absolute;
            width: 8px;
            height: 8px;
            background: inherit;
          }

          [part=arrow] {
            visibility: hidden;
          }

          [part=arrow]::before {
            visibility: visible;
            content: "";
            transform: rotate(45deg);
          }

          [part=tooltip][data-popper-placement=top] [part=arrow] {
            bottom: -4px;
          }

          [part=tooltip][data-popper-placement=bottom] [part=arrow] {
            top: -4px;
          }

          [part=tooltip][data-popper-placement=left] [part=arrow] {
            right: -4px;
          }

          [part=tooltip][data-popper-placement=right] [part=arrow] {
            left: -4px;
          }
        </style>
        <div part="tooltip">
          <slot></slot>
          <div part="arrow" data-popper-arrow></div>
        </div>
        <div part="overlay"></div>
      `;

    const tooltip = this.shadowRoot?.querySelector("[part=tooltip]");

    if (!tooltip) {
      throw new Error("There is no 'tooltip' part element!");
    } else {
      this._tooltip = tooltip as HTMLElement;
    }

    const mainSlot = this.shadowRoot?.querySelector("slot");

    if (!mainSlot) {
      throw new Error("There is no 'slot' element!");
    } else {
      this.mainSlot = mainSlot;
    }

    const overlay = this.shadowRoot?.querySelector("[part=overlay]");

    if (!overlay) {
      throw new Error("There is no 'overlay' part element!");
    } else {
      this.overlay = overlay as HTMLElement;
    }
  }

  get tooltip() {
    return this._tooltip;
  }

  connectedCallback() {
    this.setAttribute("role", "tooltip");
  }

  setTooltipContent(template: Node) {
    this.mainSlot.innerHTML = "";
    this.mainSlot.appendChild(template.cloneNode(true));
  }

  showTooltip(element: HTMLElement) {
    this.popperInstance = createPopper(element, this.tooltip, {
      strategy: "fixed",
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 20], // extra space from tooltip to element
          },
        },
        {
          name: "flip",
          options: {
            fallbackPlacements: ["top", "right", "bottom", "left"], // navigate tooltip any side
          },
        },
        {
          name: "preventOverflow",
          options: {
            altAxis: true, // prevent overflow on y axis
            padding: 15, // make space of 15px from the viewport edge
            tether: false,
          },
        },
        {
          name: "computeStyles",
          options: {
            adaptive: false, // prevent the tooltip from stretching
          },
        },
      ],
    });

    this.tooltip.setAttribute("open", "");
  }

  showOverlay() {
    this.overlay.setAttribute("open", "");
  }

  hideOverlay() {
    this.overlay.removeAttribute("open");
  }

  hideTooltip() {
    this.tooltip.removeAttribute("open");
  }

  destroy() {
    if (this.popperInstance) {
      this.popperInstance.destroy();
      this.popperInstance = null;
    }

    this.remove();
  }
}
