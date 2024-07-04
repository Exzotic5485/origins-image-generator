import { useEffect, useRef } from "react";
import { OriginRenderer } from "./lib/OriginRenderer";

function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        window.onload = async () => {
            const canvas = canvasRef.current!;

            if (!canvas) throw new Error("Canvas not found");

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;

            const renderer = new OriginRenderer(canvas, {
                name: "Avian",
                impact: "low",
                description:
                    "The Avian race has lost their ability to fly a long time ago. Now these peaceful creatures can be seen gliding from one place to another.",
                powers: [
                    {
                        name: "Featherweight",
                        description:
                            "You fall as gently to the ground as a feather would, unless you sneak.",
                    },
                    {
                        name: "Featherweight",
                        description:
                            "You fall as gently to the ground as a feather would, unless you sneak.",
                    },
                    {
                        name: "Featherweight",
                        description:
                            "You fall as gently to the ground as a feather would, unless you sneak.",
                    },
                    {
                        name: "Featherweight",
                        description:
                            "You fall as gently to the ground as a feather would, unless you sneak.",
                    },
                    {
                        name: "Featherweight",
                        description:
                            "You fall as gently to the ground as a feather would, unless you sneak.",
                    }
                ],
            });

            await renderer.render();
        };
    }, []);

    return <canvas ref={canvasRef} />;
}

export default App;
