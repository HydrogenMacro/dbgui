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
    constructor(text) {
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
    _repAsJson = true;
    /**
     * If the value should be represented by `JSON.stringify`ing it or not.
     * If false, the value will be displayed with `Object.toString`
     * @param repAsJson
     * @returns this
     */
    ["repAsJSON"](repAsJson) {
        this._repAsJson = repAsJson;
        return this;
    }
    ["repAsJson"](repAsJson) {
        return this.repAsJSON(repAsJson);
    }
    create() {
        let valueDisplayContainerEl = elWithStyle({
            "display": "flex",
            "flex-direction": "row",
        });
        if (this.pollInterval === "manual") {
            let valueDisplayEl = elWithStyle({});
            valueDisplayEl.textContent = JSON.stringify(this.valueGetter(), null, 2);
            let valueUpdateBtn = elWithStyle({
                ...buttonStyle(),
            }, "button");
            valueUpdateBtn.textContent = "Update";
            valueUpdateBtn.onclick = () => {
                valueDisplayEl.textContent = "...";
                this.currentValue = this.valueGetter();
                if (this._repAsJson) {
                    valueDisplayEl.textContent = JSON.stringify(this.currentValue, null, 2);
                }
                else {
                    valueDisplayEl.textContent = this.currentValue + "";
                }
            };
            valueDisplayContainerEl.append(valueDisplayEl, valueUpdateBtn);
        }
        else {
            let pollIntervalId = setInterval(() => {
                this.currentValue = this.valueGetter();
                if (this._repAsJson) {
                    valueDisplayContainerEl.textContent = JSON.stringify(this.currentValue, null, 2);
                }
                else {
                    valueDisplayContainerEl.textContent =
                        this.currentValue + "";
                }
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
    getText = () => "";
    constructor(getText) {
        super();
        if (getText)
            this.getText = getText;
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
        let textInputEl = elWithStyle({}, "input");
        textInputEl.value = this.getText();
        let isFocused = false;
        textInputEl.addEventListener("focus", () => isFocused = true);
        textInputEl.addEventListener("blur", () => isFocused = true);
        textInputEl.addEventListener("input", () => this.onInputCb(textInputEl.value));
        textInputEl.addEventListener("change", () => this.onChangeCb(textInputEl.value));
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
    getNumber = () => 0;
    constructor(getNumber) {
        super();
        if (getNumber)
            this.getNumber = getNumber;
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
        let numberInputEl = elWithStyle({}, "input");
        numberInputEl.type = "number";
        numberInputEl.value = this.getNumber() + "";
        let isFocused = false;
        numberInputEl.addEventListener("focus", () => isFocused = true);
        numberInputEl.addEventListener("blur", () => isFocused = true);
        numberInputEl.addEventListener("input", () => this.onInputCb(numberInputEl.value));
        numberInputEl.addEventListener("change", () => this.onChangeCb(numberInputEl.value));
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
    constructor(min = 0, max = 100, step = 1, getNumber) {
        super();
        this.min = min;
        this.max = max;
        this.step = step;
        if (getNumber)
            this.getNumber = getNumber;
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
        let rangeEl = elWithStyle({}, "input");
        rangeEl.type = "range";
        rangeEl.value = this.getNumber() + "";
        rangeEl.min = this.min + "";
        rangeEl.max = this.max + "";
        rangeEl.step = this.step + "";
        let isFocused = false;
        rangeEl.addEventListener("focus", () => isFocused = true);
        rangeEl.addEventListener("blur", () => isFocused = true);
        rangeEl.addEventListener("input", () => this.onInputCb(rangeEl.value));
        rangeEl.addEventListener("change", () => this.onChangeCb(rangeEl.value));
        setTimeout(() => {
            if (isFocused)
                return;
            rangeEl.value = this.getNumber() + "";
        }, this.pollIntervalMs);
        return rangeEl;
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
};
Object.assign(window, widgets);
