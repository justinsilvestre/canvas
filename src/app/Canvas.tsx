"use client";

import { useRef, useEffect } from "react";

export const Canvas = ({
  width,
  height,
  className,
}: { className?: string } & ReturnType<typeof useCanvas>) => {
  return <canvas className={className} width={width} height={height}></canvas>;
};

export type CanvasProps = ReturnType<typeof useCanvas>;

export function useCanvas(width: number, height: number) {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  useEffect(() => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    contextRef.current = canvas.getContext("2d");
  }, []);

  return {
    contextRef,
    width,
    height,
    clear: () => {
      contextRef.current!.clearRect(0, 0, width, height);
    },
  };
}
