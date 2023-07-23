import shader from "./shaders/basic.wgsl";
import { Mesh } from "./mesh";

export class Renderer {
    canvas: HTMLCanvasElement;

    // Device/Context objects
    adapter!: GPUAdapter;
    device!: GPUDevice;
    context!: GPUCanvasContext;
    format!: GPUTextureFormat;

    // Pipeline objects
    bindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    // Assets
    mesh!: Mesh;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    async Initialise() {
        await this.setupDevice();
        this.createAssets();
        await this.makePipeline();
        this.render();
    }

    async setupDevice() {
        this.adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
        this.device = <GPUDevice>await this.adapter?.requestDevice();
        this.context = <GPUCanvasContext>this.canvas.getContext("webgpu");
        this.format = <GPUTextureFormat>"bgra8unorm";
        this.context.configure({ device: this.device, format: this.format, alphaMode: "opaque" });
    }

    createAssets() {
        this.mesh = new Mesh(this.device);
    }

    async makePipeline() {
        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [],
        });

        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [],
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: this.device.createShaderModule({
                    code: shader,
                }),
                entryPoint: "vs_main",
                buffers: [this.mesh.bufferLayout],
            },
            primitive: {
                topology: "triangle-list",
            },
            fragment: {
                module: this.device.createShaderModule({
                    code: shader,
                }),
                entryPoint: "fs_main",
                targets: [
                    {
                        format: this.format,
                    },
                ],
            },
            layout: pipelineLayout,
        });
    }

    render() {
        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();

        const textureView: GPUTextureView = this.context.getCurrentTexture().createView();

        const renderPass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 0.2 },
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
        });
        renderPass.setPipeline(this.pipeline);
        renderPass.setVertexBuffer(0, this.mesh.buffer);
        renderPass.setBindGroup(0, this.bindGroup);
        renderPass.draw(3, 1, 0, 0);
        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}
