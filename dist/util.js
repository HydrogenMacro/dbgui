export function mkStyle(styleObj) {
    return Object.entries(styleObj).reduce((acc, [k, v]) => acc + `${k}:${v};`, "");
}
export function buttonStyle() {
    return {
        "all": "unset",
        "padding": "2px",
        "background": "rgb(100 100 100)",
        "font-family": `"IBM Plex Mono", monospace`,
    };
}
export function elWithStyle(styling, elType = "div") {
    let el = document.createElement(elType);
    el.style.cssText = mkStyle(styling);
    return el;
}
