import { mat4, vec3 } from "gl-matrix";

import { degToRad } from "../utility/math";

export class Camera {
    position: vec3;
    eulers: vec3; // Rotations in degrees around x, y, z
    forwards: vec3;
    right: vec3;
    up: vec3;
    view_transform: mat4;

    constructor(position: vec3, theta: number, phi: number) {
        this.position = position;
        this.eulers = [0, phi, theta];
        this.forwards = vec3.create();
        this.right = vec3.create();
        this.up = vec3.create();
        this.view_transform = mat4.create();
    }

    update() {
        this.forwards = [
            Math.cos(degToRad(this.eulers[2])) * Math.cos(degToRad(this.eulers[1])),
            Math.sin(degToRad(this.eulers[2])) * Math.cos(degToRad(this.eulers[1])),
            Math.sin(degToRad(this.eulers[1])),
        ];

        vec3.cross(this.right, this.forwards, [0, 0, 1]);
        vec3.normalize(this.right, this.right);

        vec3.cross(this.up, this.right, this.forwards);
        vec3.normalize(this.up, this.up);

        var target: vec3 = vec3.create();
        vec3.add(target, this.position, this.forwards);

        this.view_transform = mat4.create();
        mat4.lookAt(this.view_transform, this.position, target, this.up);
    }

    get_view_transform(): mat4 {
        return this.view_transform;
    }
}
