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

    speed: number = 0.1;
    forwards_amount: number = 0;
    right_amount: number = 0;
    spin_rate: number = 0.5;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.scene = new Scene();

        this.key_label = <HTMLElement>$("#key_label")[0];
        $(document).on("keydown", (event) => {
            this.handle_key_press(event);
        });
        $(document).on("keyup", (event) => {
            this.handle_key_release(event);
        });

        this.mouse_x_label = <HTMLElement>$("#mouse_x_label")[0];
        this.mouse_y_label = <HTMLElement>$("#mouse_y_label")[0];
        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        };
        $(document).on("mousemove", (event) => {
            this.handle_mouse_move(event);
        });
    }

    async init() {
        await this.renderer.init();
    }

    handle_key_press(event: JQuery.KeyDownEvent) {
        this.key_label.innerHTML = event.code;

        switch (event.code) {
            case "KeyW":
                this.forwards_amount = 1;
                break;
            case "KeyS":
                this.forwards_amount = -1;
                break;
            case "KeyA":
                this.right_amount = -1;
                break;
            case "KeyD":
                this.right_amount = 1;
                break;
        }
    }

    handle_key_release(event: JQuery.KeyUpEvent) {
        this.key_label.innerHTML = event.code;

        switch (event.code) {
            case "KeyW":
                this.forwards_amount = 0;
                break;
            case "KeyS":
                this.forwards_amount = 0;
                break;
            case "KeyA":
                this.right_amount = 0;
                break;
            case "KeyD":
                this.right_amount = 0;
                break;
        }
    }

    handle_mouse_move(event: JQuery.MouseMoveEvent) {
        const rect = this.canvas.getBoundingClientRect();

        const viewport_x = (event.pageX - rect.left) / this.canvas.width;
        const viewport_y = 1.0 - (event.pageY - rect.top) / this.canvas.height;
        const x = viewport_x * 2.0 - 1.0;
        const y = viewport_y * 2.0 - 1.0;
        // this.mouse_x_label.innerHTML = String(x);
        // this.mouse_y_label.innerHTML = String(y);

        const originalEvent = event.originalEvent as MouseEvent;
        const vel_x = originalEvent.movementX;
        const vel_y = originalEvent.movementY;
        this.mouse_x_label.innerHTML = String(vel_x);
        this.mouse_y_label.innerHTML = String(vel_y);

        this.scene.spin_player_camera(vel_x * this.spin_rate, vel_y * this.spin_rate);
    }

    run = () => {
        let running: boolean = true;

        this.scene.update();
        this.scene.move_player_camera(this.forwards_amount * this.speed, this.right_amount * this.speed);

        let camera = this.scene.get_player_camera();
        this.renderer.render(camera, this.scene.get_transforms());

        if (running) {
            requestAnimationFrame(this.run);
        }
    };
}
