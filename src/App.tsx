import { useState } from "react";
import recursiveFontUrl from "./assets/Recursive.ttf";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, Text } from "@react-three/drei";

const recursiveFont = new FontFace("Recursive", `url(${recursiveFontUrl})`);
document.fonts.add(recursiveFont);
recursiveFont.load();

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <div
                className="title-card"
                style={{
                    width: "100%",
                    height: "400px",
                }}
            >
                <Canvas
                    style={{
                        position: "absolute",
                    }}
                >
                    <OrthographicCamera makeDefault position={[0,0,10]} lookAt={[0, 0,0]}>

                    </OrthographicCamera>
                    <mesh>
                        <Text
                            fontSize={60}
                            font={recursiveFontUrl}
                            fontWeight={600}
                            color="black"
                            anchorX="center"
                            anchorY="middle"
                            characters="DBGUI"
                        >
                            dbgui
                        </Text>
                    </mesh>
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
                        fontSize: 60,
                        fontWeight: "600"
                    }}
                >
                    <h1
                        style={{
                            fontFamily: `Recursive, monospace`,
                        }}
                    >
                        dbgui
                    </h1>
                </div>
            </div>
        </>
    );
}

export default App;
