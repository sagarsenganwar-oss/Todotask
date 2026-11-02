/**
 * Used by forms in the browser. If a save cannot reach the server (no
 * internet, Wi-Fi dropped), show a message in that form instead of
 * replacing the whole page with the error page. What the user typed stays.
 */
export const NETWORK_ERROR = "Could not reach the server. Check your internet connection and try again.";

export function withNetworkError<S>(
  action: (state: S, formData: FormData) => Promise<S>,
  onError: (formData: FormData) => S,
) {
  return async (state: S, formData: FormData): Promise<S> => {
    try {
      return await action(state, formData);
    } catch (error) {
      // The browser reports "could not connect" as a TypeError ("Failed to fetch").
      // Anything else (including Next.js redirects) is passed on unchanged.
      if (error instanceof TypeError) return onError(formData);
      throw error;
    }
  };
}

/** Reads a text field from a form, or "" when missing. */
export function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
