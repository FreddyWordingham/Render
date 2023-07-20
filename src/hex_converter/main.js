import { HEXADECIMAL_LOOKUP } from "./library/constants/lookups.js";
import { decimal_to_binary, binary_to_hexadecimal } from "./library/conversions.js";
import { group_binary } from "./library/formatting.js";

const decimal_input = document.getElementById("decimal_input");
const convert_button = document.getElementById("convert_button");
const binary_raw = document.getElementById("binary_raw");
const grouped_binary = document.getElementById("grouped_binary");
const grouped_hexadecimal = document.getElementById("grouped_hexadecimal");
const hexadecimal_output = document.getElementById("hexadecimal_output");

convert_button.addEventListener("click", () => {
    const binary = decimal_to_binary(decimal_input.value);
    binary_raw.innerText = "binary: " + binary;

    let temp_string = "grouped: ";
    const gb = group_binary(binary);
    for (let i = 0; i < gb.length; ++i) {
        temp_string += gb[i] + " ";
    }
    grouped_binary.innerText = temp_string;

    temp_string = "grouped hexadecimal: ";
    for (let i = 0; i < gb.length; ++i) {
        temp_string += String(binary_to_hexadecimal(gb[i])) + " ";
    }
    grouped_hexadecimal.innerText = temp_string;

    temp_string = "final: 0x";
    for (let i = 0; i < gb.length; ++i) {
        temp_string += String(HEXADECIMAL_LOOKUP[binary_to_hexadecimal(gb[i])]);
    }
    hexadecimal_output.innerText = temp_string;
});
