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
    filename: "[name].css"
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
  mode: "development",
  entry,
  output: {
    globalObject: "self",
    path: path.resolve(__dirname, "../public/bundle"),
    filename: "[name].js",
    iife: false,
    clean: true
  },
  plugins,
  resolve: {
    extensions: [".ts", ".js", ".scss"],
    alias: {
      "@/scss": path.resolve(__dirname, "styles"),
      "@/types": path.resolve(__dirname, "scripts/types"),
      "@/locales": path.resolve(__dirname, "locales"),
      "@/core": path.resolve(__dirname, "scripts/core"),
      "@/main": path.resolve(__dirname, "scripts/main"),
      "@/lib": path.resolve(__dirname, "scripts/lib"),
      "@/pages": path.resolve(__dirname, "scripts/pages")
    }
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-typescript"]
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
        test: /\.(ttf|woff|woff2|eot)$/i,
        type: "asset/resource"
      }
    ]
  },
  watch: true,
  stats: "minimal",
  infrastructureLogging: {
    level: "error"
  }
}

export default config
