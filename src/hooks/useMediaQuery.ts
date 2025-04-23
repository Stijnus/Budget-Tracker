import { useState, useEffect } from "react";

/**
 * Custom hook for detecting media query matches
 * @param query The media query to check for
 * @returns A boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Create a state to track if the media query matches
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Create a media query list
    const mediaQuery = window.matchMedia(query);

    // Initial check
    setMatches(mediaQuery.matches);

    // Create a handler for when the media query changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the event listener
    mediaQuery.addEventListener("change", handler);

    // Clean up by removing the event listener
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
