import { mat4, vec3 } from "gl-matrix";

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
    uniformBuffer!: GPUBuffer;
    bindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    // Assets
    mesh!: Mesh;
    t: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.t = 0.0;
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
        this.uniformBuffer = this.device.createBuffer({
            size: 3 * 16 * 4, // three 4x4 matricies * (f32 == 4 bytes)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {},
                },
            ],
        });

        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer,
                    },
                },
            ],
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
        this.t += 0.1;
        if (this.t >= 2.0 * Math.PI) {
            this.t -= 2.0 * Math.PI;
        }

        // MVP
        const projection = mat4.create();
        const fovy = (45.0 * Math.PI) / 180.0;
        const aspect_ratio = this.canvas.width / this.canvas.height;
        const near_clip = 0.1;
        const far_clip = 100.0;
        mat4.perspective(projection, fovy, aspect_ratio, near_clip, far_clip);

        const view = mat4.create();
        const eye: vec3 = [-2.0, 0.0, 1.0];
        const centre: vec3 = [0.0, 0.0, 0.0];
        const up: vec3 = [0.0, 0.0, 1.0];
        mat4.lookAt(view, eye, centre, up);

        const model = mat4.create();
        const rotation = this.t;
        const axis: vec3 = [0.0, 0.0, 1.0];
        mat4.rotate(model, model, rotation, axis);

        this.device.queue.writeBuffer(this.uniformBuffer, 64 * 0, <ArrayBuffer>model);
        this.device.queue.writeBuffer(this.uniformBuffer, 64 * 1, <ArrayBuffer>view);
        this.device.queue.writeBuffer(this.uniformBuffer, 64 * 2, <ArrayBuffer>projection);

        // Records draw commands for submission to GPU
        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();

        // Texture view. Image view to the colour buffer in this case
        const textureView: GPUTextureView = this.context.getCurrentTexture().createView();

        // RenderPass holds draw commands, allocated from the command encoder
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
