"use client";
import { useEffect, useState } from "react";
import TextTransition, { presets } from "react-text-transition";

const TextSwipe = () => {
  const [index, setIndex] = useState(0);
  const TEXTS = ["Income", "Expense"];

  useEffect(() => {
    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      3000 // every 3 seconds
    );
    return () => clearTimeout(intervalId);
  }, []);
  return (
    <TextTransition springConfig={presets.molasses} className="text-amber-400">
      {TEXTS[index % TEXTS.length]}
    </TextTransition>
  );
};

export default TextSwipe;
