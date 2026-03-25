// Types for validation
export interface ValidationResponse {
  valid: boolean;
  message?: string;
}

interface CacheEntry {
  isValid: boolean;
  timestamp: number;
}

// Cache configuration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const validationCache = new Map<string, CacheEntry>();

// Get cached result if valid
function getCacheEntry(widgetKey: string): CacheEntry | null {
  const entry = validationCache.get(widgetKey);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp < CACHE_DURATION_MS) {
    return entry;
  }

  // Cache expired, remove it
  validationCache.delete(widgetKey);
  return null;
}

// Set cache entry
function setCacheEntry(widgetKey: string, isValid: boolean): void {
  validationCache.set(widgetKey, {
    isValid,
    timestamp: Date.now(),
  });
}

// Show loading state with spinner
export function showLoadingState(container: HTMLElement): void {
  container.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      background-color: #f5f5f5;
      border-radius: 8px;
    ">
      <div style="
        width: 40px;
        height: 40px;
        border: 4px solid #e0e0e0;
        border-top-color: #0ea5e9;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
}

// Show error message (minimal, no branding)
export function showErrorMessage(container: HTMLElement): void {
  container.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    ">
      <div style="color: #666; font-size: 14px; line-height: 1.5;">
        Unable to load widget. Please contact support.
      </div>
    </div>
  `;
}

// Validate widget key via API
export async function validateWidgetKey(
  apiUrl: string,
  widgetKey: string,
): Promise<boolean> {
  // Check cache first
  const cached = getCacheEntry(widgetKey);
  if (cached) {
    console.log("[MovingPlaceWidget] Using cached validation result");
    return cached.isValid;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ widgetKey }),
    });

    if (!response.ok) {
      console.error(
        `[MovingPlaceWidget] Validation API returned ${response.status}`,
      );
      return false;
    }

    const data: ValidationResponse = await response.json();
    const isValid = data.valid === true;

    // Cache the result
    setCacheEntry(widgetKey, isValid);

    return isValid;
  } catch (error) {
    console.error("[MovingPlaceWidget] Validation error:", error);
    return false;
  }
}
