"use client";

import { useEffect } from "react";

// Loads Google's website translate widget. It injects a language dropdown
// that machine-translates the whole page. Wording isn't perfect, but it's a
// quick, free way to serve visitors in many languages.
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: unknown;
  }
}

export default function TranslateWidget() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      // @ts-expect-error - google translate global is injected at runtime
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return <div id="google_translate_element" className="translate-widget" />;
}
