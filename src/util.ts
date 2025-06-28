export function mkStyle(styleObj: Record<string, string>): string {
    return Object.entries(styleObj).reduce(
        (acc, [k, v]) => acc + `${k}:${v};`,
        ""
    );
}
export function buttonStyle(): Record<string, string> {
    return {
        "all": "unset",
        "padding": "2px",
        "background": "rgb(100 100 100)",
        "font-family": `"IBM Plex Mono", monospace`,
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
