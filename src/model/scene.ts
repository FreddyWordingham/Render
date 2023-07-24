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

    get_player_camera(): Camera {
        return this.cameras[0];
    }

    get_transforms(): Transform[] {
        return this.transforms;
    }
}
