import $ from "jquery";

import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
import { HUD } from "./hud";

export class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;
    hud: HUD;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.scene = new Scene();
        this.hud = new HUD();

        $(document).on("keypress", this.handle_keypress);
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

    handle_keypress = (event: JQuery.KeyPressEvent) => {
        this.hud.handle_keypress(event);
    };
}
