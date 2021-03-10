const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

console.log("slsw.lib.entries:::::");
console.log(slsw.lib.entries);
console.log(slsw.lib.webpack.isLocal + "");

module.exports = {
    entry: slsw.lib.entries,
    mode: slsw.lib.webpack.isLocal ? "development" : "production",
    target: "node",
    optimization: {
        providedExports: false
    },
    resolve: {
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        // modules: [path.resolve("./src"), "node_modules"],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: ["/node_modules/"],
                loader: "babel-loader",
            },
        ],
    },
    output: {
        libraryTarget: "commonjs",
        path: path.join(__dirname, ".webpack"),
        filename: "[name].js",
    },
    externals: [nodeExternals()],
};
