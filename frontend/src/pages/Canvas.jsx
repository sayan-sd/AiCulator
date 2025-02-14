import React, { useEffect, useRef, useState } from "react";
import "../stylesheets/Canvas.css";
import { colors } from "../utils/colorPalette";
import axios from "axios";
import Draggable from "react-draggable";

let response = {
    expr: "",
    result: "",
    assign: false,
};

let GeneratedResult = {
    expression: "",
    answer: "",
};

const Canvas = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("rgb(255,255,255)");
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState(GeneratedResult);
    const [dictOfVars, setDictOfVars] = useState({});
    const [latexExpression, setLatexExpression] = useState([]);
    const [latexPossition, setLatexPossition] = useState({ x: 10, y: 200 });
    const draggableRefs = useRef([]);

    // initialize the canvas
    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;

                canvas.lineCap = "round";
                canvas.lineWidth = 3;
            }
        }

        // add mathjax cdn
        // const script = document.createElement("script");
        // script.src =
        //     "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/config/TeX-MML-AM_CHTML.js";
        // script.async = true;
        // document.head.appendChild(script);

        // script.onload = () => {
        //     window.MathJax.Hub.Config({
        //         tex2jax: {
        //             inlineMath: [
        //                 ["$", "$"],
        //                 ["\\(", "\\)"],
        //             ],
        //         },
        //     });
        // };

        // return () => {
        //     document.head.removeChild(script);
        // };
    }, []);

    const renderLatexToCanvas = (expression, answer) => {
        const latex = `${expression} = ${answer}`;
        setLatexExpression([...latexExpression, latex]);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    // reset the canvas
    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    //
    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0);
        }
    }, [latexExpression]);

    // latex expressions
    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result]);

    // send img data to be
    const sendData = async () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const response = await axios({
                method: "post",
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL("image/png"),
                    dict_of_vars: dictOfVars,
                },
            });

            const resp = await response.data;
            console.log("Response: ", resp);
            resp.forEach((data) => {
                if (data.assign === true) {
                    setDictOfVars({ ...dictOfVars, [data.expr]: data.result });
                }
            });

            const ctx = canvas.getContext("2d");
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            let minX = canvas.width;
            let minY = canvas.height;
            let maxX = 0;
            let maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    if (imageData.data[(y * canvas.width + x) * 4 + 3] > 0) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            setLatexPossition({ x: centerX, y: centerY });

            resp.forEach((data) => {
                setTimeout(() => {
                    setResult({
                        expression: data.expr,
                        answer: data.result,
                    });
                }, 200);
            });
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = "black";
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // method for actual drawing
    const draw = (e) => {
        if (!isDrawing) {
            return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    return (
        <>
            <div className="CTABtns">
                <button className="btn" onClick={() => setReset(true)}>
                    Reset
                </button>
                <div className="color-palette">
                    {colors.map((color) => (
                        <button
                            key={color}
                            className="color-btn"
                            style={{ backgroundColor: color }}
                            onClick={() => setColor(color)}
                        />
                    ))}
                </div>
                <button className="btn" onClick={sendData}>
                    Calculate
                </button>
            </div>

            <canvas
                ref={canvasRef}
                id="canvas"
                className="canvas"
                onMouseDown={startDrawing}
                onMouseOut={stopDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
            />

            {latexExpression &&
                latexExpression.map((latex, index) => {
                    // Ensure a ref exists for this index
                    if (!draggableRefs.current[index]) {
                        draggableRefs.current[index] = React.createRef();
                    }
                    return (
                        <Draggable
                            key={index}
                            nodeRef={draggableRefs.current[index]}
                            defaultPosition={latexPossition}
                            onStop={(e, data) =>
                                setLatexPossition({ x: data.x, y: data.y })
                            }
                        >
                            <div
                                ref={draggableRefs.current[index]}
                                className="latex-expression"
                            >
                                <div className="math-expression">{latex}</div>
                            </div>
                        </Draggable>
                    );
                })}
        </>
    );
};

export default Canvas;
