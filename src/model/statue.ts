import { mat4, vec3 } from "gl-matrix";

import { degToRad } from "../utility/math";

export class Statue {
    position: vec3;
    eulers: vec3;
    model: mat4;

    constructor(position: vec3, eulers: vec3) {
        this.position = position;
        this.eulers = eulers;
        this.model = mat4.create();
    }

    update() {
        this.eulers[2] += 1;
        this.eulers[2] %= 360;

        this.model = mat4.create();
        mat4.translate(this.model, this.model, this.position);
        mat4.rotateX(this.model, this.model, degToRad(this.eulers[0]));
        mat4.rotateY(this.model, this.model, degToRad(this.eulers[1]));
        mat4.rotateZ(this.model, this.model, degToRad(this.eulers[2]));
    }

    get_model(): mat4 {
        return this.model;
    }
}
