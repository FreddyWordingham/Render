import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";

export class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.scene = new Scene();
    }

    async init() {
        await this.renderer.init();
    }

    run = () => {
        let running: boolean = true;
        this.scene.update();

        let camera = this.scene.get_player_camera();
        this.renderer.render(camera, this.scene.get_transforms());

        if (running) {
            requestAnimationFrame(this.run);
        }
    };
}
