import "../styles/picker.scss";

class XMPicker {

    #active_css = "picker-active";
    // 控制picker是否显示的css

    #picker_list_repair_css = 'repair';
    // picker滚动列表修正偏移位置时使用的css

    #cancel_btn_css = ".picker-btn[data-type=cancel]";
    #confirm_btn_css = ".picker-btn[data-type=confirm]";
    #picker_body_css = ".picker-body";
    #picker_list_css = ".picker-column-list";
    #picker_container_css = ".picker-column-box";
    #picker_item_css = "picker-column-item";

    #isTouch = false;
    // 是否处于触摸状态的flag

    #touchStartPosY = 0;
    // 触发滚动的Y轴坐标

    #startTime = 0;
    // 触发滚动的开始事件

    #hz = 0;
    // 屏幕刷新率

    /**
     * 根据移动端和PC使用不同的事件
     */
    #clickStartEvent = ("ontouchstart" in document.documentElement) ? 'touchstart' : "mousedown";
    #moveEvent = ("ontouchmove" in document.documentElement) ? 'touchmove' : "mousemove";
    #clickEndEvent = ("ontouchend" in document.documentElement) ? 'touchend' : "mouseup";

    #modelDom = null;
    // 选择器最外层容器，主要用来控制选择的隐藏与否

    #confirmBtnDom = null;
    // 确认选择并关闭PICKER界面按钮DOM

    #closeBtnDom = null;
    // 隐藏picker界面按钮DOM

    #pickerBodyDom = null;
    // 选择器滚动条目和遮蔽层的外部容器，用来监听事件

    #pickerContainerDom = null;
    // 选择器滚动条目的直接外部容器

    #currentPicker = null;
    // 当前触发滚动事件的picker列表DOM元素

    #isShow = false;
    // 当前picker是否处于显示状态

    #global_id = null;
    // picker全局唯一ID

    #title = "";
    // 选择器标题

    #okText = "";
    // 确认按钮文本

    #cancelText = "";
    // 取消按钮文本

    #itemClassName = "";
    // picker元素css类名

    #selectItemClassName = "";
    // picker元素选中状态的css类名

    #selectItemStyle = "";
    // picker元素选中状态的行内样式

    #data = null;
    // 数据源

    #isLink = false;
    // 是否为联动模式

    #onChange = null;
    // picker滚动后触发的回调

    #onSelect = null;
    // 点击picker后选择位置的回调

    #columnCount = null;
    // 联动层级数

    #defaultIndex = null;
    // 默认选中的元素index

    #itemHeight = null;
    // 选择器单个元素的高度

    #pickerVlList = null;
    // 选择器滚动数据列表

    constructor({
        title = "选择器",

        data = [],

        isLink = false,

        columnCount = data.length,

        onChange = null,

        onSelect = null,

        defaultIndex = [],

        okText = "确定",

        cancelText = "取消",

        itemClassName = "",

        selectItemClassName = null,

        selectItemStyle = null
    }) {

        this.#global_id = this.#createRandomStr();

        this.#title = title;

        this.#okText = okText;

        this.#cancelText = cancelText;

        this.#itemClassName = itemClassName;

        this.#selectItemClassName = selectItemClassName;

        this.#selectItemStyle = selectItemStyle;

        this.#data = data;

        this.#isLink = isLink;

        this.#onChange = onChange;

        this.#onSelect = onSelect;

        this.#columnCount = columnCount;

        this.#defaultIndex = defaultIndex;

        this.#itemHeight = window.innerWidth * 0.12;
        // 选择器单个元素的高度

        this.#pickerVlList = [];

        this.#init();
    }

    #getLastPicker() {
        // 根据当前el查找picker数据

