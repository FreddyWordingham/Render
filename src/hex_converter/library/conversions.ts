export function decimal_to_binary(number: number): String {
    if (number == 0) {
        return "0";
    }

    let digits: String[] = [];

    while (number > 0) {
        let digit: String = String(number % 2);
        number = (number - (number % 2)) / 2;
        digits.push(digit);
    }

    return digits.reverse().join("");
}

export function binary_to_hexadecimal(number: String): number {
    let result: number = 0;

    for (let i: number = 0; i < 4; i++) {
        result += Number(number[i]) * 2 ** (3 - i);
    }

    return result;
}
