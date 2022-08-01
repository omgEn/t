const ExtractTextPlugin = require("extract-text-webpack-plugin"); // 提取文件插件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩css文件插件
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 拷贝插件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html插件

const path = require('path');
module.exports = {
    mode: 'development', // development production
    entry: path.join(__dirname, '/src/index.js'), // 应用程序入口
    output: { // 输出选项
        path: path.join(__dirname, 'build'), // 输出文件目标路径
        filename: "js/bundle.[hash:8].js", // js文件名chunkhash防缓存
        library: 'FW',
        libraryTarget: 'window'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({ // 提取文件插件配置
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader', // 文件加载器配置
                options: {
                    name: '[name].[ext]',
                    publicPath: '../img', // 自定义public发布目录，用于解决css文件内引用图片路径问题
                    emitFile: false // 设置为不生成文件，直接拷贝图片
                }
            },
        ]
    },
    plugins: [
        new ExtractTextPlugin("css/style.[hash:8].css"), // 初始化提取文件插件，css文件名chunkhash防缓存
        new OptimizeCssAssetsPlugin(), // 初始化压缩css文件插件
        new CopyWebpackPlugin([{ // 初始化配置拷贝插件，把图片目录直接拷贝到目标路径
            from: './assets',
            to: 'assets'
        }]),
        new HtmlWebpackPlugin({ // 初始化html插件，自动生成<link>和<script>标签
            filename: 'index.html',
            template: path.resolve(__dirname, 'template/index.html')　　// 使用的html模板路径
        })
    ]
};