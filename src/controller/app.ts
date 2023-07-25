import $ from "jquery";

import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";

export class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;

    key_label: HTMLElement;
    mouse_x_label: HTMLElement;
    mouse_y_label: HTMLElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.scene = new Scene();

        this.key_label = <HTMLElement>$("#key_label")[0];
        $(document).on("keypress", (event) => {
            this.handle_key_press(event);
        });

        this.mouse_x_label = <HTMLElement>$("#mouse_x_label")[0];
        this.mouse_y_label = <HTMLElement>$("#mouse_y_label")[0];
        $(document).on("mousemove", (event) => {
            this.handle_mouse_move(event);
        });
    }

    async init() {
        await this.renderer.init();
    }

    handle_key_press(event: JQuery.KeyPressEvent) {
        this.key_label.innerHTML = event.code;
    }

    handle_mouse_move(event: JQuery.MouseMoveEvent) {
        const rect = this.canvas.getBoundingClientRect();

        this.mouse_x_label.innerHTML = String((event.pageX - rect.left) / this.canvas.width);
        this.mouse_y_label.innerHTML = String(1.0 - (event.pageY - rect.top) / this.canvas.height);
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
