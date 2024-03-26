"use client";
import styles from "./page.module.css";
import { Canvas, CanvasProps, useCanvas } from "./Canvas";

import { rainbowRopes } from "./sketches/01-rainbowRopes";
import { lightningTree } from "./sketches/02-lightningTree";
import { polygonTiles } from "./sketches/03-polygonTiles";

const sketches: ((context: CanvasRenderingContext2D) => void)[] = [
  (ctx) => rainbowRopes(ctx.canvas.width, ctx.canvas.height, ctx),
  (ctx) => lightningTree(ctx.canvas.width, ctx.canvas.height, ctx),
  (ctx) => polygonTiles(ctx),
];

export default function Home() {
  const canvasProps = useCanvas(800, 600);
  return (
    <main className={styles.main}>
      <Canvas {...canvasProps} className={styles.canvas} />
      <div className={styles.buttons}>
        <button onClick={() => canvasProps.clear()}>Clear</button>
        {sketches.map((_, i) => (
          <SketchButton key={i} number={i + 1} canvasProps={canvasProps} />
        ))}
      </div>
    </main>
  );
}

function SketchButton({
  number,
  canvasProps,
}: {
  number: number;
  canvasProps: CanvasProps;
}) {
  return (
    <button
      onClick={() => sketches[number - 1](canvasProps.contextRef.current!)}
    >
      {String(number).padStart(2, "0")}
    </button>
  );
}
