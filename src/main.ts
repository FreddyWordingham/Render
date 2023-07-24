import { App } from "./controller/app";

// Check if WebGPU is supported
const output_label: HTMLElement = document.getElementById("output_label")!;
if (!navigator.gpu) {
    output_label.style.display = "block";
}

async function init() {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx_main");
    const app = new App(canvas);
    const start = Date.now();
    await app.init();
    const elapsed = Date.now() - start;
    console.log(`Initialised in ${elapsed}ms`);
    app.run();
}

init();
