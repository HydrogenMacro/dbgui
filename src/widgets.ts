import { buttonStyle, elWithStyle, mkStyle } from "./util.js";

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
    create(): HTMLElement {}
}

/**
 * @unrestricted
 */
class Button extends Widget {
    text: string;
    clickCb: () => void = () => {};
    constructor(text: string = "Click") {
        super();
        this.text = text;
    }
    ["onClick"](clickCb: () => void): this {
        this.clickCb = clickCb;
        return this;
    }
    create(): HTMLElement {
        let btn = elWithStyle(
            {
                ...buttonStyle(),
            },
            "button",
        );
        btn.textContent = this.text;
        btn.onclick = this.clickCb;
        return btn;
    }
}

/**
 * @unrestricted
 */
class ValueDisplay<T> extends Widget {
    /**
     * @type {Function}
     */
    valueGetter: () => T;
    currentValue: T;
    constructor(valueGetter: () => T) {
        super();
        this.valueGetter = valueGetter;
        this.currentValue = valueGetter();
    }
    pollInterval: number | "manual" = 100;
    ["withPollInterval"](ms: number | "manual"): this {
        this.pollInterval = ms;
        return this;
    }
    stringifyFn: (val: T) => string = (val) => val + "";
    ["withStringifyFunction"](stringifyFunction: (val: T) => string): this {
        this.stringifyFn = stringifyFunction;
        return this;
    }
    create(): HTMLElement {
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
            let valueUpdateBtn = elWithStyle(
                {
                    ...buttonStyle(),
                },
                "button",
            );
            valueUpdateBtn.textContent = "Update";
            valueUpdateBtn.onclick = update;
            valueDisplayContainerEl.append(valueUpdateBtn);
        } else {
            let pollIntervalId = setInterval(() => {
                update()
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
    textInputEl: HTMLInputElement | undefined = undefined;
    getText = () => "";
    constructor(getText?: () => string) {
        super();
        if (getText) {
            this.getText = getText;
        } else {
            this.getText = () => this.textInputEl?.value ?? "";
        }
    }
    onInputCb = (_: string) => {};
    ["onInput"](cb: (val: string) => void): this {
        this.onInputCb = cb;
        return this;
    }
    onChangeCb = (_: string) => {};
    ["onChange"](cb: (val: string) => void): this {
        this.onChangeCb = cb;
        return this;
    }
    create(): HTMLElement {
        let textInputEl = (this.textInputEl = elWithStyle(
            {
                "min-width": "0",
                "max-width": "80px",
            },
            "input",
        ));
        textInputEl.value = this.getText();
        let isFocused = false;
        textInputEl.addEventListener("focus", () => (isFocused = true));
        textInputEl.addEventListener("blur", () => (isFocused = true));
        textInputEl.addEventListener("input", () =>
            this.onInputCb(textInputEl.value),
        );
        textInputEl.addEventListener("change", () =>
            this.onChangeCb(textInputEl.value),
        );
        // prevent memory leak using finalizationregistry or smthin
        setTimeout(() => {
            if (isFocused) return;
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
    numberInputEl: HTMLInputElement | undefined = undefined;
    getNumber = () => 0;

    constructor(getNumber?: () => number) {
        super();
        if (getNumber) {
            this.getNumber = getNumber;
        } else {
            this.getNumber = () => +(this.numberInputEl?.value ?? 0);
        }
    }
    onInputCb = (val: number) => {};
    ["onInput"](cb: (val: number) => void): this {
        this.onInputCb = cb;
        return this;
    }
    onChangeCb = (_: number) => {};
    ["onChange"](cb: (val: number) => void): this {
        this.onChangeCb = cb;
        return this;
    }
    create(): HTMLElement {
        let numberInputEl = (this.numberInputEl = elWithStyle(
            {
                "min-width": "0",
                "max-width": "80px",
            },
            "input",
        ));
        numberInputEl.type = "number";
        numberInputEl.value = this.getNumber() + "";
        let isFocused = false;
        numberInputEl.addEventListener("focus", () => (isFocused = true));
        numberInputEl.addEventListener("blur", () => (isFocused = true));
        numberInputEl.addEventListener("input", () =>
            this.onInputCb(+numberInputEl.value),
        );
        numberInputEl.addEventListener("change", () =>
            this.onChangeCb(+numberInputEl.value),
        );
        setTimeout(() => {
            if (isFocused) return;
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
    min: number;
    max: number;
    step: number;
    getNumber = () => 0;
    constructor(
        min: number = 0,
        max: number = 100,
        step: number = 1,
        defaultNumber?: () => number,
    ) {
        super();
        this.min = min;
        this.max = max;
        this.step = step;
        if (defaultNumber) this.getNumber = defaultNumber;
    }
    onChangeCb = (_: number) => {};
    ["onChange"](cb: (val: number) => void): this {
        this.onChangeCb = cb;
        return this;
    }
    onInputCb = (val: number) => {};
    ["onInput"](cb: (val: number) => void): this {
        this.onInputCb = cb;
        return this;
    }
    create(): HTMLElement {
        let minDisplayEl = elWithStyle({});
        minDisplayEl.textContent = this.min + "";

        let maxDisplayEl = elWithStyle({});
        maxDisplayEl.textContent = this.max + "";

        let rangeEl = elWithStyle(
            {
                "max-width": "80px",
                "min-width": "0",
                "width": "80px",
                "flex": "1",
            },
            "input",
        );
        rangeEl.type = "range";
        rangeEl.value = this.getNumber() + "";
        rangeEl.min = this.min + "";
        rangeEl.max = this.max + "";
        rangeEl.step = this.step + "";
        let isFocused = false;
        rangeEl.addEventListener("focus", () => (isFocused = true));
        rangeEl.addEventListener("blur", () => (isFocused = true));
        rangeEl.addEventListener("input", () =>
            this.onInputCb(+rangeEl.value),
        );
        rangeEl.addEventListener("change", () =>
            this.onChangeCb(+rangeEl.value),
        );
        setTimeout(() => {
            if (isFocused) return;
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
    children: Array<Widget>;
    constructor(...children: Array<Widget>) {
        super();
        this.children = children;
    }
    direction: "row" | "column" = "row";
    ["withDir"](direction: "row" | "column"): this {
        this.direction = direction;
        return this;
    }
    create(): HTMLElement {
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
    $button: (text: string) => new Button(text),
    $valueDisplay: <T>(valueGetter: () => T) =>
        new ValueDisplay<T>(valueGetter),
    $text: (getText?: () => string) => new TextInput(getText),
    $input: (getText?: () => string) => new TextInput(getText),
    $number: (getNumber?: () => number) => new NumberInput(getNumber),
    $range: (
        min?: number,
        max?: number,
        step?: number,
        getNumber?: () => number,
    ) => new RangeInput(min, max, step, getNumber),
    $slider: (
        min?: number,
        max?: number,
        step?: number,
        getNumber?: () => number,
    ) => new RangeInput(min, max, step, getNumber),
    $group: (...children: Array<Widget>) => new Group(...children),
};
Object.assign(window, widgets);

type Widgets = {
    [K in keyof typeof widgets]: (typeof widgets)[K];
};

declare global {
    interface Window extends Widgets {}
    
    const $button: typeof widgets.$button;
    const $valueDisplay: typeof widgets.$valueDisplay;
    const $text: typeof widgets.$text;
    const $input: typeof widgets.$input;
    const $number: typeof widgets.$number;
    const $range: typeof widgets.$range;
    const $slider: typeof widgets.$slider;
    const $group: typeof widgets.$group;
}
