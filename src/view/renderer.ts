import { mat4 } from "gl-matrix";

import { Material } from "../model/material";
import { ObjectKinds, RenderData } from "../model/definitions";
import { QuadMesh } from "../model/quad_mesh";
import { TriMesh } from "../model/tri_mesh";
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
    triBindGroup!: GPUBindGroup;
    quadBindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    // Depth stencil
    depthStencilState!: GPUDepthStencilState;
    depthStencilBuffer!: GPUTexture;
    depthStencilView!: GPUTextureView;
    depthStencilAttachment!: GPURenderPassDepthStencilAttachment;

    // Assets
    tri_mesh!: TriMesh;
    quad_mesh!: TriMesh;
    tri_material!: Material;
    quad_material!: Material;
    objectBuffer!: GPUBuffer;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    async init(num_models: number) {
        await this.setupDevice();
        await this.createResources();
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

    async createResources() {
        // Depth stencil
        this.depthStencilState = {
            format: "depth24plus-stencil8",
            depthWriteEnabled: true,
            depthCompare: "less-equal",
        };

        const depthBufferDescriptor: GPUTextureDescriptor = {
            size: {
                width: this.canvas.width,
                height: this.canvas.height,
                depthOrArrayLayers: 1,
            },
            format: this.depthStencilState.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        };
        this.depthStencilBuffer = this.device.createTexture(depthBufferDescriptor);

        const depthBufferViewDescriptor: GPUTextureViewDescriptor = {
            format: this.depthStencilState.format,
            dimension: "2d",
            aspect: "all",
        };

        this.depthStencilView = this.depthStencilBuffer.createView(depthBufferViewDescriptor);
        this.depthStencilAttachment = {
            view: this.depthStencilView,
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: "store",

            stencilLoadOp: "clear",
            stencilStoreOp: "discard",
        };
    }

    async createAssets(num_models: number) {
        this.tri_mesh = new TriMesh(this.device);
        this.quad_mesh = new QuadMesh(this.device);

        this.tri_material = new Material();
        this.quad_material = new Material();

        const model_size = 64; // a single 4x4 matrix * (f32 == 4 bytes)
        const modelBufferDescriptor: GPUBufferDescriptor = {
            size: model_size * num_models,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        };
        this.objectBuffer = this.device.createBuffer(modelBufferDescriptor);

        await this.tri_material.init(this.device, "dist/textures/swirl.png");
        await this.quad_material.init(this.device, "dist/textures/wood.png");
    }

    async makePipeline() {
        this.uniformBuffer = this.device.createBuffer({
            size: 2 * 64, // two 4x4 matrices * (f32 == 4 bytes)
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

        this.triBindGroup = this.device.createBindGroup({
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
                    resource: this.tri_material.view,
                },
                {
                    binding: 2,
                    resource: this.tri_material.sampler,
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.objectBuffer,
                    },
                },
            ],
        });
        this.quadBindGroup = this.device.createBindGroup({
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
                    resource: this.quad_material.view,
                },
                {
                    binding: 2,
                    resource: this.quad_material.sampler,
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
                buffers: [this.tri_mesh.bufferLayout],
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
            depthStencil: this.depthStencilState,
        });
    }

    render(renderables: RenderData) {
        // MVP
        const projection = mat4.create();
        const fovy = (45.0 * Math.PI) / 180.0;
        const aspect_ratio = this.canvas.width / this.canvas.height;
        const near_clip = 0.1;
        const far_clip = 100.0;
        mat4.perspective(projection, fovy, aspect_ratio, near_clip, far_clip);

        const view = renderables.view_transform;

        this.device.queue.writeBuffer(this.objectBuffer, 0, renderables.model_transforms, 0, renderables.model_transforms.length);
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
            depthStencilAttachment: this.depthStencilAttachment,
        });
        renderPass.setPipeline(this.pipeline);

        let objects_drawn: number = 0;

        // Triangles
        renderPass.setVertexBuffer(0, this.tri_mesh.buffer);
        renderPass.setBindGroup(0, this.triBindGroup);
        renderPass.draw(3, renderables.object_counts[ObjectKinds.TRI], 0, objects_drawn);
        objects_drawn += renderables.object_counts[ObjectKinds.TRI];

        // Quadrangles
        renderPass.setVertexBuffer(0, this.quad_mesh.buffer);
        renderPass.setBindGroup(0, this.quadBindGroup);
        renderPass.draw(6, renderables.object_counts[ObjectKinds.QUAD], 0, objects_drawn);
        objects_drawn += renderables.object_counts[ObjectKinds.QUAD];

        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}