        return this.#pickerVlList.find(i => i.el === this.#currentPicker);
    }

    #getCurrentPicker(pageX) {
        // 获取当前触发的picker列表元素

        const singlePickerWidth = window.innerWidth / this.#columnCount;
        // 单个picker列表元素宽度

        const index = Math.floor(pageX / singlePickerWidth);
        // 根据触摸点X轴坐标，计算出picker列表DOM下标

        const data = this.#pickerVlList[index];
        // 取出picker数据

        if (this.#currentPicker && data.el !== this.#currentPicker) {
            /**
             * 如果当前picker列表DOM存在并且处于触摸状态
             * 而此次触发的picker列表不是触发触摸事件时picker列表DOM
             */

            return this.#getLastPicker();
        }

        return data;
    }

    #renderPickerItem(data) {
        // 根据picker数据渲染相应的picker item

        return data.map(i => (`<li class="${this.#picker_item_css} ${this.#itemClassName}">${i.label}</li>`)).join("");
    }

    #createRandomStr() {
        let str = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
        let res = "x";
        let len = str.length - 1;

        for (var i = 0; i < 6; i++) {
            let id = Math.ceil(Math.random() * len);
            res += str[id];
        }
        return res;
    }

    #renderLinkPicker() {
        // 渲染联动式picker

        const fragment = document.createDocumentFragment();
        // 文档片段，容器

        let pickerData = this.#data;

        const ulCss = this.#picker_list_css.slice(1);
        // picke列表css

        for (let i = 0; i < this.#columnCount; i++) {

            const el = document.createElement("ul");
            // 创建picker列表DOM

            el.classList.add(ulCss);
            // 为dom添加css

            el.innerHTML = this.#renderPickerItem(pickerData);
            // 渲染picker内的元素列表

            fragment.append(el);
            // 添加到文档片段中

            const itemLength = pickerData.length;
            // 此列picker数组长度

            let selectIndex = this.#defaultIndex[i];
            // 默认选中元素的index

            const items = el.getElementsByClassName(this.#picker_item_css);

            if (itemLength === 0 || selectIndex === null || selectIndex === undefined || !Number.isInteger(selectIndex)) {
                // 如果数组长度为0，默认index为0
                // 当前列没有设置默认选中值的index，则默认index为0
                selectIndex = 0;
            } else {
                // 当前列设置了默认选中值的index
                if (selectIndex > itemLength - 1) {
                    // 如果设置的index超出了最大范围，则默认index为最大index
                    selectIndex = itemLength - 1;
                } else if (selectIndex < 0) {
                    // 如果设置的index小于0，则默认index为0
                    selectIndex = 0;
                }
            }

            const lastTranslateY = selectIndex * this.#itemHeight * -1;
            // 根据当前当前列的默认index计算出的默认偏移值

            this.#setDomTranslateY(el, lastTranslateY);
            // 设置默认偏移值

            this.#pickerVlList.push({
                el,
                columnIndex: i,
                lastTranslateY,
                moveValue: [],
                itemLength,
                selectIndex,
                data: pickerData,
                items
            });
            // 保存数据

            pickerData = pickerData[selectIndex]?.children || [];
            // 取出下一组children供使用

            this.#setItemsActiveStyleAndCss(i, selectIndex);
            // 设置选中item样式

        }

        return fragment;
    }

    #reRenderPicker(pickerVl) {
        /**
         * 联动更新子picker列表
         */

        let columnCountDiff = this.#pickerVlList.length - pickerVl.columnIndex;

        if (columnCountDiff <= 1) return;
        // 如果更新的picker列是最后一列，则不用做其他操作

        let data = pickerVl.data[pickerVl.selectIndex]?.children || [];
        // 当前发生变化的picker列chidren数据

        for (let i = 1; i < columnCountDiff; i++) {

            const columnIndex = pickerVl.columnIndex + i;
            // 保存的picker状态数据下标

            const vl = this.#pickerVlList[columnIndex];
            // 保存的picker状态数据，即将被更新

            this.#setDomTranslateY(vl.el, 0);
            // 重置滚动列表DOM偏移值

            const selectIndex = 0;

            Object.assign(vl, {
                lastTranslateY: 0,
                moveValue: [],
                itemLength: data.length,
                selectIndex,
                data
            });

            vl.el.innerHTML = this.#renderPickerItem(data);

            /**
             * 滚动列表DOM，即el不变
             * columnIndex 不变
             * lastTranslateY重置为0
             * moveValue 移动轨迹列表清空
             * itemLength 元素数据数组长度，需更新
             * selectIndex 重置为0
             * data 元素数据数组， 需更新
             */

            data = data[0]?.children || [];

            this.#setItemsActiveStyleAndCss(columnIndex, selectIndex);
            // 设置选中item样式
        }
    }



    #render() {
        this.#createDom();
        // 创建picker基本结构

        const fragment = this.#isLink ? this.#renderLinkPicker() : this.#renderPicker();
        // 根据是否是联动模式调用不同的渲染函数

        this.#pickerContainerDom.append(fragment);
        // 添加到picker列表到临时DOM结构中

        document.body.append(this.#modelDom);
        // 添加到容器中
    }

    #setItemsActiveStyleAndCss(columnIndex, activeIndex, lastIndex) {
        // 设置当前选中行的样式和css类名
        // 清理上次index的样式

        const { items } = this.#pickerVlList[columnIndex];
        // 使用当前列下标取出当前列数据

        if (lastIndex !== undefined) {
            // 清理上次选中的列样式

            this.#selectItemClassName && items[lastIndex].classList.remove(this.#selectItemClassName);
            // 当前picker传入了css时
            // 清理css

            this.#selectItemStyle && (items[lastIndex].style = "");
            // 当前picker传入了style字符串时
            // 清理字符串

        }

        this.#selectItemClassName && items[activeIndex].classList.add(this.#selectItemClassName);

        this.#selectItemStyle && (items[activeIndex].style = this.#selectItemStyle);
    }

    #renderPicker() {
        // 渲染普通picker列表

        let fragment = document.createDocumentFragment();
        // 文档片段

        const ulCss = this.#picker_list_css.slice(1);
        // picker滚动列表DOM css

        for (let i = 0; i < this.#columnCount; i++) {
            const data = this.#data[i];
            // 取出对应列的picker数据

            const item_str = this.#renderPickerItem(data);
            // 渲染对应列的picker Item列表

            const el = document.createElement("ul");
            // 生成picker 滚动列表

            el.classList.add(ulCss);
            // 为picker滚动列表添加css

            el.innerHTML = item_str;
            // picker滚动列表添加item列表

            const itemLength = data.length;
            // 数据列表长度

            const selectIndex = this.#defaultIndex[i] ? (this.#defaultIndex[i] > itemLength - 1 ? itemLength - 1 : this.#defaultIndex[i]) : 0;
            // 默认选中数据的下标

            const lastTranslateY = selectIndex * this.#itemHeight * -1;
            // 默认的偏移值

            this.#setDomTranslateY(el, lastTranslateY);
            // 设置偏移值

            fragment.append(el);
            // 添加到文档片段中

            const items = el.getElementsByClassName(this.#picker_item_css);

            this.#pickerVlList.push({
                el,
                columnIndex: i,
                lastTranslateY,
                moveValue: [],
                itemLength,
                selectIndex,
                data,
                items
            });
            // 保存数据

            this.#setItemsActiveStyleAndCss(i, selectIndex);
            // 设置选中item样式
        }

        return fragment;
    }

    #handleConfirm = () => {
        // 确定选项并保存

        const pickerData = this.#getPickerData();
        // 获取回调函数所需数据

        this.hidePicker();
        // 隐藏picker

        this.#onChange && this.#onChange(pickerData);
        // 调用回调函数
    }


    showPicker = () => {
        // 显示picker容器

        if (this.#isShow) return;

        this.#isShow = true;

        this.#modelDom.classList.add(this.#active_css);
        // 添加对应的css

        this.#startHandle();
        // 开始监听事件

    }

    hidePicker = () => {
        // 隐藏picker容器

        if (!this.#isShow) return;

        this.#modelDom.classList.remove(this.#active_css);
        // 删除对应的css

        this.#endHandle();
        // 清理监听事件

        this.#isShow = false;
    }

    #handleTouchStart = (e) => {
        // 处理开始触摸事件
        if (this.#isTouch) return;
        // 如果flag存在则return

        const touch = e.touches && e.touches[0] || e;
        // 拿到触摸点，移动端pageY位于touches对象内

        this.#isTouch = true;
        // flag设为true

        const { el } = this.#getCurrentPicker(touch.pageX);

        this.#currentPicker = el;

        this.#touchStartPosY = touch.pageY;
        // 保存本次触摸事件的起始坐标点

        this.#startTime = (new Date()).getTime();
        // 保存本次触摸事件的起始时间

        el.classList.contains(this.#picker_list_repair_css) && el.classList.remove(this.#picker_list_repair_css);
        // 如果上一次滚动动画尚未结束，手动移除相应css动画

    }

    #handleTouchMove = (e) => {
        // 处理触摸移动事件

        if (!this.#isTouch) return;
        // 如果不是触摸状态则return

        const touch = e.touches && e.touches[0] || e;
        // 拿到触摸点，移动端pageY位于touches对象内

        const pickerVl = this.#getLastPicker();
        // 移动过程中锁定滚动picker

        const { lastTranslateY, moveValue, el } = pickerVl;

        const diff = touch.pageY - this.#touchStartPosY + lastTranslateY;
        // picker列表的Y轴偏移位置计算方法为: 当前Y轴坐标与触摸开始时Y轴坐标之差加上保存的上一次移动结束时元素的偏移值

        this.#setTransfrom(diff, pickerVl);
        // 更新元素的偏移位置，并触发相应回调函数

        moveValue.push({
            time: Date.now(),
            posY: diff
        });
        // 保存本次移动后元素的偏移位置与触发时间

        moveValue.length > 20 && moveValue.shift();
        // 只保存最近20次的元素位置
    }

    #setTransfrom(v, pickerVl) {

        const { el, lastTranslateY, moveValue, itemLength, columnIndex, selectIndex } = pickerVl;

        let isDown = false;
        // 手指移动方向向上

        let len = moveValue.length;
        // 本次移动事件保存的所有移动数据个数

        const lastPos = len !== 0 ? moveValue[len - 1].posY : lastTranslateY;
        // 如果是第一次移动，则使用上次滚动事件的picker偏移值
        // 否则就使用最近一次触摸移动事件的picker偏移值

        if (lastPos >= v) {
            isDown = true;
            // 如果上次移动的偏移值大于本次偏移值，则为向下滚动
        }

        let index = 0;
        // 当前处于选中位置的元素在data数组里的下标

        if (v >= 0) {
            // 如果picker偏移位置大于0，则picker向下滚动且距离picker容器顶部还有距离
            // 使用data数组里第一个数据，下标为0
            index = 0;
        } else if (v <= (itemLength - 1) * this.#itemHeight * -1) {
            // 如果picker偏移位置小于本次滑动元素列表总高度
            // 则picker向上滚动且距离picker容器地步还有距离
            // 使用data数组里最后一个数据，下标为data.length - 1
            index = itemLength - 1;
        } else {
            // 元素处于正常滚动范围内

            const method = isDown ? 'ceil' : "floor";
            // 向下滚动时，当前元素下标向上取整
            // 向上滚动时，当前元素下标向下取整

            index = Math[method](Math.abs(v) / this.#itemHeight);
            // picker偏移位置/元素高度并按规则取整

        }

        if (selectIndex !== index) {
            // 上次缓存的index值不等于当前列index时再进行后续操作

            this.#setItemsActiveStyleAndCss(columnIndex, index, selectIndex);

            pickerVl.selectIndex = index;
            // 更新缓存的index

            this.#isLink && this.#reRenderPicker(pickerVl);
            // 如果是联动模式则联动更新后续的picker

            if (this.#onSelect) {
                // onSelect存在时调用回调

                const pickerData = this.#getPickerData();
                // 生成传给回调函数的参数

                this.#onSelect(pickerData);
            }

        }

        this.#setDomTranslateY(el, v);
        // 更新picker容器的偏移值
    }

    #setDomTranslateY(el, v) {
        el.style.transform = `translateY(${v}px)`;
    }

    #getPickerData = () => {
        // 生成传给回调函数的参数

        return this.#pickerVlList.map(({ selectIndex, data }, columnIndex) => ({
            columnIndex,
            selectIndex,
            data: { ...data[selectIndex] }
        }));
    }

    #handleTouchEnd = (e) => {
        // 处理触摸停止事件
        if (!this.#isTouch) return;
        // flag不存在时直接return

        const touch = e.changedTouches && e.changedTouches[0] || e;
        // 停止触摸时的触摸点

        const pickerVl = this.#getLastPicker();
        // 停止时使用当前缓存的picker列表数据

        const { lastTranslateY, moveValue, el } = pickerVl;

        const currentTime = Date.now();
        // 当前时间戳

        const currentPosY = touch.pageY - this.#touchStartPosY + lastTranslateY;
        // 当前偏移距离

        let lastMoveSize = Math.abs(currentPosY - moveValue[0].posY);
        // 当前偏移值和保存的偏移值之差的绝对值

        let lateItem = moveValue[0];
        // 上一次移动保存的移动数据

        for (let i = 1; i < moveValue.length; i++) {
            // 循环拿出本次滚动事件保存的移动数据
            // 筛选出150毫秒内滚动距离最远的数据

            const item = moveValue[i];
            // 移动数据

            const diff = Math.abs(currentPosY - item.posY);
            // 当前偏移值和保存的偏移值之差的绝对值

            if (diff != 0 && currentTime - item.time <= 150 && lastMoveSize < diff) {
                // 如果差值不等于0且此次移动距离触摸结束时间小于150ms，且最近的移动偏移值小于绝对差值
                // 则将移动数据和移动值更新为此份移动数据

                lateItem = item;
                lastMoveSize = diff;
            }
        }

        const moveTime = currentTime - lateItem.time;
        // 滚动距离最远的数据移动消耗时间

        const moveSize = touch.pageY - this.#touchStartPosY;
        // 本次滚动事件的移动距离

        const moveLength = currentPosY - lateItem.posY;
        // 150ms内和当前位置距离最远的点与当前点之差

        pickerVl.lastTranslateY += moveSize;
        // 保存本次滚动事件的移动距离

        const isDown = moveSize < 0;
        // 如果移动距离小于0，则为向下移动，否则为向上移动。

        this.#handleSmooth(moveTime, moveLength, isDown, pickerVl);
        // 处理惯性滑动事件

        this.#currentPicker = null;

        pickerVl.moveValue = [];
        // 清空移动数据

        this.#touchStartPosY = 0;

        this.#isTouch = false;
        // 清除flag
    }

    #handleSmooth(time, moveLen, isDown, pickerVl) {
        // 惯性滑动

        const { itemLength } = pickerVl;

        if (time > 150 || Math.abs(moveLen) < 10) {
            // 如果滚动时间小于100ms或移动差小于10像素
            // 不进行惯性处理，修正元素偏移位置

            this.#checkItemPos(isDown, pickerVl);
        } else {
            const step = moveLen / time * 350 / this.#hz;
            // 计算滚动速度 moveLen / time
            // 计算以此滚动速度滚动350ms的距离
            // 计算以当前屏幕刷新率刷新时每次刷新需要滚动的距离

            let startTime = Date.now();
            // 开始滚动的时间

            const maxDownPosY = (itemLength - 1) * this.#itemHeight * -1;
            // 允许的最大向下偏移值
            // console.log(maxDownPosY,);
            const maxUpPosY = 0;
            // 允许的最大向上偏移值

            const smooth = () => {
                // 惯性滑动函数

                const diff = Date.now() - startTime;
                // 当前时间与开始时间之差

                if (diff >= 150 || pickerVl.lastTranslateY > maxUpPosY || pickerVl.lastTranslateY < maxDownPosY) {
                    // 如果滑动时间超过了150ms
                    // 或者当前滑动距离超出了可滑动范围
                    // 停止滑动，并修正偏移位置
                    this.#checkItemPos(isDown, pickerVl);
                } else {
                    // 继续滑动

                    pickerVl.lastTranslateY += step;
                    // 保存滑动位置

                    this.#setTransfrom(pickerVl.lastTranslateY, pickerVl);
                    // 更新元素滑动位置

                    window.requestAnimationFrame(smooth);
                    // 递归回调，直到达到结束条件
                }
            };

            smooth();
            // 启动惯性函数
        }
    }

    #checkItemPos(isDown, pickerVl) {
        // 检查元素偏移位置，如不在标准位置则自动纠正

        const { lastTranslateY, el, itemLength } = pickerVl;
        el.classList.add(this.#picker_list_repair_css);
        // 添加动画css

        const currentPos = lastTranslateY;
        // 当前偏移位置

        const maxDownPosY = (itemLength - 1) * this.#itemHeight * -1;
        // 允许的最大向下偏移值
        // 负值

        const maxUpPosY = 0;
        // 允许的最大向上偏移值

        if (currentPos < maxDownPosY) {
            // 如果超出了向下可滚动界限
            // 需要向上滚动修复修正偏移值
            pickerVl.lastTranslateY = maxDownPosY;

        } else if (currentPos > maxUpPosY) {
            // 如果超出了向上滚动界限或大于0且小于1item
            // 需要向下滚动修复修正偏移值
            pickerVl.lastTranslateY = 0;
        } else {
            // 修正滚动距离并添加惯性

            const method = isDown ? 'floor' : 'ceil';

            pickerVl.lastTranslateY = Math[method](currentPos / this.#itemHeight) * this.#itemHeight;
            // 修正元素位置，使元素正好滚动到选择位置

        }

        this.#setTransfrom(pickerVl.lastTranslateY, pickerVl);
        // 更新元素位置

        setTimeout(() => {
            // 动画结束后清理动画css
            el.classList.remove(this.#picker_list_repair_css);
        }, 200);
    }

    #initBodyTouch() {
        // 注册事件

        this.#pickerBodyDom.addEventListener(this.#clickStartEvent, this.#handleTouchStart);
        // 监听条目容器的开始触摸事件

        window.addEventListener(this.#moveEvent, this.#handleTouchMove);
        // 监听window上的触摸移动事件

        window.addEventListener(this.#clickEndEvent, this.#handleTouchEnd);
        // 监听window上的触摸结束事件
    }

    #cleanBodyTouch() {
        // 清理事件

        this.#pickerBodyDom.removeEventListener(this.#clickStartEvent, this.#handleTouchStart);
        // 取消监听条目容器的开始触摸事件

        window.removeEventListener(this.#moveEvent, this.#handleTouchMove);
        // 取消监听window的触摸移动事件

        window.removeEventListener(this.#clickEndEvent, this.#handleTouchEnd);
        // 取消监听window的触摸结束事件
    }

    #startHandle() {

        document.body.addEventListener(this.#moveEvent, this.#stopBodyScroll, {
            passive: false
        });
        // 阻止滚动
        this.#confirmBtnDom.addEventListener('click', this.#handleConfirm);
        // 监听确认按钮
        this.#closeBtnDom.addEventListener('click', this.hidePicker);
        // 监听关闭按钮
        this.#initBodyTouch();
        // 监听可条目容器的触摸事件
    }

    #stopBodyScroll(e) {
        // 阻止页面滚动和下拉刷新
        e.preventDefault();
    }

    #endHandle() {
        document.body.removeEventListener(this.#moveEvent, this.#stopBodyScroll);
        // 取消阻止滚动
        this.#confirmBtnDom.removeEventListener('click', this.#handleConfirm);
        // 取消监听确认按钮
        this.#closeBtnDom.removeEventListener('click', this.hidePicker);
        // 取消监听关闭按钮
        this.#cleanBodyTouch();
        // 清理条目容器的触摸事件
    }

    #getScreenHz() {
        // 获取屏幕刷新率
        // 会有1s延迟，理论上影响不大

        let startTime = Date.now();

        const run = () => {
            const diff = Date.now() - startTime;
            this.#hz++;
            if (diff < 1000) {
                window.requestAnimationFrame(run);
            }
        };
        run();
    }

    #createDom() {
        // 创建基本DOM结构

        const html = `
        <div class="picker-wrapper" id="${this.#global_id}">
            <div class="picker-bg"></div>
            <div class="picker-body-picker">
                <div class="picker-body-header">
                    <button class="picker-btn" data-type="cancel">${this.#cancelText}</button>
                    <p class="pickerbody-title">${this.#title}</p>
                    <button class="picker-btn" data-type="confirm">${this.#okText}</button>
                </div>
                <div class="picker-body">
                    <div class="picker-column-mask"></div>
                    <div class="picker-column-indicator"></div>
                    <div class="picker-column-box">
                    </div>
                </div>
            </div>
        </div>`;

        const box = document.createElement("div");
        box.innerHTML = html;

        const pickerWrapper = box.querySelector("#" + this.#global_id);

        this.#modelDom = pickerWrapper;
        this.#confirmBtnDom = this.#modelDom.querySelector(this.#confirm_btn_css);
        this.#closeBtnDom = this.#modelDom.querySelector(this.#cancel_btn_css);
        this.#pickerBodyDom = this.#modelDom.querySelector(this.#picker_body_css);
        this.#pickerContainerDom = this.#modelDom.querySelector(this.#picker_container_css);
    }

    #init() {
        this.#getScreenHz();
        this.#render();
    }
}

window.XMPicker = XMPicker;

export default XMPicker;