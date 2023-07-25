export class HUD {
    key_label: HTMLElement;
    mouse_x_label: HTMLElement;
    mouse_y_label: HTMLElement;

    constructor() {
        this.key_label = <HTMLElement>document.getElementById("key_label");
        this.mouse_x_label = <HTMLElement>document.getElementById("mouse_x_label");
        this.mouse_y_label = <HTMLElement>document.getElementById("mouse_y_label");
    }

    handle_keypress(event: JQuery.KeyPressEvent) {
        this.key_label.innerText = event.code;
        // this.mouse_x_label.innerText = event.clientX.toString();
        // this.mouse_y_label.innerText = event.clientY.toString();
    }
}
