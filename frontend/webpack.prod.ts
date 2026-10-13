import path from "path"
import { Configuration, EntryObject } from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import { CleanWebpackPlugin } from "clean-webpack-plugin"
import pageEntries from "./public.entries"

interface IAppConfigEntries {
  title: string
  filename: string
  template: string
  chunks: string[]
}

type IPlugins = (CleanWebpackPlugin | MiniCssExtractPlugin | HtmlWebpackPlugin)[]

const entryGroup: IAppConfigEntries[] = Object.keys(pageEntries).map((key) => ({
  title: key,
  filename: `${key}.ejs`,
  template: `${key}.ejs`,
  chunks: [key]
}))

const plugins: IPlugins = [
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin({
    filename: "[name]-[contenthash].css"
  })
]

Object.values(entryGroup).forEach((entryInfo, _entryName) => {
  plugins.push(
    new HtmlWebpackPlugin({
      title: entryInfo.title,
      filename: path.join(__dirname, "../views/" + entryInfo.filename),
      template: "!!raw-loader!./frontend/templates/" + entryInfo.template,
      chunks: entryInfo.chunks,
      publicPath: "/bundle",
      chunksSortMode: "manual",
      inject: "head",
      scriptLoading: "defer"
    })
  )
})

const entry: EntryObject = { ...pageEntries }

const config: Configuration = {
  mode: "production",
  entry,
  output: {
    globalObject: "self",
    path: path.resolve(__dirname, "../public/bundle"),
    filename: "[name]-[contenthash].js",
    iife: true,
    clean: true
  },
  plugins,
  resolve: {
    alias: {
      "@/scss": path.resolve(__dirname, "styles"),
      "@/types": path.resolve(__dirname, "scripts/types"),
      "@/locales": path.resolve(__dirname, "locales"),
      "@/core": path.resolve(__dirname, "scripts/core"),
      "@/main": path.resolve(__dirname, "scripts/main"),
      "@/lib": path.resolve(__dirname, "scripts/lib"),
      "@/pages": path.resolve(__dirname, "scripts/pages")
    },
    extensions: [".ts", ".js", ".scss"]
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    firefox: "69",
                    chrome: "64",
                    safari: "13",
                    edge: "79"
                  }
                }
              ],
              "@babel/preset-typescript"
            ]
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(ttf|woff|woff2|eot|png|jpe?g|gif|svg|avif|webp)$/i,
        type: "asset/resource"
      }
    ]
  }
}

export default config
