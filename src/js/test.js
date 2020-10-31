import XMPicker from "./picker";

const map = ['日', '月', '年'];

function createList(count = 2) {
    let list = [];
    for (let i = 0; i < 10 + count; i++) {
        let o = {
            label: i + map[count]
        };
        if (count > 0) {
            o.children = createList(count - 1);
        }
        list.push(o);
    }

    return list;
}

const data = [
    [...Array(100)].map((i, index) => ({ value: index, label: "LABEL" + index })),
    [...Array(100)].map((i, index) => ({ value: index, label: "YEARS" + index })),
    [...Array(100)].map((i, index) => ({ value: index, label: "FUCKE" + index })),
];


const addressDom = document.querySelector("#select-address span");
const selectAddressDom = document.querySelector("#address span");

window.picker = new XMPicker({
    title: "PICKER",
    data: createList(),
    // defaultIndex: [2, 3, 4],
    isLink: true,
    columnCount: 3,
    onSelect: (v) => {
        addressDom.innerText = v.map(i => i.data.label).join("-");
    },
    onChange: (v) => {
        selectAddressDom.innerText = v.map(i => i.data.label).join("-");
    }
});

const selectAddressBtn = document.querySelector("#btn");

selectAddressBtn.addEventListener("click", window.picker.showPicker);