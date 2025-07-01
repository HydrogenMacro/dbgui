import { Widget } from "./widgets.js";
declare class DbgUICategory {
    static cache: Map<string, DbgUICategory>;
    categoryEl: HTMLElement;
    widgetsContainerEl: HTMLElement;
    constructor(key: string);
    static of(key: string, dbgui: DbgUI): DbgUICategory;
    add(key: string, widget: Widget | null): this;
}
declare class DbgUI {
    /**
     * @type {HTMLElement}
     */
    container: HTMLElement;
    moveHandle: HTMLElement;
    resizeHandles: Array<HTMLElement>;
    contents: HTMLElement;
    nonCategorizedWidgetsEl: HTMLElement;
    categoriesContainerEl: HTMLElement;
    constructor();
    _addToDocument(): void;
    add(key: string, widget: Widget | null): this;
    in(categoryName: string): DbgUICategory;
    addIn(categoryName: string, key: string, widget: Widget | null): this;
}
declare global {
    const dbgui: () => DbgUI;
    interface Window {
        dbgui: () => DbgUI;
    }
}
export {};
