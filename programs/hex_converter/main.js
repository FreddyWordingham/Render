const hexadecimal_lookup = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

function decimal_to_binary(number) {
    if (number == 0) {
        return "0";
    }

    let digits = [];

    while (number > 0) {
        let digit = String(number % 2);
        number = (number - (number % 2)) / 2;
        digits.push(digit);
    }

    return digits.reverse().join("");
}

function group_binary(number) {
    let digits = [];

    const number_split = number.split("").reverse();
    let group_count = (number_split.length - (number_split.length % 4)) / 4 + 1;
    if (number_split.length % 4 == 0) {
        group_count -= 1;
    }

    let group = [];
    for (let i = 0; i < number_split.length; ++i) {
        group.push(number_split[i]);
        if (group.length == 4) {
            digits.push(group.reverse().join(""));
            group = [];
        }
    }

    for (let i = number_split.length; i < 4 * group_count; ++i) {
        group.push("0");
        if (group.length == 4) {
            digits.push(group.reverse().join(""));
            group = [];
        }
    }

    return digits.reverse();
}

function binary_to_hexadecimal(number) {
    let result = 0;

    for (let i = 0; i < 4; i++) {
        result += Number(number[i]) * 2 ** (3 - i);
    }

    return result;
}

const decimal_input = document.getElementById("decimal_input");
const convert_button = document.getElementById("convert_button");
const binary_raw = document.getElementById("binary_raw");
const grouped_binary = document.getElementById("grouped_binary");
const grouped_hexadecimal = document.getElementById("grouped_hexadecimal");
const hexadecimal_output = document.getElementById("hexadecimal_output");

convert_button.addEventListener("click", () => {
    binary = decimal_to_binary(decimal_input.value);
    binary_raw.innerText = "binary: " + binary;

    temp_string = "grouped: ";
    gb = group_binary(binary);
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
        temp_string += String(hexadecimal_lookup[binary_to_hexadecimal(gb[i])]);
    }
    hexadecimal_output.innerText = temp_string;
});
