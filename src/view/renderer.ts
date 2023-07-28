import { mat4, vec3 } from "gl-matrix";

import { Camera } from "./camera";
import { Material } from "../model/material";
import { Mesh } from "../model/mesh";
import shader from "../shaders/basic.wgsl";

export class Renderer {
    // Output target
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
    material!: Material;
    objectBuffer!: GPUBuffer;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    async init(num_models: number) {
        await this.setupDevice();
        await this.createAssets(num_models);
        await this.makePipeline();
    }

    async setupDevice() {
        this.adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
        this.device = <GPUDevice>await this.adapter?.requestDevice();
        this.context = <GPUCanvasContext>this.canvas.getContext("webgpu");
        this.format = <GPUTextureFormat>"bgra8unorm";
        this.context.configure({ device: this.device, format: this.format, alphaMode: "opaque" });
    }

    async createAssets(num_models: number) {
        this.mesh = new Mesh(this.device);

        this.material = new Material();

        const model_size = 64; // a single 4x4 matrix * (f32 == 4 bytes)
        const modelBufferDescriptor: GPUBufferDescriptor = {
            size: model_size * num_models,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        };
        this.objectBuffer = this.device.createBuffer(modelBufferDescriptor);

        await this.material.init(this.device, "dist/textures/swirl.png");
    }

    async makePipeline() {
        this.uniformBuffer = this.device.createBuffer({
            size: 2 * 64, // two 4x4 matricies * (f32 == 4 bytes)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {},
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {},
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {},
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false,
                    },
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
                {
                    binding: 1,
                    resource: this.material.view,
                },
                {
                    binding: 2,
                    resource: this.material.sampler,
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.objectBuffer,
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

    render(camera: Camera, transforms: Float32Array, models_count: number) {
        // MVP
        const projection = mat4.create();
        const fovy = (45.0 * Math.PI) / 180.0;
        const aspect_ratio = this.canvas.width / this.canvas.height;
        const near_clip = 0.1;
        const far_clip = 100.0;
        mat4.perspective(projection, fovy, aspect_ratio, near_clip, far_clip);

        const view = camera.get_view();

        this.device.queue.writeBuffer(this.objectBuffer, 0, transforms, 0, transforms.length);
        this.device.queue.writeBuffer(this.uniformBuffer, 64 * 0, <ArrayBuffer>view);
        this.device.queue.writeBuffer(this.uniformBuffer, 64 * 1, <ArrayBuffer>projection);

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
        renderPass.draw(3, models_count, 0, 0);
        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}
