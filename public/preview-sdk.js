class PreviewSDK {
  // If set to true, CSS will be used instead of renderers to highlight elements with `data-kk-element-codename-attribute`.
  // Else renderers (canvas/overlay) will be used.
  static UseCSSForHighlight = false;

  // If set to true, canvas element will be used to render highlights.
  // Else DOM elements will be used (1 for each highlight).
  static UseCanvasForRendering = false;

  // If set to true, debounces the rendering method (clear remains undebounced).
  static DebounceRenderingMethod = true;
  static DebounceRenderingDelay = 200;

  // If set to true, throttles rendering method (including clear).
  static ThrottleRenderingMethod = false;
  static ThrottleRenderingLimit = 100;

  // Specifies percent of element's visibility for it to be considered visible.
  static IntersectionThreshold = 0.95;

  // Prevents default click handlers.
  static PreventDefaultClickHandlers = false;


  static Tags = {
    Overlay: 'KK-PREVIEW-OVERLAY',
    Element: 'KK-PREVIEW-ELEMENT',
  };

  static DataAttributes = {
    ProjectId: 'data-kk-project-id',
    LanguageCodename: 'data-kk-language-codename',
    ItemId: 'data-kk-item-id',
    ElementCodename: 'data-kk-element-codename',
  };

  static DatasetAttributes = {
    ProjectId: 'kkProjectId',
    LanguageCodename: 'kkLanguageCodename',
    ItemId: 'kkItemId',
    ElementCodename: 'kkElementCodename',
  };

  static throttle(fn, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        fn.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  static debounce(fn, delay) {
    let inDebounce;
    return function () {
      const args = arguments;
      const context = this;
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => fn.apply(context, args), delay);
    };
  }

  // Go through every element in the event path and parse PreviewSDK.DatasetAttributes.
  static parseEventPath(event) {
    const path = event.path;
    const parsed = Object.create(null);

    for (let i = 0; i <= path.length; i++) {
      for (let key in PreviewSDK.DatasetAttributes) {
        if (PreviewSDK.DatasetAttributes.hasOwnProperty(key)) {
          const value = PreviewSDK.DatasetAttributes[key];
          if (path[i]?.dataset?.[value] && !parsed[value]) {
            parsed[value] = path[i]?.dataset?.[value];
          }
        }
      }
    }

    return parsed;
  }

  #intersectionObserver = null;
  #mutationObserver = null;

  // Reference to the canvas element.
  #canvas = null;
  // Reference to the canvas context.
  #ctx = null;
  // Reference to the overlay element.
  #overlay = null;
  // WeakSet of nodes that are observed by intersection observer.
  #observedNodes = new WeakSet();
  // Set of observed nodes that are currently in DOM and are visible.
  #visibleNodes = new Set();

  start = () => {
    if (PreviewSDK.UseCSSForHighlight) {
      this.#addHighlightCSS();
    } else {
      if (PreviewSDK.UseCanvasForRendering) {
        this.#prepareCanvas();
      } else {
        this.#prepareOverlay();
      }

      this.#observeDOMMutations(window.document.body);
    }

    this.#setGlobalEventHandlers();

    // TODO: [Possible improvement] add polling (~1-2s) for smoother UX
  };

  #setGlobalEventHandlers = () => {
    // Catch all click events on body and handle them
    window.document.body.addEventListener('click', this.#onBodyClick);

    // `passive: true` on both events is needed to improve the performance.
    // `capture: true` on scroll event is needed to track scroll events on all elements of the page and react on it.
    window.addEventListener('scroll', this.#render, {passive: true, capture: true});
    window.addEventListener('resize', this.#onWindowResize, {passive: true});

    // TODO: [Possible improvement] add global keydown, wheel, mousedown, etc. for smoother UX
  };

  #observeNodeVisibility = (node) => {
    if (!node.dataset[PreviewSDK.DatasetAttributes.ElementCodename] || this.#observedNodes.has(node)) return;


    if (!this.#intersectionObserver) {
      const options = {threshold: [PreviewSDK.IntersectionThreshold]};
      this.#intersectionObserver = new IntersectionObserver(this.#onIntersection, options);
    }

    this.#intersectionObserver.observe(node);
    this.#observedNodes.add(node);
  };

  #unobserveNodeVisibility = (node) => {
    if (!this.#observedNodes.has(node) || !this.#intersectionObserver) return;

    this.#intersectionObserver.unobserve(node);
    this.#observedNodes.delete(node);
    this.#visibleNodes.delete(node);
  };

  #observeDOMMutations = (node) => {
    if (!this.#mutationObserver) {
      this.#mutationObserver = new MutationObserver(this.#onMutation);
    }

    // The childList attribute tracks addition of new child nodes or removal of existing child nodes.
    // The subtree attribute extends childList tracking on all node's descendants.
    this.#mutationObserver.observe(node, {
      childList: true,
      subtree: true,
    });
  };

  #onBodyClick = (event) => {
    // Since we are tracking this event on the body, we need to check every element on the event path and
    // collect the needed data-attributes from it.
    const parsed = PreviewSDK.parseEventPath(event);

    if (parsed[PreviewSDK.DatasetAttributes.ItemId] && parsed[PreviewSDK.DatasetAttributes.ElementCodename]) {
      if (PreviewSDK.PreventDefaultClickHandlers) {
        event.preventDefault();
      }

      console.log(`Redirect to item: 
  ProjectId = ${parsed[PreviewSDK.DatasetAttributes.ProjectId]}
  LanguageCodename = ${parsed[PreviewSDK.DatasetAttributes.LanguageCodename]}
  ItemId = ${parsed[PreviewSDK.DatasetAttributes.ItemId]} 
  ElementCodename = ${parsed[PreviewSDK.DatasetAttributes.ElementCodename]}
      `);
    }
  };

  #onWindowResize = () => {
    if (PreviewSDK.UseCSSForHighlight) return;

    if (PreviewSDK.UseCanvasForRendering) {
      this.#adjustCanvas();
    }

    this.#render();
  };

  #onIntersection = (entries) => {
    let hasNewVisibleEntries = false;

    for (let entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= PreviewSDK.IntersectionThreshold) {
        hasNewVisibleEntries = true;
        this.#visibleNodes.add(entry.target);
      } else {
        this.#visibleNodes.delete(entry.target);
      }
    }

    if (hasNewVisibleEntries) {
      this.#render();
    }
  };

  #onMutation = (mutations) => {
    let subtreeMutated = false;

    for (let mutation of mutations) {
      // Since our overlay is located inside the body too, we need to ignore all mutations
      // coming from the overlay. Otherwise, we would overflow the stack.
      if (mutation.target?.tagName === PreviewSDK.Tags.Overlay) continue;
      if (mutation.type !== 'childList') continue;

      subtreeMutated = true;

      for (let node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        this.#observeNodeVisibility(node);

        for (let elem of node.querySelectorAll(`[${PreviewSDK.DataAttributes.ElementCodename}]`)) {
          this.#observeNodeVisibility(elem);
        }
      }

      for (let node of mutation.removedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        this.#unobserveNodeVisibility(node);

        for (let elem of node.querySelectorAll(`[${PreviewSDK.DataAttributes.ElementCodename}]`)) {
          this.#unobserveNodeVisibility(elem);
        }
      }
    }

    if (subtreeMutated) {
      this.#render();
    }
  };

  #prepareOverlay = () => {
    if (this.#overlay) {
      return;
    }

    const overlay = document.createElement(PreviewSDK.Tags.Overlay);

    overlay.style.position = 'fixed';
    overlay.style.pointerEvents = 'none';
    overlay.style.top = '0px';
    overlay.style.left = '0px';
    overlay.style.right = '0px';
    overlay.style.bottom = '0px';

    document.body.appendChild(overlay);
    this.#overlay = overlay;
  };

  #prepareCanvas = () => {
    if (this.#canvas) return;

    this.#canvas = document.createElement('canvas');
    this.#ctx = this.#canvas.getContext('2d');

    this.#canvas.id = PreviewSDK.Tags.Overlay;

    this.#canvas.style.pointerEvents = 'none';
    this.#canvas.style.position = 'fixed';
    this.#canvas.style.top = '0px';
    this.#canvas.style.bottom = '0px';
    this.#canvas.style.right = '0px';
    this.#canvas.style.left = '0px';

    this.#adjustCanvas();

    window.document.body.appendChild(this.#canvas);
  };

  #adjustCanvas = () => {
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
  };

  #doRender = () => {
    if (PreviewSDK.UseCSSForHighlight) return;

    if (PreviewSDK.UseCanvasForRendering) {
      this.#renderOnCanvas();
    } else {
      this.#renderInDOM();
    }
  };

  #doRenderHighlightsOnCanvas = () => {
    if (this.#visibleNodes.size === 0) return;

    this.#ctx.beginPath();
    this.#ctx.setLineDash([5, 5]);
    this.#ctx.strokeStyle = 'rgba(245, 104, 10, .9)';
    this.#ctx.lineWidth = '3';

    for (let element of this.#visibleNodes) {
      const rect = element.getBoundingClientRect();

      this.#ctx.setLineDash([5, 5]);
      this.#ctx.rect(rect.left, rect.top, rect.width, rect.height);
    }

    this.#ctx.stroke();
  };

  #doRenderHighlightsInDOM = () => {
    if (this.#visibleNodes.size === 0) return;

    const fragment = document.createDocumentFragment();

    for (let element of this.#visibleNodes) {
      const rect = element.getBoundingClientRect();
      const highlight = document.createElement(PreviewSDK.Tags.Element);

      highlight.style.position = 'fixed';
      highlight.style.top = `${rect.top}px`;
      highlight.style.left = `${rect.left}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
      highlight.style.border = `3px dashed rgba(10, 104, 245, .9)`;
      highlight.style.cursor = 'pointer';

      fragment.appendChild(highlight);
    }

    this.#overlay.appendChild(fragment);
  };

  #renderHighlightsOnCanvas = PreviewSDK.DebounceRenderingMethod
    ? PreviewSDK.debounce(this.#doRenderHighlightsOnCanvas, PreviewSDK.DebounceRenderingDelay)
    : this.#doRenderHighlightsOnCanvas;

  #renderHighlightsInDOM = PreviewSDK.DebounceRenderingMethod
    ? PreviewSDK.debounce(this.#doRenderHighlightsInDOM, PreviewSDK.DebounceRenderingDelay)
    : this.#doRenderHighlightsInDOM;

  #render = PreviewSDK.ThrottleRenderingMethod
    ? PreviewSDK.throttle(this.#doRender, PreviewSDK.ThrottleRenderingLimit)
    : this.#doRender;

  #renderOnCanvas = () => {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#renderHighlightsOnCanvas();
  };

  #renderInDOM = () => {
    this.#overlay.innerHTML = '';
    this.#renderHighlightsInDOM();
  };

  #addHighlightCSS = () => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(
      `
*[${PreviewSDK.DataAttributes.ElementCodename}] {
  border: 3px dashed rgba(245, 10, 104, .9);
}
`
    ));
    document.head.appendChild(style);
  }
}

const previewSdk = new PreviewSDK();
window.addEventListener('load', previewSdk.start);
