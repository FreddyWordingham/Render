import { mat4 } from "gl-matrix";

export enum ObjectKinds {
    TRI,
    QUAD,
}

export interface RenderData {
    view_transform: mat4;
    model_transform: Float32Array;
    object_counts: { [kind in ObjectKinds]: number };
}
