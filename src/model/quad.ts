import { mat4, vec3 } from "gl-matrix";

export class Quad {
    position: vec3;
    model: mat4;

    constructor(position: vec3, theta: number) {
        this.position = position;
        this.model = mat4.create();
    }

    update() {
        this.model = mat4.create();
        mat4.translate(this.model, this.model, this.position);
    }

    get_model(): mat4 {
        return this.model;
    }
}
