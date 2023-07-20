import { HEXADECIMAL_LOOKUP } from "./library/constants/lookups";
import { decimal_to_binary, binary_to_hexadecimal } from "./library/conversions";
import { group_binary } from "./library/formatting";

const decimal_input = document.getElementById("decimal_input") as HTMLInputElement;
const convert_button = document.getElementById("convert_button") as HTMLButtonElement;
const binary_raw = document.getElementById("binary_raw") as HTMLElement;
const grouped_binary = document.getElementById("grouped_binary") as HTMLElement;
const grouped_hexadecimal = document.getElementById("grouped_hexadecimal") as HTMLElement;
const hexadecimal_output = document.getElementById("hexadecimal_output") as HTMLElement;

const calculate: () => void = () => {
    const input: number = Number(decimal_input.value);
    const binary: String = decimal_to_binary(input);
    binary_raw.innerText = "binary: " + binary;

    let temp_string: String = "grouped: ";
    const gb: String[] = group_binary(binary);
    for (let i = 0; i < gb.length; ++i) {
        temp_string += gb[i] + " ";
    }
    grouped_binary.innerText = temp_string.valueOf();

    temp_string = "grouped hexadecimal: ";
    for (let i = 0; i < gb.length; ++i) {
        temp_string += String(binary_to_hexadecimal(gb[i])) + " ";
    }
    grouped_hexadecimal.innerText = temp_string.valueOf();

    temp_string = "final: 0x";
    for (let i = 0; i < gb.length; ++i) {
        temp_string += String(HEXADECIMAL_LOOKUP[binary_to_hexadecimal(gb[i])]);
    }
    hexadecimal_output.innerText = temp_string.valueOf();
};

convert_button.addEventListener("click", calculate);
