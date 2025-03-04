import React, { useState, useEffect } from "react";
import {
    Camera,
    Pencil,
    Plus,
    Minus,
    X as Multiply,
    Divide,
    Equal,
    Delete,
    RefreshCcw,
    Percent,
    Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { evaluate } from "mathjs";
import axios from "axios";
import PhotoCaptureModal from "../components/PhotoCaptureModal";

const CalculatorPage = () => {
    const navigate = useNavigate();
    const [displayValue, setDisplayValue] = useState("0");
    const [equation, setEquation] = useState("");
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [showKeyboardInfo, setShowKeyboardInfo] = useState(false);

    // Add keyboard event listener
    useEffect(() => {
        const handleKeyDown = (event) => {
            event.preventDefault();

            const key = event.key;

            // Handle numeric keys (0-9)
            if (/^[0-9]$/.test(key)) {
                inputDigit(parseInt(key, 10));
                return;
            }

            // Handle decimal point
            if (key === ".") {
                inputDot();
                return;
            }

            // Handle operations
            switch (key) {
                case "+":
                    performOperation("add");
                    break;
                case "-":
                    performOperation("subtract");
                    break;
                case "*":
                    performOperation("multiply");
                    break;
                case "/":
                    performOperation("divide");
                    break;
                case "%":
                    calculatePercentage();
                    break;
                case "Enter":
                case "=":
                    calculateResult();
                    break;
                case "Escape":
                case "c":
                case "C":
                    clearDisplay();
                    break;
                case "Backspace":
                    handleBackspace();
                    break;
                case "!":
                    calculateFactorial();
                    break;
                case "s":
                case "S":
                    calculateSquare();
                    break;
                case "q":
                case "Q":
                    calculateQube();
                    break;
                case "r":
                case "R":
                    calculateSquareRoot();
                    break;
                case "l":
                case "L":
                    calculateLog();
                    break;
                default:
                    break;
            }
        };

        // Add event listener when component mounts
        window.addEventListener("keydown", handleKeyDown);

        // Remove event listener when component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [equation, displayValue, waitingForOperand]); // Dependencies for the useEffect

    const inputDigit = (digit) => {
        if (waitingForOperand) {
            setDisplayValue(String(digit));
            setEquation(equation + String(digit));
            setWaitingForOperand(false);
        } else {
            setDisplayValue(
                displayValue === "0" ? String(digit) : displayValue + digit
            );
            setEquation(equation + String(digit));
        }
        setDisplayValue("0");
    };

    const inputDot = () => {
        if (waitingForOperand) {
            // setDisplayValue("0.");
            setEquation(equation + "0.");
            setWaitingForOperand(false);
            return;
        }
        if (!displayValue.includes(".")) {
            setDisplayValue(displayValue + ".");
            setEquation(equation + ".");
        }
        setDisplayValue("0");
    };

    const clearDisplay = () => {
        setDisplayValue("0");
        setEquation("");
        setWaitingForOperand(false);
    };

    const evaluatePendingExpression = () => {
        try {
            // trailing operators
            let expr = equation;
            if (["+", "-", "*", "/"].includes(expr.slice(-1))) {
                expr = expr.slice(0, -1);
            }

            if (!expr) return displayValue;

            return evaluate(expr);
        } catch (error) {
            setDisplayValue("Error");
            return displayValue;
        }
    };

    const calculateSquare = () => {
        try {
            // calculate any pending expression
            const valueToSquare = evaluatePendingExpression();

            const value = parseFloat(valueToSquare);
            const result = value * value;
            setDisplayValue(String(result));
            setEquation("");
            setWaitingForOperand(true);
        } catch (error) {
            setDisplayValue("Error");
        }
    };

    const calculateQube = () => {
        try {
            // calculate any pending expression
            const valueToCube = evaluatePendingExpression();

            const value = parseFloat(valueToCube);
            const result = value * value * value;
            setDisplayValue(String(result));
            setEquation("");
            setWaitingForOperand(true);
        } catch (error) {
            setDisplayValue("Error");
        }
    };

    const calculateSquareRoot = () => {
        try {
            // calculate any pending expression
            const valueToRoot = evaluatePendingExpression();

            const value = parseFloat(valueToRoot);
            if (value < 0)
                throw new Error(
                    "Cannot calculate square root of negative number"
                );

            const result = Math.sqrt(value);
            setDisplayValue(String(result));
            setEquation("");
            setWaitingForOperand(true);
        } catch (error) {
            setDisplayValue("Error");
            setEquation("");
        }
    };

    const calculateFactorial = () => {
        try {
            // First calculate any pending expression
            const valueForFactorial = evaluatePendingExpression();

            const value = parseInt(valueForFactorial);
            if (value < 0 || !Number.isInteger(value))
                throw new Error(
                    "Cannot calculate factorial of negative or non-integer number"
                );

            let result = 1;
            for (let i = 2; i <= value; i++) result *= i;

            setDisplayValue(String(result));
            setEquation("");
            setWaitingForOperand(true);
        } catch (error) {
            setDisplayValue("Error");
            setEquation("");
        }
    };

    const calculateLog = () => {
        try {
            // First calculate any pending expression
            const valueForLog = evaluatePendingExpression();

            const value = parseFloat(valueForLog);
            if (value <= 0)
                throw new Error(
                    "Cannot calculate logarithm of non-positive number"
                );

            const result = Math.log10(value);
            setDisplayValue(String(result));
            setEquation("");
            setWaitingForOperand(true);
        } catch (error) {
            setDisplayValue("Error");
            setEquation("");
        }
    };

    const calculatePercentage = () => {
        try {
            // First calculate any pending expression
            const valueForPercentage = evaluatePendingExpression();

            const value = parseFloat(valueForPercentage);
            const result = value / 100;

            setDisplayValue(String(result));
            setEquation("");
            setWaitingForOperand(true);
        } catch (error) {
            setDisplayValue("Error");
            setEquation("");
        }
    };

    const performOperation = (op) => {
        const operators = {
            add: "+",
            subtract: "-",
            multiply: "*",
            divide: "/",
        };

        // Handle consecutive operators
        const lastChar = equation.slice(-1);
        if (["+", "-", "*", "/"].includes(lastChar)) {
            setEquation(equation.slice(0, -1) + operators[op]);
        } else {
            setEquation(equation + operators[op]);
        }
        setWaitingForOperand(true);
    };

    const calculateResult = () => {
        try {
            let expr = equation;

            // Handle trailing operators
            if (["+", "-", "*", "/"].includes(expr.slice(-1))) {
                expr = expr.slice(0, -1);
            }

            if (!expr) return;

            const result = evaluate(expr);
            setDisplayValue(String(result));
            setEquation("");
            setWaitingForOperand(true);
        } catch (error) {
            setDisplayValue("Error");
            setEquation("");
        }
    };

    const handleBackspace = () => {
        if (waitingForOperand) return;

        const newDisplay = displayValue.slice(0, -1) || "0";
        setDisplayValue(newDisplay);
        setEquation(equation.slice(0, -1));
    };

    const handlePhotoCapture = async (photoData) => {
        try {
            setDisplayValue("Processing...");

            const response = await axios({
                method: "post",
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: photoData,
                    dict_of_vars: {}, // Pass empty object if no variables are stored
                },
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const results = response.data;
            if (results && results.length > 0) {
                const firstResult = results[0];
                setDisplayValue(firstResult.result.toString());
                if (firstResult.expr) {
                    setEquation(firstResult.expr);
                }
            } else {
                setDisplayValue("No result");
            }
        } catch (error) {
            console.error("Error processing photo:", error);
            setDisplayValue("Error");
            setEquation("");
        }
    };

    return (
        <div className="min-h-screen h-full w-full bg-black p-4 flex flex-col">
            {/* Display */}
            <div className="bg-gray-900 p-4 rounded-xl mb-4 flex-none">
                {/* Keyboard Shortcuts Info */}
                <div className="relative">
                    <button
                        onClick={() => setShowKeyboardInfo(!showKeyboardInfo)}
                        className="absolute -top-1 -left-1 text-gray-400 hover:text-white z-10"
                        aria-label="Keyboard shortcuts"
                    >
                        <Info className="h-5 w-5" />
                    </button>

                    {showKeyboardInfo && (
                        <div className="absolute top-8 left-0 bg-gray-800 p-3 rounded-lg shadow-lg z-20 w-64 text-sm text-gray-300 border border-gray-700">
                            <div className="flex justify-between mb-2">
                                <p className="font-medium">
                                    Keyboard shortcuts
                                </p>
                                <button
                                    onClick={() => setShowKeyboardInfo(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <Multiply className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-y-1 text-xs">
                                <div>0-9: Numbers</div>
                                <div>+, -, *, /: Operations</div>
                                <div>Enter, =: Calculate</div>
                                <div>.: Decimal point</div>
                                <div>Backspace: Delete</div>
                                <div>Esc, c: Clear</div>
                                <div>s: Square (x²)</div>
                                <div>q: Cube (x³)</div>
                                <div>r: Square root (√)</div>
                                <div>!: Factorial</div>
                                <div>l: Logarithm</div>
                                <div>%: Percent</div>
                            </div>
                        </div>
                    )}
                </div>

                
                <div className="text-gray-400 text-right text-sm sm:text-lg h-4 sm:h-6 font-mono truncate">
                    {equation}
                </div>
                <div className="text-right text-white text-3xl sm:text-4xl md:text-5xl font-mono truncate mt-1 sm:mt-2">
                    {displayValue}
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-5 gap-2 flex-1">
                {/* Row 1 */}
                <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors flex flex-col items-center justify-center"
                >
                    <Camera className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-xs mt-1">Photo</span>
                </button>
                <button
                    onClick={() => navigate("/canvas")}
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors flex flex-col items-center justify-center"
                >
                    <Pencil className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-xs mt-1">Draw</span>
                </button>
                <button
                    onClick={calculatePercentage}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Percent className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={calculateSquare}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors text-xl md:text-2xl"
                >
                    x²
                </button>
                <button
                    onClick={calculateSquareRoot}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors text-xl md:text-2xl"
                >
                    √
                </button>

                {/* Row 2 */}
                <button
                    onClick={clearDisplay}
                    className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                >
                    <RefreshCcw className="h-5 w-5 md:h-6 md:w-6" />
                    {/* <span className="text-sm">C</span> */}
                </button>
                <button
                    onClick={calculateLog}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    log
                </button>
                <button
                    onClick={handleBackspace}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors"
                >
                    <Delete className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={calculateQube}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors text-xl md:text-2xl"
                >
                    x<sup>3</sup>
                </button>
                <button
                    onClick={calculateFactorial}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors text-xl md:text-2xl"
                >
                    x!
                </button>

                {/* Row 3 */}
                <button
                    onClick={() => inputDigit(7)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    7
                </button>
                <button
                    onClick={() => inputDigit(8)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    8
                </button>
                <button
                    onClick={() => inputDigit(9)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    9
                </button>
                <button
                    onClick={() => performOperation("subtract")}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Minus className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={() => performOperation("add")}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors row-span-2"
                >
                    <Plus className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>

                {/* Row 4 */}
                <button
                    onClick={() => inputDigit(4)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    4
                </button>
                <button
                    onClick={() => inputDigit(5)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    5
                </button>
                <button
                    onClick={() => inputDigit(6)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    6
                </button>
                <button
                    onClick={() => performOperation("multiply")}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Multiply className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>

                {/* Row 5 */}
                <button
                    onClick={() => inputDigit(1)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    1
                </button>
                <button
                    onClick={() => inputDigit(2)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    2
                </button>
                <button
                    onClick={() => inputDigit(3)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    3
                </button>

                <button
                    onClick={() => performOperation("divide")}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Divide className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>

                <button
                    onClick={calculateResult}
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors row-span-2"
                >
                    <Equal className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>

                {/* Row 6 */}
                <button
                    onClick={() => inputDigit(0)}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl col-span-2"
                >
                    0
                </button>
                <button
                    onClick={inputDot}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                >
                    .
                </button>
            </div>

            <PhotoCaptureModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onPhotoCapture={handlePhotoCapture}
            />
        </div>
    );
};

export default CalculatorPage;
