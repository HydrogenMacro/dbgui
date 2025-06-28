export declare function mkStyle(styleObj: Record<string, string>): string;
export declare function buttonStyle(): Record<string, string>;
export declare function elWithStyle<K extends keyof HTMLElementTagNameMap>(styling: Record<string, string>, elType?: K): HTMLElementTagNameMap[K];
