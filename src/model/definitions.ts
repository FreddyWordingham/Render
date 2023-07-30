import { mat4 } from "gl-matrix";

export enum primitive_types {
    TRIANGLE,
    QUAD,
}

export interface RenderData {
    view_transform: mat4;
    model_transform: Float32Array;
    object_counts: { [primitive in primitive_types]: number };
}
