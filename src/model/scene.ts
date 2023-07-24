import { Camera } from "../view/camera";
import { Transformation } from "./transformation";

export class Scene {
    transformations: Transformation[];
    cameras: Camera[];

    constructor() {
        // Transformations
        this.transformations = [new Transformation([2, 0, 0], 0)];

        // Cameras
        this.cameras = [new Camera([-2, 0, 0.5], 0, 0)];
    }

    update() {
        this.transformations.forEach((transformation) => {
            transformation.update();
        });

        this.cameras.forEach((camera) => {
            camera.update();
        });
    }

    get_player_camera(): Camera {
        return this.cameras[0];
    }

    get_transformations(): Transformation[] {
        return this.transformations;
    }
}
