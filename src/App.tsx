import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import recursiveFontUrl from "./assets/Recursive.ttf";
import recursiveTypeFace from "./assets/RecursiveTypeFace.json";
import toolImgUrl from "./assets/tool.png";
import debugImgUrl from "./assets/grid.png";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
    Center,
    Decal,
    PerspectiveCamera,
    RoundedBoxGeometry,
    Text3D,
} from "@react-three/drei";
import "dbgui";
import { TextureLoader, type Mesh } from "three";
import ace from "ace-builds";

import aceModeJs from "ace-builds/src-noconflict/mode-javascript?url";
ace.config.setModuleUrl("ace/mode/javascript", aceModeJs);

import aceThemeGithubDark from "ace-builds/src-noconflict/theme-github_dark?url";
ace.config.setModuleUrl("ace/theme/github_dark", aceThemeGithubDark);

import AceEditor from "react-ace";

const recursiveFont = new FontFace("Recursive", `url(${recursiveFontUrl})`);
document.fonts.add(recursiveFont);
recursiveFont.load();

function FirstRenderWatcher({
    onFirstRender = () => {},
}: {
    onFirstRender?: () => void;
}) {
    let renderedBefore = useRef(false);
    useFrame(() => {
        if (renderedBefore.current) return;
        onFirstRender();
        renderedBefore.current = true;
    });
    return null;
}
function TitleCardCamera(): ReactNode {
    return (
        <PerspectiveCamera
            makeDefault
            position={[0, 0, 100]}
            lookAt={[0, 0, 0]}
        />
    );
}

function TitleCard(): ReactNode {
    let titleCardUIRef = useRef<HTMLDivElement>(null!);
    let title3DTextRef = useRef<Mesh>(null!);
    let [titleText, setTitleText] = useState("dbgui");

    const firstRenderCb = () => {
        dbgui()
            .in("Title Text")
            .add(
                "Position",
                $group(
                    ...["x", "y", "z"].map((_c) => {
                        let c: "x" | "y" | "z" = _c as any;
                        return $slider(
                            -100,
                            100,
                            1,
                            () => title3DTextRef.current.position[c],
                        ).onInput((val) => {
                            title3DTextRef.current.position[c] = val;
                        });
                    }),
                ).withDir("column"),
            )
            .add(
                "Value",
                $text(() => titleText).onInput((val) => {
                    setTitleText(val);
                }),
            );
    };

    return (
        <div
            style={{
                width: "100%",
                height: "400px",
                position: "relative",
                overflowX: "hidden",
            }}
        >
            <Canvas
                style={{
                    position: "absolute",
                    background: "rgb(20 20 20)",
                }}
            >
                {
                    <FirstRenderWatcher
                        onFirstRender={() => {
                            titleCardUIRef.current.remove();
                            firstRenderCb();
                        }}
                    />
                }
                <ambientLight intensity={1} />
                <directionalLight
                    position={[0, 100, 0]}
                    lookAt={[0, 0, 0]}
                ></directionalLight>
                <TitleCardCamera />
                <Center position={[0, -2, -100]} key={titleText}>
                    <Text3D
                        size={20}
                        font={recursiveTypeFace as any}
                        ref={title3DTextRef}
                        height={1}
                        bevelEnabled
                        bevelSegments={5}
                        curveSegments={10}
                    >
                        {titleText}
                        <meshStandardMaterial color={0xeeeeee} />
                    </Text3D>
                </Center>
                <gridHelper
                    args={[5000, 100, 0x444444, 0x444444]}
                    position={[0, -90, 0]}
                />
                <TitleCardIcon />
            </Canvas>
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                ref={titleCardUIRef}
            >
                <h1
                    style={{
                        fontFamily: `Recursive, monospace`,
                        fontSize: 58,
                        fontWeight: "800",
                        color: "rgb(155 155 155)",
                        letterSpacing: "1px",
                    }}
                >
                    dbgui
                </h1>
            </div>
        </div>
    );
}
function TitleCardIcon(): ReactNode {
    let iconRef = useRef<Mesh>(null!);
    useEffect(() => {
        dbgui()
            .add(
                "Icon Position",
                $group(
                    ...["x", "y", "z"].map((_c) => {
                        let c: "x" | "y" | "z" = _c as any;
                        return $slider(
                            -100,
                            100,
                            1,
                            () => iconRef.current.position[c],
                        ).onInput((val) => {
                            iconRef.current.position[c] = val;
                        });
                    }),
                ).withDir("column"),
            )
            .add(
                "Icon Rotation",
                $valueDisplay(() => iconRef.current.rotation.toArray().slice(0, 3).map(n => (n as number).toFixed(2))),
            );
    }, []);

    useFrame((_state, delta) => {
        iconRef.current.rotateY(.2 * delta);
        iconRef.current.rotateX(.1 * delta);
    })
    return (
        <mesh
            position={[-50, -20, -20]}
            rotation={[-0.2, 0.6, 0]}
            castShadow
            receiveShadow
            ref={iconRef}
        >
            <RoundedBoxGeometry args={[30, 30, 15]} radius={1} />
            <meshPhysicalMaterial
                map={useLoader(TextureLoader, debugImgUrl)}
                roughness={0.4}
                metalness={0.2}
                map-repeat={[4, 4]}
                map-wrapS={1000}
                map-wrapT={1000}
            />
            <Decal
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                scale={22}
                map={useLoader(TextureLoader, toolImgUrl)}
            />
        </mesh>
    );
}
let exampleCode: { [title: string]: string };
function App() {
    const codeElStyles = {
        background: "#444444",
        color: "#dddddd",
        padding: 5,
        fontSize: 14,
    };
    return (
        <>
            <TitleCard></TitleCard>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <h2
                    style={{
                        fontSize: 32,
                        fontFamily: "Recursive, monospace",
                        padding: 50,
                        fontWeight: 800,
                    }}
                >
                    Works With Any Framework
                </h2>
                <div
                    style={{
                        display: "flex",
                        padding: "0 20svw 5svw 20svw",
                        gap: "10svw",
                        overflowX: "auto",
                        overflowY: "hidden",
                        height: "90svh",
                        width: "100svw",
                        flexWrap: "nowrap",
                    }}
                >
                    {Object.entries(exampleCode).map(([title, code], i) => (
                        <ExampleCard title={title} code={code} key={i} />
                    ))}
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    fontFamily: "Recursive, monospace",
                    height: 400,
                    width: "100%",
                    background: "#bbbbbb",
                    border: "solid #aaaaaa 50px",
                }}
            >
                <h2
                    style={{
                        fontSize: "32px",
                        padding: 10,
                        fontWeight: 800,
                    }}
                >
                    Download Now
                </h2>
                <code
                    style={{
                        ...codeElStyles,
                    }}
                >
                    npm i dbgui
                </code>
                <code
                    style={{
                        ...codeElStyles,
                    }}
                >
                    &lt;script
                    src="https://cdn.jsdelivr.net/npm/dbgui/dist/dbgui.min.js"&gt;&lt;/script&gt;
                </code>
            </div>
        </>
    );
}

