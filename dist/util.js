export function mkStyle(styleObj) {
    return Object.entries(styleObj).reduce((acc, [k, v]) => acc + `${k}:${v};`, "");
}
export function buttonStyle() {
    return {
        "all": "unset",
        "padding": "3px",
        "background": "rgb(150 150 150)",
        "font-family": `"IBM Plex Mono", monospace`,
        "display": "flex",
        "text-align": "center"
    };
}
export function elWithStyle(styling, elType = "div") {
    let el = document.createElement(elType);
    el.style.cssText = mkStyle(styling);
    return el;
}
