import { vec3 } from "gl-matrix";

import { Camera } from "../view/camera";
import { Transform } from "./transform";

export class Scene {
    transforms: Transform[];
    cameras: Camera[];

    constructor() {
        // Transforms
        this.transforms = [];
        this.transforms.push(new Transform([2, 0, 0], 0));

        // Cameras
        this.cameras = [];
        this.cameras.push(new Camera([-2, 0, 0.5], 0, 0));
    }

    update() {
        this.transforms.forEach((transform) => {
            transform.update();
        });

        this.cameras.forEach((camera) => {
            camera.update();
        });
    }

    spin_player_camera(d_theta: number, d_phi: number) {
        this.cameras[0].eulers[2] -= d_theta;
        this.cameras[0].eulers[2] %= 360;

        this.cameras[0].eulers[1] = Math.min(89, Math.max(-89, this.cameras[0].eulers[1] - d_phi));
    }

    move_player_camera(distance: number, strife: number) {
        vec3.scaleAndAdd(this.cameras[0].position, this.cameras[0].position, this.cameras[0].forwards, distance);
        vec3.scaleAndAdd(this.cameras[0].position, this.cameras[0].position, this.cameras[0].right, strife);
    }

    get_player_camera(): Camera {
        return this.cameras[0];
    }

    get_transforms(): Transform[] {
        return this.transforms;
    }
}
