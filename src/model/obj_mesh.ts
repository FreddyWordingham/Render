import { vec2, vec3 } from "gl-matrix";

export class ObjMesh {
    buffer: GPUBuffer;
    bufferLayout: GPUVertexBufferLayout;
    v: vec3[];
    vn: vec3[];
    vt: vec2[];
    verticies: vec3[];
    vertex_count: number;

    constructor() {
        this.v = [];
        this.vt = [];
        this.vn = [];

        this.verticies = [];
        this.vertex_count = 0;
    }

    async init(device: GPUDevice, url: string) {
        await this.read_obj_file(url);
    }

    async read_obj_file(url: string) {
        const response: Response = await fetch(url);
        const blob: Blob = await response.blob();
        const file_contents: string = await blob.text();
        const lines = file_contents.split("\n");

        // Create vertices, texture coordinates, and normals
        lines.forEach((line: string) => {
            const tokens = line.split(" ");
            if (tokens[0] === "v") {
                const x = parseFloat(tokens[1]);
                const y = parseFloat(tokens[2]);
                const z = parseFloat(tokens[3]);
                this.v.push(vec3.fromValues(x, y, z));
            } else if (tokens[0] === "vn") {
                const xn = parseFloat(tokens[1]);
                const yn = parseFloat(tokens[2]);
                const zn = parseFloat(tokens[3]);
                this.vn.push(vec3.fromValues(xn, yn, zn));
            } else if (tokens[0] === "vt") {
                const u = parseFloat(tokens[1]);
                const v = parseFloat(tokens[2]);
                this.vt.push(vec2.fromValues(u, v));
            }
        });

        let result: number[] = [];
        lines.forEach((line: string) => {
            const tokens = line.split(" ");

            if (tokens[0] === "f") {
                const tri_count = tokens.length - 3;

                for (let n = 0; n < tri_count; ++n) {
                    for (let i = 0; i < 3; ++i) {
                        const parts = tokens[1 + n + i].split("/");
                        const v = this.v[parseInt(parts[0]) - 1];
                        const vn = this.vn[parseInt(parts[2]) - 1];
                        const vt = this.vt[parseInt(parts[1]) - 1];

                        result.push(...[v[0], v[1], v[2], vt[0], vt[1]]);
                    }
                }
            }
        });

        this.verticies = new Float32Array(result);

        this.vertex_count = this.verticies.length / 5;
    }
}
