import { parseCommandLine } from "typescript";
import shader from "./shaders.wgsl";

// Initialise
const output_label: HTMLElement = document.getElementById("output_label")!;
if (navigator.gpu) {
    output_label.innerText = "WebGPU is supported!";
} else {
    output_label.innerText = "WebGPU is NOT supported.";
}

const Initialise = async () => {
    const canvas = <HTMLCanvasElement>document.getElementById("gfx_main");
    const adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
    const device: GPUDevice = await adapter?.requestDevice();
    const context = <GPUCanvasContext>canvas.getContext("webgpu");
    const format: GPUTextureFormat = "bgra8unorm";
    context.configure({ device: device, format: format });

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [],
    });
    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [],
    });
    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
    });
    const pipeline: GPURenderPipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: shader,
            }),
            entryPoint: "vs_main",
        },
        primitive: {
            topology: "triangle-list",
        },
        fragment: {
            module: device.createShaderModule({
                code: shader,
            }),
            entryPoint: "fs_main",
            targets: [
                {
                    format: format,
                },
            ],
        },
        layout: pipelineLayout,
    });

    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
    const textureView: GPUTextureView = context.getCurrentTexture().createView();
    const renderPass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
            {
                view: textureView,
                clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
                loadOp: "clear",
                storeOp: "store",
            },
        ],
    });
    renderPass.setPipeline(pipeline);
    renderPass.draw(1, 1, 0, 0);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
};

Initialise();
