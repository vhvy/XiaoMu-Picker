# XMPicker - 一个移动端的多级联动选择器

## 简介

XMPicker是一个移动端的选择器，鄙人的练手之作，目前仅在iOS 14的Safari 浏览器以及微信内置浏览器测试过，如果使用过程中(会有使用的人吗?)遇到任何问题，欢迎提issues。

## 功能

* 多列选择
* 联动选择
* 自定义选择器标题
* 滚动时回调
* 选择时回调
* 默认选择项
* 确定按钮文本
* 取消按钮文本
* 自定义选择项CSS类名
* 自定义当前选中项CSS类名
* 自定义当前选中项Style样式




## 使用方法

在[Releases](https://github.com/vhvy/XiaoMu-Picker/releases)中下载对应的包，`build.zip`直接引入其中的js文件(其中包含了css样式)即可，`build.exact.zip`包含了css和js文件，请全部引入。

```
const config = {
    ...
    ...
};

// config见下文

const picker = new XMPicker(config);

picker.showPicker();

picker.hidePicker();

```

## config

- title (String, default = "选择器", required)
    - 选择器标题，默认为`选择器`.
- data (Array, required)
    + 选择器数据源
        - 非联动模式
            + 非联动模式下data为数组，数组内包含几个子数组就表示几列数据
            + 每个子数组表示一列数据，子数组内包含若干个对象，每个对象代表一个picker选项
            + 对象label属性必填
                ```
                data = [
                    [
                        {
                            label: "YEAR1",
                            ...
                        },
                        {
                            label: "YEAR2",
                            ...
                        },
                        ...
                    ],
                    [
                        {
                            label: "MONTH1",
                            ...
                        },
                        {
                            label: "MONTH2",
                            ...
                        },
                        ...
                    ],
                    [
                        {
                            label: "DAY1",
                            ...
                        },
                        {
                            label: "DAY2",
                            ...
                        },
                        ...
                    ],
                    ...
                ]
                ```
                ![Kapture 2020-10-27 at 17.25.55.gif](https://i.loli.net/2020/10/27/hKLM9ZnUjFqsODr.gif)
        - 联动模式
            + 联动模式下data为数组，数组内包含若干个对象，每个对象代表第一列的一个picker选项
            + label 属性必填，children可选
                ```
                data = [
                    {
                        label: "陕西省",
                        children: [
                            {
                                label: "西安市",
                                children: [
                                    {
                                        label: "雁塔区",
                                        ...
                                    }
                                ],
                                ...
                            }
                        ],
                        ...
                    },
                    {
                        label: "山西省",
                        children: [
                            {
                                label: "太原市",
                                children: [
                                    {
                                        label: "小店区"
                                    }
                                ]
                            },
                            {
                                label: "大同市",
                                children: [
                                    {
                                        label: "平城区"
                                    }
                                ]
                            }
                        ],
                        ...
                    }
                ]
                ```
                ![Kapture 2020-10-27 at 17.28.33.gif](https://i.loli.net/2020/10/27/rcQbGxpmjEsygDU.gif)
- isLink (Boolean, default = false)
    + 是否为联动模式，默认为false，传入联动模式data时这里必须设为true
- columnCount (Integer, default = data.length, isLink && required)
    + 选择器列数，默认为data.length
    + 联动模式下必须填写准确的列数！
- onChange (Function)
    + 点击确定按钮时的回调函数，会将所有列的当前选中数据完整的以数据格式传递给`onChange`
- onSelect (Function)
    + picker列表滚动时的回调函数，会将所有列的滚动到选中位置的数据完整的以数据格式传递给`onSelect`
- okText (String, default = "确定")
    + 确定按钮文案，默认为"确定"
- cancelText (String, default = "取消")
    + 取消按钮文案，默认为"取消"
- defaultIndex (Array)
    + 默认选中选项在所在列数据中的下标
    + 默认为0
- itemClassName (String)
    + picker 选项的css
- selectItemClassName (String)
    + 选中项picker的css
- selectItemStyle (String)
    + 选中项picker的style
    + 如 "color: #666; font-size: 14px;"

## 开发

首先安装npm包

```
npm i
npm run dev
```
然后在自动启动webpack-dev-serve页面中预览修改即可

## 打包

此脚本会将css和js都打包到bundle.js中，运行时css会动态插入页面
```
npm run build
```

如果想将css和js打包成独立的文件:
```
npm run build:exact
```