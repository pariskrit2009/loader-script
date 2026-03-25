import { validateWidgetKey, showLoadingState, showErrorMessage } from "./validation.js";

type LoaderConfig = {
  widgetKey: string;
  containerId: string;
  widgetOrigin: string;
  apiUrl?: string;
  theme?: string;
  primaryColor?: string;
  secondaryColor?: string;
  height?: string;
};

function getCurrentScript(): HTMLScriptElement | null {
  return document.currentScript as HTMLScriptElement | null;
}

function readConfig(script: HTMLScriptElement): LoaderConfig | null {
  const widgetKey = script.dataset.widgetKey;
  const containerId = script.dataset.containerId || "moving-place-widget";
  const widgetOrigin = script.dataset.widgetOrigin || "http://localhost:5173";
  const apiUrl = script.dataset.apiUrl;
  const theme = script.dataset.theme || "light";
  const primaryColor = script.dataset.primaryColor;
  const secondaryColor = script.dataset.secondaryColor;
  const height = script.dataset.height || "";

  if (!widgetKey) {
    console.error("[MovingPlaceWidget] Missing data-widget-key");
    return null;
  }

  return {
    widgetKey,
    containerId,
    widgetOrigin,
    apiUrl,
    theme,
    primaryColor,
    secondaryColor,
    height,
  };
}

function createIframe(config: LoaderConfig): HTMLIFrameElement {
  const params = new URLSearchParams({
    widgetKey: config.widgetKey,
    theme: config.theme || "light",
    hostOrigin: window.location.origin,
  });

  if (config.primaryColor) {
    params.set("primaryColor", config.primaryColor);
  }

  const iframe = document.createElement("iframe");
  iframe.src = `${config.widgetOrigin}/?${params.toString()}`;
  iframe.style.width = "100%";
  iframe.style.height = config.height || "";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("title", "Moving Place Widget");

  return iframe;
}

async function mount() {
  const script = getCurrentScript();
  if (!script) {
    console.error("[MovingPlaceWidget] Could not find current script");
    return;
  }

  const config = readConfig(script);
  if (!config) return;

  const container = document.getElementById(config.containerId);
  if (!container) {
    console.error(
      `[MovingPlaceWidget] Container #${config.containerId} not found`,
    );
    return;
  }

  // Validate widget key if API URL is provided
  if (config.apiUrl) {
    showLoadingState(container);

    const isValid = await validateWidgetKey(config.apiUrl, config.widgetKey);

    if (!isValid) {
      showErrorMessage(container);
      console.error("[MovingPlaceWidget] Widget key validation failed");
      return;
    }
  } else {
    console.warn(
      "[MovingPlaceWidget] No data-api-url provided, skipping validation",
    );
  }

  const iframe = createIframe(config);
  container.innerHTML = ""; // Clear loading state
  container.appendChild(iframe);

  window.addEventListener("message", (event: MessageEvent) => {
    console.log(event, "eventt");

    if (event.origin !== config.widgetOrigin) return;
    if (!event.data || typeof event.data !== "object") return;

    if (event.data.type === "WIDGET_RESIZE") {
      iframe.style.height = `${event.data.payload.height}px`;
      console.log(iframe, "iframeeee");
    }

    if (event.data.type === "WIDGET_COMPLETE") {
      console.log("[MovingPlaceWidget] Flow completed", event.data.payload);
    }
  });
}

mount();
