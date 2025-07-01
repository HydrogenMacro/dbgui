export function mkStyle(styleObj: Record<string, string>): string {
    return Object.entries(styleObj).reduce(
        (acc, [k, v]) => acc + `${k}:${v};`,
        ""
    );
}
export function buttonStyle(): Record<string, string> {
    return {
        "all": "unset",
        "padding": "3px",
        "background": "rgb(150 150 150)",
        "font-family": `"IBM Plex Mono", monospace`,
        "display": "flex",
        "text-align": "center"
    };
}
export function elWithStyle<K extends keyof HTMLElementTagNameMap>(
    styling: Record<string, string>,
    elType: K = "div" as K
): HTMLElementTagNameMap[K] {
    let el = document.createElement(elType);
    el.style.cssText = mkStyle(styling);
    return el;
}
