import { Renderer } from "./view/renderer";

// Check if WebGPU is supported
const output_label: HTMLElement = document.getElementById("output_label")!;
if (navigator.gpu) {
    output_label.innerText = "WebGPU is supported!";
} else {
    output_label.innerText = "WebGPU is NOT supported.";
}

const init = async () => {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx_main");
    const renderer = new Renderer(canvas);
    renderer.init();
};

init();
