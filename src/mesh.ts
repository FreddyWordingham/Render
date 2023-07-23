export class Mesh {
    buffer: GPUBuffer;
    bufferLayout: GPUVertexBufferLayout;

    constructor(device: GPUDevice) {
        // x y r g b
        const vertices = new Float32Array([
            0.0,
            0.5,
            0.0,
            1.0,
            0.0,
            0.0, //
            -0.5,
            -0.5,
            0.0,
            0.0,
            1.0,
            0.0, //
            0.5,
            -0.5,
            0.0,
            0.0,
            0.0,
            1.0, //
        ]);

        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage: usage,
            mappedAtCreation: true,
        };

        this.buffer = device.createBuffer(descriptor);

        // Write the vertex data to the buffer
        new Float32Array(this.buffer.getMappedRange()).set(vertices);
        this.buffer.unmap();

        this.bufferLayout = {
            arrayStride: 6 * 4, // 6 * sizeof(float32)
            attributes: [
                {
                    // Position
                    shaderLocation: 0,
                    format: "float32x3",
                    offset: 0,
                },
                {
                    // Colour
                    shaderLocation: 1,
                    format: "float32x3",
                    offset: 3 * 4, // 3 * sizeof(float32)
                },
            ],
        };
    }
}
