import { useState } from "react";
import { QUOTES, getRotatingQuote } from "../constants/quotes.js";

export function useStableQuote() {
  // Randomize quote on every load
  const [quote] = useState(() => getRotatingQuote());
  return quote;
}
