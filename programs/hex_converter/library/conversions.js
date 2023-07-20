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

function binary_to_hexadecimal(number) {
    let result = 0;

    for (let i = 0; i < 4; i++) {
        result += Number(number[i]) * 2 ** (3 - i);
    }

    return result;
}
