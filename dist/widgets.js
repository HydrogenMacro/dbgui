import { buttonStyle, elWithStyle } from "./util.js";
/**
 * @abstract
 * Abstract class that is the base of every widget.
 * Cannot be marked as abstract in typescript, since the JS needs to be able to be generated
 * in order for closure compiler to work with it.
 */
export class Widget {
    // workarouds to make closure compiler and ts coexist
    /** @abstract @return {Element} */
    // @ts-ignore
    create() { }
}
/**
 * @unrestricted
 */
class Button extends Widget {
    text;
    clickCb = () => { };
    constructor(text = "Click") {
        super();
        this.text = text;
    }
    ["onClick"](clickCb) {
        this.clickCb = clickCb;
        return this;
    }
    create() {
        let btn = elWithStyle({
            ...buttonStyle(),
        }, "button");
        btn.textContent = this.text;
        btn.onclick = this.clickCb;
        return btn;
    }
}
/**
 * @unrestricted
 */
class ValueDisplay extends Widget {
    /**
     * @type {Function}
     */
    valueGetter;
    currentValue;
    constructor(valueGetter) {
        super();
        this.valueGetter = valueGetter;
        this.currentValue = valueGetter();
    }
    pollInterval = 100;
    ["withPollInterval"](ms) {
        this.pollInterval = ms;
        return this;
    }
    stringifyFn = (val) => val + "";
    ["withStringifyFunction"](stringifyFunction) {
        this.stringifyFn = stringifyFunction;
        return this;
    }
    create() {
        let valueDisplayContainerEl = elWithStyle({
            "display": "flex",
            "flex-direction": "row",
            "align-items": "center",
            "gap": "3px",
        });
        let valueDisplayEl = elWithStyle({});
        valueDisplayEl.textContent = this.stringifyFn(this.valueGetter());
        const update = () => {
            valueDisplayEl.textContent = "...";
            this.currentValue = this.valueGetter();
            valueDisplayEl.textContent = this.stringifyFn(this.currentValue);
        };
        valueDisplayContainerEl.append(valueDisplayEl);
        if (this.pollInterval === "manual") {
            let valueUpdateBtn = elWithStyle({
                ...buttonStyle(),
            }, "button");
            valueUpdateBtn.textContent = "Update";
            valueUpdateBtn.onclick = update;
            valueDisplayContainerEl.append(valueUpdateBtn);
        }
        else {
            let pollIntervalId = setInterval(() => {
                update();
            }, this.pollInterval);
            let gc = new FinalizationRegistry(() => {
                clearInterval(pollIntervalId);
            });
            gc.register(valueDisplayContainerEl, null);
        }
        return valueDisplayContainerEl;
    }
}
/**
 * @unrestricted
 */
class TextInput extends Widget {
    pollIntervalMs = 100;
    textInputEl = undefined;
    getText = () => "";
    constructor(getText) {
        super();
        if (getText) {
            this.getText = getText;
        }
        else {
            this.getText = () => this.textInputEl?.value ?? "";
        }
    }
    onInputCb = (_) => { };
    ["onInput"](cb) {
        this.onInputCb = cb;
        return this;
    }
    onChangeCb = (_) => { };
    ["onChange"](cb) {
        this.onChangeCb = cb;
        return this;
    }
    create() {
        let textInputEl = (this.textInputEl = elWithStyle({
            "min-width": "0",
            "max-width": "80px",
        }, "input"));
        textInputEl.value = this.getText();
        let isFocused = false;
        textInputEl.addEventListener("focus", () => (isFocused = true));
        textInputEl.addEventListener("blur", () => (isFocused = true));
        textInputEl.addEventListener("input", () => this.onInputCb(textInputEl.value));
        textInputEl.addEventListener("change", () => this.onChangeCb(textInputEl.value));
        // prevent memory leak using finalizationregistry or smthin
        setTimeout(() => {
            if (isFocused)
                return;
            textInputEl.value = this.getText();
        }, this.pollIntervalMs);
        return textInputEl;
    }
}
/**
 * @unrestricted
 */