function ExampleCard({ title, code }: { title: string; code: string }) {
    let aceEditorRef = useRef<AceEditor>(null!);
    let iframeRef = useRef<HTMLIFrameElement>(null!);

    let onEditorChange = (editorValue: string) => {
        let html = `
        <!doctype HTML>
        <html>
            <head>
                <script defer>
                    import("https://cdn.jsdelivr.net/npm/dbgui@latest/dist/dbgui.min.js").then(async () => {
                        try {
                        ${editorValue}
                        } catch(e) {
                            // add error display mechanism maybe never
                            throw e;
                        }
                    })
                </script>
            </head>
            <body style="min-height:100svh;padding:0;margin:0;display:flex;flex-direction:column;align-items:center;">

            </body>
        </html>
        `;
        iframeRef.current.srcdoc = html;
    };

    useEffect(() => {
        aceEditorRef.current.editor.session.setUseWorker(false);
        onEditorChange(code);
    }, []);
    return (
        <div
            style={{
                width: "60svw",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: "solid black 2px",
                padding: "4px",
                flex: "none",
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    fontFamily: "Recursive, monospace",
                    fontSize: "24px",
                    fontWeight: 800,
                    padding: "12px",
                }}
            >
                {title}
            </h2>
            <iframe
                style={{
                    border: "none",
                    flex: "3",
                }}
                ref={iframeRef}
            ></iframe>
            <AceEditor
                onChange={onEditorChange}
                mode="javascript"
                width="1"
                style={{
                    flex: "2",
                }}
                defaultValue={code}
                theme="github_dark"
                ref={aceEditorRef}
            ></AceEditor>
        </div>
    );
}
exampleCode = {
    "Vanilla DOM": `\
let div = document.createElement("div");
div.style.width = "150px";
div.style.height = "80px";
div.style.background = "beige";
div.style.display = "grid";
div.style.placeItems = "center";
div.textContent = "Hello World!";
document.body.appendChild(div);

dbgui()
    .add(
        "Div Width",
        $slider(100, 400, 1, () => div.offsetWidth)
            .onInput((newWidth) => {
                div.style.width = newWidth + "px";
            })
    )
    .add(
        "Div Text Contents",
        $text(() => div.textContent)
            .onInput((newText) => {
                div.textContent = newText;
            })
    )\
`,
    Canvas: `\
const canvas = document.createElement("canvas");
canvas.style.backgroundColor = "aquamarine";
canvas.width = 200;
canvas.height = 200;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

let circleX = 100;
let circleY = 100;
let circleRadius = 20;
let circleDirection = 1;
function render() {
    ctx.clearRect(0, 0, 200, 200);

    // draw a circle
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

    // move circle back and forth
    if (circleX > 180) {
        circleDirection = -1;
    } else if (circleX < 20) {
        circleDirection = 1;     
    }
    circleX += 2 * circleDirection;
    requestAnimationFrame(render);
}
render();

dbgui()
    .add("Circle X", $slider(0, 200, 1, () => circleX).onInput((val) => circleX = val))
    .add("Circle Y", $slider(0, 200, 1, () => circleY).onInput((val) => circleY = val))
    .add("Circle Radius", $slider(10, 40, 1, () => circleRadius).onInput((val) => circleRadius = val))\
`,
    React: `\
const { createRoot } = await import("https://esm.sh/react-dom@18/client");
const { useRef, useEffect, useState, Component, createElement } = await import("https://esm.sh/react@18");

function Counter() {
    let [count, setCount] = useState(0);

    useEffect(() => {
        dbgui()
            .add("Count", $number(() => count).onInput(setCount));
    }, [count]);

    return createElement(
        "div", 
        null,
        createElement("div", null, count),
        createElement("button", { onClick: () => setCount((count) => count + 1) }, "Add 1")
    );
}
function App() {
    return createElement(
        "div",
        null,
        createElement(Counter)
    )
}
createRoot(document.body).render(createElement(Counter));
`,
};
export default App;
