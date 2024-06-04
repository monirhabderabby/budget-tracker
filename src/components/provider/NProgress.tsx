"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const NProgress = () => {
  return (
    <ProgressBar
      height="3px"
      color="#f59e0b"
      options={{ showSpinner: false }}
    />
  );
};

export default NProgress;