class NumberInput extends Widget {
    pollIntervalMs = 100;
    numberInputEl = undefined;
    getNumber = () => 0;
    constructor(getNumber) {
        super();
        if (getNumber) {
            this.getNumber = getNumber;
        }
        else {
            this.getNumber = () => +(this.numberInputEl?.value ?? 0);
        }
    }
    onInputCb = (val) => { };
    ["onInput"](cb) {
        this.onInputCb = cb;
        return this;
    }
    onChangeCb = (_) => { };
    ["onChange"](cb) {
        this.onChangeCb = cb;
        return this;
    }
    create() {
        let numberInputEl = (this.numberInputEl = elWithStyle({
            "min-width": "0",
            "max-width": "80px",
        }, "input"));
        numberInputEl.type = "number";
        numberInputEl.value = this.getNumber() + "";
        let isFocused = false;
        numberInputEl.addEventListener("focus", () => (isFocused = true));
        numberInputEl.addEventListener("blur", () => (isFocused = true));
        numberInputEl.addEventListener("input", () => this.onInputCb(+numberInputEl.value));
        numberInputEl.addEventListener("change", () => this.onChangeCb(+numberInputEl.value));
        setTimeout(() => {
            if (isFocused)
                return;
            numberInputEl.value = this.getNumber() + "";
        }, this.pollIntervalMs);
        return numberInputEl;
    }
}
/**
 * @unrestricted
 */
class RangeInput extends Widget {
    pollIntervalMs = 100;
    min;
    max;
    step;
    getNumber = () => 0;
    constructor(min = 0, max = 100, step = 1, defaultNumber) {
        super();
        this.min = min;
        this.max = max;
        this.step = step;
        if (defaultNumber)
            this.getNumber = defaultNumber;
    }
    onChangeCb = (_) => { };
    ["onChange"](cb) {
        this.onChangeCb = cb;
        return this;
    }
    onInputCb = (val) => { };
    ["onInput"](cb) {
        this.onInputCb = cb;
        return this;
    }
    create() {
        let minDisplayEl = elWithStyle({});
        minDisplayEl.textContent = this.min + "";
        let maxDisplayEl = elWithStyle({});
        maxDisplayEl.textContent = this.max + "";
        let rangeEl = elWithStyle({
            "max-width": "80px",
            "min-width": "0",
            "width": "80px",
            "flex": "1",
        }, "input");
        rangeEl.type = "range";
        rangeEl.value = this.getNumber() + "";
        rangeEl.min = this.min + "";
        rangeEl.max = this.max + "";
        rangeEl.step = this.step + "";
        let isFocused = false;
        rangeEl.addEventListener("focus", () => (isFocused = true));
        rangeEl.addEventListener("blur", () => (isFocused = true));
        rangeEl.addEventListener("input", () => this.onInputCb(+rangeEl.value));
        rangeEl.addEventListener("change", () => this.onChangeCb(+rangeEl.value));
        setTimeout(() => {
            if (isFocused)
                return;
            rangeEl.value = this.getNumber() + "";
        }, this.pollIntervalMs);
        let containerEl = elWithStyle({
            "display": "flex",
            "min-width": "0",
            "align-items": "center",
        });
        containerEl.append(minDisplayEl, rangeEl, maxDisplayEl);
        return containerEl;
    }
}
/**
 * @unrestriced
 */
class Group extends Widget {
    children;
    constructor(...children) {
        super();
        this.children = children;
    }
    direction = "row";
    ["withDir"](direction) {
        this.direction = direction;
        return this;
    }
    create() {
        let groupEl = elWithStyle({
            "display": "flex",
            "flex-direction": this.direction,
            "flex-wrap": "wrap",
            "justify-content": "flex-end",
            "align-items": "center",
            "gap": "5px",
            "min-width": "0",
        });
        this.children.forEach((child) => groupEl.append(child.create()));
        return groupEl;
    }
}
let widgets = {
    $button: (text) => new Button(text),
    $valueDisplay: (valueGetter) => new ValueDisplay(valueGetter),
    $text: (getText) => new TextInput(getText),
    $input: (getText) => new TextInput(getText),
    $number: (getNumber) => new NumberInput(getNumber),
    $range: (min, max, step, getNumber) => new RangeInput(min, max, step, getNumber),
    $slider: (min, max, step, getNumber) => new RangeInput(min, max, step, getNumber),
    $group: (...children) => new Group(...children),
};
Object.assign(window, widgets);
