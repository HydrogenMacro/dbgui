# dbgui

![dbgui](https://img.shields.io/npm/v/dbgui)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fhydrogenmacro.github.io%2Fdbgui)

A simple, versatile, and quick debug UI.

# Installation

```
npm i dbgui
```

```html
<script src="https://cdn.jsdelivr.net/npm/dbgui/dist/dbgui.min.js"></script>
```

`dbgui()` and associated functions are automatically injected into `window`, so no other setup is required.

# Example

```js
// The UI automatically gets created and appended to DOM,
// and dbgui() returns a singleton interface to it

// dbgui operates on a simple key-value system,
// sort of like a hashmap.
dbgui()
    // .add creates a new entry in the UI.
    // $button creates a widget, which is an interactive input that may be used to interface with your code.
    .add("Key", $button("Widget"))

    // Keys are unique and are automatically sorted in the UI
    .add("Key", $input()) // This replaces the button created above with a text input widget.
    .add("J", null) // This creates a new entry in the UI before Key, since J is less than K in ASCII/Unicode
    .add("Key", null) // a null widget simply removes the entry from the UI (if it exists). The UI is now empty.

    // To interface with your code, widgets have event listeners that can accept callbacks:
    .add(
        "Button",
        $button("Click me!")
            .onClick(() => {
                alert("Hi!");
            })
    );
    // Note how everything is chainable, which means you can do this:
    .add(
        "Button",
        $button("Click me!")
            .onClick(() => { alert("Hi!") })
            .onClick(() => { alert("Hey!") })
            .onClick(() => { alert("Hello!") })
            // clicking this would now spawn 3 alerts
    )
    // similarly, text inputs also have events:
    .add("Text Input", $text()/* $text is an alias of $input */
        // onChange callback gets called when the text content changes (from typing, deleting, pasting, etc.)
        .onChange((value) => {
            console.log("User changed the text input's value to be: " + value);
        })
        // onInput callback gets called when Enter key gets pressed
        .onInput((value) => {
            console.log("User submitted: " + value);
        })
    )

// To help with grouping and organization, there are also categories:
dbgui().in("Example Category")
    // and the API is still the exact same!
    .add("Key", $button("Widget").onClick(() => {
        // category names are also unique, so you can
        // freely replace components in categories as well
        dbgui().in("Example Category").add("Key", $text());
    }));
    // $slider/$range creates a slider input
    // which accepts a min, max, and step value.
    // Also has .onInput() and .onChange() events
    .add("Abc", $slider(0, 100, 1));
    .add("Remove Abc", $button("Remove")
        .onClick(() => {
            // dbgui().addIn(category, key, widget)
            // is shorthand for
            // dbgui().in(category).add(key, widget)

            dbgui().addIn("Example Category", "Abc", null); // removes Abc
        })
    )
// note that sub-categories are not supported: `dbgui().in("A").in("B")` does not work

// There's a bit more widgets that we offer, but that's it!
```

Visit [the website](https://hydrogenmacro.github.io/dbgui) for more live demonstrations.

# Docs
All methods are chainable and return `this`.
<table>
    <tr>
        <th>Widget</th>
        <th>Parameters</th>
        <th>Methods</th>
        <th>Info</th>
    </tr>
    <tr>
        <td><code>$button</code></td>
        <td><code>(buttonText: string)</code></td>        
        <td><code>.onClick(() => void)</code></td>
    </tr>
    <tr>
        <td><code>$input</code>, <code>$text</code></td>
        <td><code>(textGetter: (() => string) | undefined)</code></td>        
        <td><code>.onChange((newValue: string) => void)</code>, <code>.onInput((value: string) => void)</code></td>
        <td>Accepts a text getter that is automatically polled to be set as the input value.</td>
    </tr>
    <tr>
        <td><code>$range</code>, <code>$slider</code></td>
        <td><code>(numGetter: (() => number) | undefined)</code></td>        
        <td><code>.onChange((newValue: number) => void)</code>, <code>.onInput((value: number) => void)</code></td>
        <td>Accepts a number getter that is automatically polled to be set as the input value.</td>
    </tr>
    <tr>
        <td><code>$valueDisplay</code></td>
        <td><code>&lt;T&gt;(getter: () => T)</code></td>        
        <td><code>withPollInterval(pollInterval: number | "manual")</code>,<code>repAsJSON(representAsJson: boolean)</code></td>
        <td>Displays a single value that can either be automatically or manually polled. repAsJSON determines if <code>JSON.stringify</code> or <code>Object.toString</code> is used to convert its value to a string.</td>
    </tr>
    <tr>
        <td><code>$group</code></td>
        <td><code>(...childrenWidgets: Widgets[])</code></td>        
        <td><code>withDir(direction: "row" | "column")</code></td>
        <td>Allows you to have multiple widgets in one UI entry.</td>
    </tr>
</table>