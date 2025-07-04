/*
dbgui()
    .add("Abc", null)
    .add(["Abc", "Def"], $select(() => ["Abc", "Def", "Ghi"]).onChange((opt) => console.log(opt)))
    .add("Ghi.Items", $range(0, 100, .1).onChange(() => a += 1))
dbgui().in("Abc").add("Def")
*/
import { elWithStyle, mkStyle } from "./util.js";
let url = new URL(location.href);
let config = {
    fontSize: url.searchParams.get("fontSize") || "14",
};
const dbguiRowClass = "__DBGUI_INJECTED_row";
const dbguiCategoryClass = "__DBGUI_INJECTED_category";
const dbguiSummaryClass = "__DBGUI_INJECTED_summary";
const styleTag = document.createElement("style");
styleTag.innerHTML = `.${dbguiRowClass}:nth-of-type(2n):not(.${dbguiCategoryClass}),.${dbguiRowClass}.${dbguiCategoryClass}:nth-of-type(2n)>summary{background-color:rgb(200 200 200) !important;}.${dbguiSummaryClass}::marker{all: revert !important;}`; //&:not(:first-of-type){border-top:rgb(100 100 100) 1px solid;}
document.head.insertAdjacentElement("beforeend", styleTag);
class DbgUICategory {
    static cache = new Map();
    categoryEl;
    widgetsContainerEl;
    constructor(key) {
        this.categoryEl = document.createElement("details");
        this.categoryEl.style.cssText = mkStyle({
            "display": "flex",
            "flex-direction": "column",
        });
        this.categoryEl.classList.add(dbguiRowClass, dbguiCategoryClass);
        this.categoryEl.dataset.categoryName = sanitizeQuotedString(key);
        let categoryKeyEl = elWithStyle({}, "summary");
        categoryKeyEl.classList.add(dbguiSummaryClass);
        categoryKeyEl.textContent = key;
        this.widgetsContainerEl = elWithStyle({
            "width": "100%",
            //"overflow": "hidden",
        });
        this.categoryEl.append(categoryKeyEl, this.widgetsContainerEl);
    }
    static of(key, dbgui) {
        if (DbgUICategory.cache.has(key)) {
            return DbgUICategory.cache.get(key);
        }
        let dbgUICategory = new DbgUICategory(key);
        insertElIntoSortedChildren(dbgui.categoriesContainerEl, dbgUICategory.categoryEl, key, (otherCategoryEl) => otherCategoryEl.dataset.categoryName);
        DbgUICategory.cache.set(key, dbgUICategory);
        return dbgUICategory;
    }
    add(key, widget) {
        let queriedWidget = this.widgetsContainerEl.querySelector(`[data-key="${sanitizeQuotedString(key)}"]`);
        if (widget === null) {
            if (queriedWidget) {
                queriedWidget.remove();
            }
        }
        else {
            let el = createWidgetContainer(key, widget);
            if (queriedWidget) {
                queriedWidget.replaceWith(el);
                return this;
            }
            insertElIntoSortedChildren(this.widgetsContainerEl, el, key, (containerChildEl) => containerChildEl.dataset.key);
        }
        return this;
    }
}
function insertElIntoSortedChildren(containerEl, elToInsert, key, childToOrderable) {
    if (containerEl.children.length === 0) {
        containerEl.append(elToInsert);
        return;
    }
    // binary search for the correct element
    let hi = containerEl.children.length;
    let lo = 0;
    while (hi != lo) {
        let pivot = Math.floor((lo + hi) / 2);
        if (key > childToOrderable(containerEl.children[pivot])) {
            lo = pivot + 1;
        }
        else {
            hi = pivot;
        }
    }
    if (containerEl.children.length === lo) {
        containerEl.append(elToInsert);
    }
    else {
        containerEl.children[lo].insertAdjacentElement("beforebegin", elToInsert);
    }
}
class DbgUI {
    /**
     * @type {HTMLElement}
     */
    container;
    moveHandle;
    resizeHandles;
    contents;
    nonCategorizedWidgetsEl;
    categoriesContainerEl;
    constructor() {
        let containerEl;
        let screenPaddingPx = 10;
        let resizeHandleWidthPx = 6;
        let remainingScreenWidth = (window.innerWidth - 2 * screenPaddingPx);
        let remainingScreenHeight = (window.innerHeight - 2 * screenPaddingPx);
        let remainingScreenMinSize = remainingScreenWidth < remainingScreenHeight ? remainingScreenWidth : remainingScreenHeight;
        let containerElInterface = {
            x: screenPaddingPx,
            y: screenPaddingPx,
            width: remainingScreenWidth * 2 / 5,
            height: remainingScreenHeight * 3 / 5,
            minWidth: remainingScreenMinSize * 1 / 6,
            minHeight: remainingScreenMinSize * 1 / 6,
            maxWidth: remainingScreenWidth * 5 / 6,
            maxHeight: remainingScreenHeight * 5 / 6,
            /*
            // attempt to make resizing generic (fail)
            resizeInDir(
                dir: "horizontal" | "vertical",
                positiveResizePxExpandsBox: boolean,
                resizePx: number
            ) {
                let boxSize = dir === "horizontal" ? this.width : this.height;
                let minBoxSize =
                    dir === "horizontal" ? this.minWidth : this.minHeight;
                let maxBoxSize =
                    dir === "horizontal" ? this.maxWidth : this.maxHeight;
                let setBoxSize = (n: number) =>
                    dir === "horizontal"
                        ? (this.width = boxSize = n)
                        : (this.height = boxSize = n);
                let boxPos = dir === "horizontal" ? this.x : this.y;
                let setBoxPos = (n: number) =>
                    dir === "horizontal"
                        ? (this.x = boxPos = n)
                        : (this.y = boxPos = n);
                let windowSize =
                    dir === "horizontal"
                        ? window.innerWidth
                        : window.innerHeight;
                let resizeExpandsBox = positiveResizePxExpandsBox
                    ? resizePx > 0
                    : resizePx < 0;

                // for N, is the top of screen
                // for S, is the bottom of screen
                let boxExpandLimitPos = positiveResizePxExpandsBox
                    ? windowSize - screenPaddingPx
                    : screenPaddingPx;

                let boxShrinkLimitPos = positiveResizePxExpandsBox
                    ? screenPaddingPx + minBoxSize
                    : windowSize - (screenPaddingPx + minBoxSize);

                let reachedExpandLimit = (n: number, lim: number): boolean => {
                    if (positiveResizePxExpandsBox) {
                        return n > lim;
                    } else {
                        return n < lim;
                    }
                };

                let reachedShrinkLimit = (n: number, lim: number): boolean => {
                    if (positiveResizePxExpandsBox) {
                        return n < lim;
                    } else {
                        return n > lim;
                    }
                };

                // for N:
                // factors to consider:
                // is dragging up or down?
                // if dragging down, is box at minHeight?
                // if dragging up, is box at maxHeight?
                // if dragging down, is box at bottom side?
                // if dragging up, is box at top side?

                if (resizeExpandsBox) {
                    console.log("expanding box");

                    // N: dragging up
                    // if at top, then dont do anything
                    // if at max height, move up until at top
                    // else, expand until max height or at top

                    // S: dragging down
                    // if at bottom, then dont do anything
                    // if at max height, move down until at bottom
                    // else, expand until max height or at bottom

                    // W: dragging right
                    // if at right edge, do nothing
                    // if at max width, move right until at right edge
                    // else, expand until right edge or max width
                    if (boxPos === boxExpandLimitPos) {
                        // do nothing
                    } else if (boxSize === maxBoxSize) {
                        if (
                            
                                boxSize + boxPos + resizePx >
                                boxExpandLimitPos
                            
                        ) {
                            setBoxPos(boxExpandLimitPos);
                        } else {
                            setBoxPos(boxPos + resizePx);
                        }
                    } else {
                        if (boxSize + resizePx > maxBoxSize) {
                            // max height
                            setBoxSize(maxBoxSize);
                        } else if (
                            
                                boxPos - resizePx >
                                boxExpandLimitPos
                            
                        ) {
                            // at bottom
                            setBoxPos(boxExpandLimitPos);
                        } else {
                            setBoxPos(boxPos + resizePx);
                            setBoxSize(boxSize + Math.abs(resizePx));
                        }
                    }
                } else {
                    // dragging down

                    // if at bottom, shrink box down until minHeight
                    // if at minHeight, move box down until at bottom
                    // else, shrink box until bottom or minHeight
                    if (
                        windowSize - screenPaddingPx <
                        boxPos + boxSize + resizePx
                    ) {
                        if (boxSize - resizePx > minBoxSize) {
                            setBoxSize(boxSize - resizePx);
                        } else {
                            setBoxSize(minBoxSize);
                            setBoxPos(windowSize - (screenPaddingPx + boxSize));
                        }
                    } else if (boxSize === minBoxSize) {
                        if (
                            windowSize - screenPaddingPx <
                            boxPos + boxSize + resizePx
                        ) {
                            setBoxPos(windowSize - screenPaddingPx - boxSize);
                        } else {
                            setBoxPos(boxPos + resizePx);
                        }
                    } else {
                        if (
                            boxPos + boxSize + screenPaddingPx + resizePx >
                            windowSize
                        ) {
                            setBoxPos(windowSize - (screenPaddingPx + boxSize));
                        } else {
                            setBoxSize(boxSize - resizePx);
                            setBoxPos(boxPos + resizePx);
                        }
                        if (boxSize + resizePx <= minBoxSize) {
                            setBoxSize(minBoxSize);
                        }
                    }
                }

                this.update();
            },
            */
            resizeN(resizePx) {
                //this.resizeInDir("vertical", false, resizePx);
                // factors to consider:
                // is dragging up or down?
                // if dragging down, is box at minHeight?
                // if dragging up, is box at maxHeight?
                // if dragging down, is box at bottom side?
                // if dragging up, is box at top side?
                if (resizePx >= 0) {
                    // dragging down
                    // if at bottom, move box down until minHeight
                    // if at minHeight, move box down until at bottom
                    // else, shrink box until bottom or minHeight
                    if (this.y ===
                        window.innerHeight - screenPaddingPx - this.height) {
                        if (this.height - resizePx > this.minHeight) {
                            this.height -= resizePx;
                            this.y += resizePx;
                        }
                        else {
                            this.height = this.minHeight;
                            this.y =
                                window.innerHeight -
                                    (screenPaddingPx + this.height);
                        }
                    }
                    else if (this.height === this.minHeight) {
                        if (window.innerHeight - screenPaddingPx <
                            this.y + this.height + resizePx) {
                            this.y =
                                window.innerHeight -
                                    screenPaddingPx -
                                    this.height;
                        }
                        else {
                            this.y += resizePx;
                        }
                    }
                    else {
                        if (this.y + this.height + screenPaddingPx + resizePx >
                            window.innerHeight) {
                            this.y =
                                window.innerHeight -
                                    (screenPaddingPx + this.height);
                        }
                        else if (this.height - resizePx <= this.minHeight) {
                            let difference = this.minHeight - (this.height - resizePx);
                            this.height = this.minHeight;
                            this.y += difference;
                        }
                        else {
                            this.height -= resizePx;
                            this.y += resizePx;
                        }
                    }
                }
                else {
                    // dragging up
                    // if at top, then dont do anything
                    // if at max height, move up until at top
                    // else, expand until max height or at top
                    if (this.y === screenPaddingPx) {
                        // do nothing
                    }
                    else if (this.height === this.maxHeight) {
                        if (this.y + resizePx < screenPaddingPx) {
                            this.y = screenPaddingPx;
                        }
                        else {
                            this.y += resizePx;
                        }
                    }
                    else {
                        if (this.y + resizePx < screenPaddingPx) {
                            this.height -= this.y + resizePx - screenPaddingPx;
                            this.y = screenPaddingPx;
                        }
                        else {
                            this.height -= resizePx;
                            this.y += resizePx;
                        }
                    }
                }
                this.update();
            },
            resizeS(resizePx) {
                if (resizePx >= 0) {
                    // dragging down
                    // if at bottom, then dont do anything
                    // if at max height, move down until at bottom
                    // else, expand until at bottom or max height
                    if (this.y === window.innerHeight - screenPaddingPx) {
                        // do nothing
                    }
                    else if (this.height === this.maxHeight) {
                        this.y = Math.min(this.y + resizePx, window.innerHeight - screenPaddingPx - this.height);
                    }
                    else {
                        this.height = Math.min(this.height + resizePx, this.maxHeight, window.innerHeight - screenPaddingPx - this.y);
                    }
                }
                else {
                    // dragging up
                    // if at top, shrink box down until minHeight
                    // if at minHeight, move box up until at top
                    // else, shrink box until minHeight
                    if (this.y === screenPaddingPx) {
                        this.height = Math.max(this.height + resizePx, this.minHeight);
                    }
                    else if (this.height === this.minHeight) {
                        this.y = Math.max(this.y + resizePx, screenPaddingPx);
                    }
                    else {
                        this.height = Math.max(this.height + resizePx, this.minHeight);
                    }
                }
                this.update();
            },
            resizeW(resizePx) {
                if (resizePx <= 0) {
                    // dragging left
                    // if at leftmost, then don't do anything
                    // if at max width, move left until at leftmost
                    // else, expand until at left or max width
                    if (this.x === screenPaddingPx) {
                        // do nothing
                    }
                    else if (this.width === this.maxWidth) {
                        this.x = Math.max(this.x + resizePx, screenPaddingPx);
                    }
                    else {
                        let newWidth = Math.min(this.width - resizePx, this.maxWidth, this.x + this.width - screenPaddingPx);
                        this.x = this.x + this.width - newWidth;
                        this.width = newWidth;
                    }
                }
                else {
                    // dragging right
                    // if at right, shrink box right until minWidth
                    // if at minWidth, move box right until at right
                    // else, shrink box until minWidth
                    if (this.x + this.width ===
                        window.innerWidth - screenPaddingPx) {
                        this.width = Math.max(this.width - resizePx, this.minWidth);
                    }
                    else if (this.width === this.minWidth) {
                        this.x = Math.min(this.x + resizePx, window.innerWidth - screenPaddingPx - this.width);
                    }
                    else {
                        let newWidth = Math.max(this.width - resizePx, this.minWidth);
                        this.x += this.width - newWidth;
                        this.width = newWidth;
                    }
                }
                this.update();
            },
            resizeE(resizePx) {
                if (resizePx >= 0) {
                    // dragging right
                    // if at rightmost, then don't do anything
                    // if at max width, move right until at rightmost
                    // else, expand until at right or max width
                    if (this.x + this.width ===
                        window.innerWidth - screenPaddingPx) {
                        // do nothing
                    }
                    else if (this.width === this.maxWidth) {
                        this.x = Math.min(this.x + resizePx, window.innerWidth - screenPaddingPx - this.width);
                    }
                    else {
                        this.width = Math.min(this.width + resizePx, this.maxWidth, window.innerWidth - screenPaddingPx - this.x);
                    }
                }
                else {
                    // dragging left
                    // if at left, shrink box left until minWidth
                    // if at minWidth, move box left until at left
                    // else, shrink box until minWidth
                    if (this.x === screenPaddingPx) {
                        this.width = Math.max(this.width + resizePx, this.minWidth);
                    }
                    else if (this.width === this.minWidth) {
                        this.x = Math.max(this.x + resizePx, screenPaddingPx);
                    }
                    else {
                        this.width = Math.max(this.width + resizePx, this.minWidth);
                    }
                }
                this.update();
            } /*
            shouldResizeN(pointerY: number): boolean {
                return (
                    pointerY >= screenPaddingPx &&
                    pointerY <=
                        window.innerHeight - (screenPaddingPx + this.minHeight - resizeHandleWidthPx)
                );
            },
            shouldResizeS(pointerY: number): boolean {
                return (
                    pointerY >= screenPaddingPx + this.minHeight - resizeHandleWidthPx &&
                    pointerY <= window.innerHeight - screenPaddingPx
                );
            },*/,
            update() {
                containerEl.style.left = this.x + "px";
                containerEl.style.top = this.y + "px";
                containerEl.style.width = containerEl.style.maxWidth =
                    this.width + "px";
                containerEl.style.height = containerEl.style.maxHeight =
                    this.height + "px";
            },
        };
        containerEl = this.container = elWithStyle({
            "position": "fixed",
            "display": "grid",
            "grid": `"nw n ne" ${resizeHandleWidthPx}px "w c e" 1fr "sw s se" ${resizeHandleWidthPx}px / ${resizeHandleWidthPx}px 1fr ${resizeHandleWidthPx}px`,
            "left": containerElInterface.x + "px",
            "top": containerElInterface.y + "px",
            "width": containerElInterface.width + "px",
            "max-width": containerElInterface.width + "px",
            "height": containerElInterface.height + "px",
            "max-height": containerElInterface.height + "px",
            "user-select": "none",
            "background": "rgb(230 230 230 / .7)"
        });
        this.moveHandle = elWithStyle({
            "background": "beige",
        });
        this.resizeHandles = ["n", "ne", "e", "se", "s", "sw", "w", "nw"].map((dir) => {
            let resizeHandle = elWithStyle({
                "grid-area": dir,
                "cursor": `${dir}-resize`,
                "background": "black",
            });
            let isBeingDragged = false;
            let horPointerHandleOffset = 0;
            let vertPointerHandleOffset = 0;
            // type assertion needed for ev to be PointerEvent
            resizeHandle.addEventListener("pointerdown", (ev) => {
                isBeingDragged = true;
            });
            window.addEventListener("pointermove", (ev) => {
                if (!isBeingDragged)
                    return;
                switch (true) {
                    case dir.includes("n"):
                        containerElInterface.resizeN(ev.movementY);
                        break;
                    case dir.includes("s"):
                        containerElInterface.resizeS(ev.movementY);
                        break;
                }
                switch (true) {
                    case dir.includes("e"):
                        containerElInterface.resizeE(ev.movementX);
                        break;
                    case dir.includes("w"):
                        containerElInterface.resizeW(ev.movementX);
                        break;
                }
            });
            window.addEventListener("pointerup", () => {
                isBeingDragged = false;
            });
            return resizeHandle;
        });
        this.contents = document.createElement("div");
        this.contents.style.cssText = mkStyle({
            "grid-area": "c",
            "font-family": `"IBM Plex Mono", monospace`,
            "font-size": config.fontSize + "px",
            "display": "flex",
            "flex-direction": "column",
            "padding": "6px",
            "min-width": "0px",
            "max-width": "100%",
            "overflow": "hidden auto",
            "gap": "3px",
            "user-select": "auto"
        });
        this.container.append(this.contents, ...this.resizeHandles);
        this.nonCategorizedWidgetsEl = document.createElement("div");
        this.nonCategorizedWidgetsEl.style.cssText = mkStyle({
            "display": "flex",
            "flex-direction": "column",
            "width": "100%",
            "max-height": "40%",
            "overflow": "hidden auto",
            "gap": "3px",
        });
        this.categoriesContainerEl = document.createElement("div");
        this.categoriesContainerEl.style.cssText = mkStyle({
            "display": "flex",
            "flex-direction": "column",
            "width": "100%",
            "flex": "1",
            "overflow": "hidden auto",
            "gap": "3px",
        });
        this.contents.append(this.nonCategorizedWidgetsEl, this.categoriesContainerEl);
    }
    _addToDocument() {
        document.body.appendChild(this.container);
        /*
        // ok this just infinitely loops
        // need fix pls
        let mo = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (!Array.from(mutation.addedNodes).includes(this.container))
                document.body.append(this.container);
            }
        });
        mo.observe(document.body, { childList: true })*/
    }
    add(key, widget) {
        let queriedWidget = this.nonCategorizedWidgetsEl.querySelector(`[data-key="${sanitizeQuotedString(key)}"]`);
        if (widget === null) {
            if (queriedWidget) {
                queriedWidget.remove();
            }
        }
        else {
            let el = createWidgetContainer(key, widget);
            if (queriedWidget) {
                queriedWidget.replaceWith(el);
                return this;
            }
            insertElIntoSortedChildren(this.nonCategorizedWidgetsEl, el, key, (containerChildEl) => containerChildEl.dataset.key);
        }
        return this;
    }
    in(categoryName) {
        return DbgUICategory.of(categoryName, this);
    }
    addIn(categoryName, key, widget) {
        this.in(categoryName).add(key, widget);
        return this;
    }
    show() {
        this.container.style.display = "grid";
    }
    hide() {
        this.container.style.display = "none";
    }
}
function createWidgetContainer(key, widget) {
    let widgetEl = widget.create();
    let widgetWrapperEl = elWithStyle({
        "flex": "1",
        "min-width": "0",
        "display": "flex",
        "justify-content": "end",
        "font-size": +config.fontSize * 0.8 + "px",
        "align-self": "center"
    });
    widgetWrapperEl.append(widgetEl);
    let labelEl = document.createElement("div");
    labelEl.style.cssText = mkStyle({
        "min-width": "0",
        "max-width": "50%",
        "overflow-wrap": "anywhere",
        "text-overflow": "ellipsis",
    });
    labelEl.textContent = key;
    let containerEl = document.createElement("div");
    containerEl.style.cssText = mkStyle({
        "width": "100%",
        "overflow-y": "hidden",
        "overflow-x": "auto",
        "display": "flex",
        "flex-direction": "row",
        "justify-content": "space-between",
        "align-items": "start",
        "flex-wrap": "nowrap",
        "flex": "none",
    });
    containerEl.classList.add(dbguiRowClass);
    containerEl.append(labelEl, widgetWrapperEl);
    containerEl.dataset.key = key;
    return containerEl;
}
function sanitizeQuotedString(str) {
    return str.replaceAll("\\", "\\\\").replaceAll(`"`, `\\"`);
}
let dbgUISingleton = new DbgUI();
window["dbgui"] = () => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            dbgUISingleton._addToDocument();
        }, { once: true });
    }
    else {
        dbgUISingleton._addToDocument();
    }
    return dbgUISingleton;
};
const fontFace = new FontFace("IBM Plex Mono", "url(https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n1i8q1w.woff2)");
// bro it literally exists since 2020 why is TS tweaking https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/add
// @ts-ignore
document.fonts.add(fontFace);
fontFace.load();
