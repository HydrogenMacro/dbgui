/**
 * @abstract
 * Abstract class that is the base of every widget.
 * Cannot be marked as abstract in typescript, since the JS needs to be able to be generated
 * in order for closure compiler to work with it.
 */
export declare class Widget {
    /** @abstract @return {Element} */
    create(): HTMLElement;
}
/**
 * @unrestricted
 */
declare class Button extends Widget {
    text: string;
    clickCb: () => void;
    constructor(text: string);
    ["onClick"](clickCb: () => void): this;
    create(): HTMLElement;
}
/**
 * @unrestricted
 */
declare class ValueDisplay<T> extends Widget {
    /**
     * @type {Function}
     */
    valueGetter: () => T;
    currentValue: T;
    constructor(valueGetter: () => T);
    pollInterval: number | "manual";
    ["withPollInterval"](ms: number | "manual"): this;
    _repAsJson: boolean;
    /**
     * If the value should be represented by `JSON.stringify`ing it or not.
     * If false, the value will be displayed with `Object.toString`
     * @param repAsJson
     * @returns this
     */
    ["repAsJSON"](repAsJson: boolean): this;
    ["repAsJson"](repAsJson: boolean): this;
    create(): HTMLElement;
}
/**
 * @unrestricted
 */
declare class TextInput extends Widget {
    pollIntervalMs: number;
    getText: () => string;
    constructor(getText?: () => string);
    onInputCb: (_: string) => void;
    ["onInput"](cb: (val: string) => void): this;
    onChangeCb: (_: string) => void;
    ["onChange"](cb: (val: string) => void): this;
    create(): HTMLElement;
}
/**
 * @unrestricted
 */
declare class NumberInput extends Widget {
    pollIntervalMs: number;
    getNumber: () => number;
    constructor(getNumber?: () => number);
    onInputCb: (val: number) => void;
    ["onInput"](cb: (val: number) => void): this;
    onChangeCb: (_: number) => void;
    ["onChange"](cb: (val: number) => void): this;
    create(): HTMLElement;
}
/**
 * @unrestricted
 */
declare class RangeInput extends Widget {
    pollIntervalMs: number;
    min: number;
    max: number;
    step: number;
    getNumber: () => number;
    constructor(min?: number, max?: number, step?: number, getNumber?: () => number);
    onChangeCb: (_: number) => void;
    ["onChange"](cb: (val: number) => void): this;
    onInputCb: (val: number) => void;
    ["onInput"](cb: (val: number) => void): this;
    create(): HTMLElement;
}
declare let widgets: {
    $button: (text: string) => Button;
    $valueDisplay: <T>(valueGetter: () => T) => ValueDisplay<T>;
    $text: (getText?: () => string) => TextInput;
    $input: (getText?: () => string) => TextInput;
    $number: (getNumber?: () => number) => NumberInput;
    $range: (min?: number, max?: number, step?: number, getNumber?: () => number) => RangeInput;
    $slider: (min?: number, max?: number, step?: number, getNumber?: () => number) => RangeInput;
};
type Widgets = {
    [K in keyof typeof widgets]: (typeof widgets)[K];
};
declare global {
    interface Window extends Widgets {
    }
}
export {};
