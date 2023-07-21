const output_label: HTMLElement = document.getElementById("output_label")!;

if (navigator.gpu) {
    output_label.innerText = "WebGPU is supported!";
} else {
    output_label.innerText = "WebGPU is NOT supported.";
}
