import { mat4, vec3 } from "gl-matrix";

import { Camera } from "../view/camera";
import { ObjectKinds, RenderData } from "./definitions";
import { Quad } from "./quad";
import { Tri } from "./tri";

export class Scene {
    tris: Tri[];
    quads: Quad[];
    cameras: Camera[];
    object_data: Float32Array;

    constructor(num_models: number) {
        this.tris = [];
        this.quads = [];
        this.object_data = new Float32Array(16 * num_models);

        // Objects
        this.init_triangles();
        this.init_quadrangles();

        // Cameras
        this.cameras = [];
        this.cameras.push(new Camera([-2, 0, 0.5], 0, 0));
    }

    init_triangles() {
        this.tris = [];
        let entity_index = 0;

        const number_per_side = 9;
        for (let x = -number_per_side; x <= number_per_side; ++x) {
            for (let y = -number_per_side; y <= number_per_side; ++y) {
                this.tris.push(new Tri([x, y, 0], 0));

                let blank_mat = mat4.create();
                for (let i = 0; i < 16; ++i) {
                    this.object_data[16 * entity_index + i] = <number>blank_mat.at(i);
                }
                entity_index += 1;
            }
        }
    }

    // Note! Needs to run after init_triangles() because of order of object_data buffer.
    init_quadrangles() {
        this.quads = [];
        let entity_index = this.tris.length;

        const number_per_side = 9;
        for (let x = -number_per_side; x <= number_per_side; ++x) {
            for (let y = -number_per_side; y <= number_per_side; ++y) {
                this.quads.push(new Quad([x, y, 0]));

                let blank_mat = mat4.create();
                for (let i = 0; i < 16; ++i) {
                    this.object_data[16 * entity_index + i] = <number>blank_mat.at(i);
                }
                entity_index += 1;
            }
        }
    }

    update() {
        let entity_index: number = 0;

        this.tris.forEach((tri) => {
            tri.update();
            let model = tri.get_model();
            for (let x = 0; x < 16; ++x) {
                this.object_data[16 * entity_index + x] = <number>model.at(x);
            }
            entity_index += 1;
        });

        this.quads.forEach((quad) => {
            quad.update();
            let model = quad.get_model();
            for (let x = 0; x < 16; ++x) {
                this.object_data[16 * entity_index + x] = <number>model.at(x);
            }
            entity_index += 1;
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

    get_renderables(): RenderData {
        return {
            view_transform: this.cameras[0].get_view_transform(),
            model_transforms: this.object_data,
            object_counts: {
                [ObjectKinds.TRI]: this.tris.length,
                [ObjectKinds.QUAD]: this.quads.length,
            },
        };
    }
}
