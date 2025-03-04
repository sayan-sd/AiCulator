import React, { useEffect, useRef, useState } from "react";
import "../stylesheets/Canvas.css";
import { colors } from "../utils/colorPalette";
import axios from "axios";
import Draggable from "react-draggable";
import { Menu, BrainCircuit, X, Calculator } from "lucide-react";
import PenWidthControl from "../components/PenWidthControl";
import LoadingDots from "../components/LoadingDots";
import { useNavigate } from "react-router-dom";

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
    const [color, setColor] = useState("#ffffff");
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState(GeneratedResult);
    const [dictOfVars, setDictOfVars] = useState({});
    const [latexExpression, setLatexExpression] = useState([]);
    const [latexPossition, setLatexPossition] = useState({ x: 10, y: 200 });
    const draggableRefs = useRef([]);
    const [penWidth, setPenWidth] = useState(3);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // initialize the canvas
    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            canvas.style.background = "black";
            const ctx = canvas.getContext("2d");
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;

                canvas.lineCap = "round";
                ctx.lineWidth = penWidth;
            }
        }
    }, []);

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

    // Add this useEffect hook to set up and remove event listeners
    useEffect(() => {
        // Prevent scrolling when touching the canvas
        document.body.addEventListener("touchmove", preventTouchScroll, {
            passive: false,
        });

        // Clean up the event listener when component unmounts
        return () => {
            document.body.removeEventListener("touchmove", preventTouchScroll);
        };
    }, []);

    // latex expressions
    const renderLatexToCanvas = (expression, answer) => {
        const latex = {
            expression: expression,
            result: answer,
        };
        setLatexExpression([...latexExpression, latex]);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    // send img data to be
    const sendData = async () => {
        setIsLoading(true);
        const canvas = canvasRef.current;
        if (canvas) {
            try {
                const response = await axios({
                    method: "post",
                    url: `${import.meta.env.VITE_API_URL}/calculate`,
                    data: {
                        image: canvas.toDataURL("image/png"),
                        dict_of_vars: dictOfVars,
                    },
                });

                const resp = await response.data;
                // console.log("Response: ", resp);
                resp.forEach((data) => {
                    if (data.assign === true) {
                        setDictOfVars({
                            ...dictOfVars,
                            [data.expr]: data.result,
                        });
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
                        if (
                            imageData.data[(y * canvas.width + x) * 4 + 3] > 0
                        ) {
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
            } catch (error) {
                console.error("Error calculating:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const x = e.nativeEvent.offsetX;
                const y = e.nativeEvent.offsetY;

                // Draw a dot immediately
                drawDot(x, y);

                // Also set up for potential line drawing
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.strokeStyle = color;
                ctx.lineWidth = penWidth;
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const preventTouchScroll = (e) => {
        if (e.target === canvasRef.current) {
            e.preventDefault();
        }
    };

    // Modified drawDot function with increased dot size
    const drawDot = (x, y) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = color;
                ctx.beginPath();
                // Increase the dot size by using a larger multiplier for the radius
                // Using penWidth * 0.75 instead of penWidth / 2
                ctx.arc(x, y, penWidth * 0.75, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

    // Add these functions before the return statement in your Canvas component

    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            // Draw a dot immediately
            drawDot(x, y);

            // Also set up for potential line drawing
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.strokeStyle = color;
                ctx.lineWidth = penWidth;
                setIsDrawing(true);
            }
        }
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        if (!isDrawing) {
            return;
        }
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const offsetX = touch.clientX - rect.left;
            const offsetY = touch.clientY - rect.top;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineWidth = penWidth;
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
            }
        }
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
                ctx.lineWidth = penWidth;
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
            {/* Hamburger Menu Button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="fixed z-10 top-4 left-4 p-2 rounded-md bg-gray-400 text-black cursor-pointer"
            >
                <Menu size={24} />
            </button>

            {/* Reset Button */}
            <button
                onClick={() => setReset(true)}
                className="fixed top-4 z-10 right-4 p-2 rounded-md bg-red-500 font-semibold duration-200 hover:bg-red-600 text-white"
            >
                Reset
            </button>

            {/* Calculate Button */}
            <button
                onClick={sendData}
                className="fixed bottom-4 right-4 p-2 calculate-btn font-semibold z-10 rounded-md min-w-[160px] h-[40px] flex items-center justify-center"
                disabled={isLoading}
            >
                {isLoading ? (
                    <LoadingDots />
                ) : (
                    <div className="flex items-center gap-2">
                        Calculate
                        <BrainCircuit
                            size={20}
                            strokeWidth={2.5}
                            className="calculate-icon"
                        />
                    </div>
                )}
            </button>

            {/* Sidebar Menu */}
            <div
                className={`fixed left-0 top-0 h-full bg-gray-600 shadow-lg transition-transform duration-300 transform z-10 ${
                    isMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="pb-4 w-16 flex flex-col h-full justify-between items-center space-y-4">
                    {/* close button */}
                    <div className="p-4 w-16 flex flex-col items-center space-y-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md bg-gray-400 text-black cursor-pointer"
                        >
                            <X size={24} />
                        </button>

                        {/* Color Palette */}
                        <div className="flex flex-col space-y-2">
                            {colors.map((colorVal) => (
                                <button
                                    key={colorVal}
                                    className={`w-8 h-8 box-border duration-200 rounded-full border-2 ${
                                        color == colorVal
                                            ? "border-gray-900"
                                            : "border-transparent"
                                    }`}
                                    style={{ backgroundColor: colorVal }}
                                    onClick={() => setColor(colorVal)}
                                />
                            ))}
                        </div>

                        <div className="h-1 w-full rounded-full mt-2 bg-white" />

                        {/* width control slider */}
                        <PenWidthControl
                            penWidth={penWidth}
                            setPenWidth={setPenWidth}
                            isMenuOpen={isMenuOpen}
                            selectedColor={color}
                            menuBar={isMenuOpen}
                        />
                    </div>

                    {/* home */}
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 rounded-md bg-gray-400 text-black cursor-pointer"
                    >
                        <Calculator size={24} />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                id="canvas"
                className="canvas -z-50"
                onMouseDown={startDrawing}
                onMouseOut={stopDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                }}
                onTouchMove={(e) => {
                    e.preventDefault();
                    handleTouchMove(e);
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    stopDrawing();
                }}
                onTouchCancel={(e) => {
                    e.preventDefault();
                    stopDrawing();
                }}
            />

            {/* LaTeX Expressions */}
            {latexExpression &&
                latexExpression.map((latex, index) => {
                    // skip if only contains '='
                    if (latex.expression == "") return null;

                    if (!draggableRefs.current[index]) {
                        draggableRefs.current[index] = React.createRef();
                    }
                    return (
                        <Draggable
                            key={index}
                            nodeRef={draggableRefs.current[index]}
                            defaultPosition={latexPossition}
                            // position={undefined}
                            onStop={(e, data) =>
                                setLatexPossition({ x: data.x, y: data.y })
                            }
                        >
                            <div
                                ref={draggableRefs.current[index]}
                                className="latex-expression"
                            >
                                <div className="math-expression">
                                    {latex.expression} =
                                    <span className="result-highlight">
                                        {latex.result}
                                    </span>
                                </div>
                            </div>
                        </Draggable>
                    );
                })}
        </>
    );
};

export default Canvas;
