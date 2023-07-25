import $ from "jquery";

export class HUD {
    key_label: HTMLElement;
    mouse_x_label: HTMLElement;
    mouse_y_label: HTMLElement;

    constructor() {
        this.key_label = $("#key_label")[0];
        this.mouse_x_label = $("#mouse_x_label")[0];
        this.mouse_y_label = $("#mouse_y_label")[0];
    }

    handle_keypress(event: JQuery.KeyPressEvent) {
        this.key_label.innerText = event.code;
        // this.mouse_x_label.innerText = event.clientX.toString();
        // this.mouse_y_label.innerText = event.clientY.toString();
    }
}
