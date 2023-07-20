const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/hex_converter/main.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
    },
};
