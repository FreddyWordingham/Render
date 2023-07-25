import $ from "jquery";

import { App } from "./controller/app";

// Check if WebGPU is supported
const output_label: HTMLElement = <HTMLElement>$("#output_label")[0];
if (!navigator.gpu) {
    output_label.style.display = "block";
}

async function init() {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>$("#gfx_main")[0];
    const app = new App(canvas);
    const start = Date.now();
    await app.init();
    const elapsed = Date.now() - start;
    console.log(`Initialised in ${elapsed}ms`);
    app.run();
}

init();
