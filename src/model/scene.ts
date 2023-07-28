import { mat4, vec3 } from "gl-matrix";

import { Camera } from "../view/camera";
import { Transform } from "./transform";

export class Scene {
    transforms: Transform[];
    cameras: Camera[];
    object_data: Float32Array;
    model_count: number;

    constructor(num_models: number) {
        this.transforms = [];
        this.object_data = new Float32Array(16 * num_models);
        this.model_count = 0;

        // Transforms
        this.transforms = [];

        const number_per_side = 5;
        for (let y = -number_per_side; y < number_per_side; ++y) {
            this.transforms.push(new Transform([2, y, 0], 0));

            let blank_mat = mat4.create();
            for (let i = 0; i < 16; ++i) {
                this.object_data[16 * this.model_count + i] = <number>blank_mat.at(i);
            }
            this.model_count += 1;
        }

        // Cameras
        this.cameras = [];
        this.cameras.push(new Camera([-2, 0, 0.5], 0, 0));
    }

    update() {
        let n: number = 0;
        this.transforms.forEach((transform) => {
            transform.update();
            let model = transform.get_model();
            for (let x = 0; x < 16; ++x) {
                this.object_data[16 * n + x] = <number>model.at(x);
            }
            n += 1;
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

    move_player_camera(distance: number, strife: number, upwards: number) {
        vec3.scaleAndAdd(this.cameras[0].position, this.cameras[0].position, this.cameras[0].forwards, distance);
        vec3.scaleAndAdd(this.cameras[0].position, this.cameras[0].position, this.cameras[0].right, strife);
        vec3.scaleAndAdd(this.cameras[0].position, this.cameras[0].position, this.cameras[0].up, upwards);
    }

    get_player_camera(): Camera {
        return this.cameras[0];
    }

    get_transforms(): Float32Array {
        return this.object_data;
    }
}
