import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const FONT_SIZES = [
  "caption",
  "footnote",
  "body-sm",
  "body",
  "body-lg",
  "callout",
  "title-sm",
  "title",
  "title-lg",
  "heading",
  "heading-lg",
  "display",
  "display-lg",
  "display-xl",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
