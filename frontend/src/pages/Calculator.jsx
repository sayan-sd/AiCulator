import React, { useState } from "react";
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
    Square,
    RotateCcw,
    PlusSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CalculatorPage = () => {
    const navigate = useNavigate();
    const [displayValue, setDisplayValue] = useState("0");
    const [equation, setEquation] = useState("");
    const [storedValue, setStoredValue] = useState(null);
    const [operator, setOperator] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const clearDisplay = () => {
        setDisplayValue("0");
        setEquation("");
        setStoredValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };

    const inputDigit = (digit) => {
        if (waitingForOperand) {
            setDisplayValue(String(digit));
            setWaitingForOperand(false);
        } else {
            setDisplayValue(
                displayValue === "0" ? String(digit) : displayValue + digit
            );
        }
    };

    const inputDot = () => {
        if (waitingForOperand) {
            setDisplayValue("0.");
            setWaitingForOperand(false);
        } else if (!displayValue.includes(".")) {
            setDisplayValue(displayValue + ".");
        }
    };

    const getOperatorSymbol = (op) => {
        switch (op) {
            case "add":
                return "+";
            case "subtract":
                return "-";
            case "multiply":
                return "×";
            case "divide":
                return "÷";
            default:
                return "";
        }
    };

    const performOperation = (nextOperator) => {
        const inputValue = parseFloat(displayValue);
        const operatorSymbol = getOperatorSymbol(nextOperator);

        if (storedValue === null) {
            setEquation(`${displayValue} ${operatorSymbol} `);
            setStoredValue(inputValue);
        } else if (operator) {
            const result = calculate(storedValue, inputValue, operator);
            setStoredValue(result);
            setEquation(`${equation}${displayValue} ${operatorSymbol} `);
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    const calculate = (firstValue, secondValue, op) => {
        switch (op) {
            case "add":
                return firstValue + secondValue;
            case "subtract":
                return firstValue - secondValue;
            case "multiply":
                return firstValue * secondValue;
            case "divide":
                return firstValue / secondValue;
            default:
                return secondValue;
        }
    };

    const calculateResult = () => {
        if (operator && storedValue !== null) {
            const inputValue = parseFloat(displayValue);
            const result = calculate(storedValue, inputValue, operator);
            setEquation(`${equation}${displayValue} = ${result}`);
            setDisplayValue(String(result));
            setStoredValue(null);
            setOperator(null);
            setWaitingForOperand(true);
        }
    };

    const calculatePercentage = () => {
        const value = parseFloat(displayValue);
        const result = value / 100;
        setDisplayValue(String(result));
        setEquation(`${value}% = ${result}`);
    };

    const calculateSquare = () => {
        const value = parseFloat(displayValue);
        const result = value * value;
        setDisplayValue(String(result));
        setEquation(`${value}² = ${result}`);
    };

    const calculateSquareRoot = () => {
        const value = parseFloat(displayValue);
        const result = Math.sqrt(value);
        setDisplayValue(String(result));
        setEquation(`√${value} = ${result}`);
    };

    const toggleSign = () => {
        const value = parseFloat(displayValue);
        setDisplayValue(String(-value));
    };

    return (
        <div className="min-h-screen h-full w-full bg-black p-4 flex flex-col">
            {/* Display */}
            <div className="bg-gray-900 p-4 rounded-xl mb-4 flex-none">
                <div className="text-gray-400 text-right text-lg h-6 font-mono truncate">
                    {equation}
                </div>
                <div className="text-right text-white text-5xl font-mono truncate mt-2">
                    {displayValue}
                </div>
            </div>

            {/* Calculator Grid */}
            <div className="grid grid-cols-5 gap-2 flex-1">
                {/* Special Mode Buttons */}
                <button
                    onClick={() => navigate("/photo")}
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

                {/* Additional Functions */}
                <button
                    onClick={calculatePercentage}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Percent className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={calculateSquare}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Square className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={calculateSquareRoot}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <PlusSquare className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>

                {/* Rest of the buttons */}
                <button
                    onClick={clearDisplay}
                    className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                >
                    <RefreshCcw className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-sm">C</span>
                </button>
                <button
                    onClick={toggleSign}
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors"
                >
                    <RotateCcw className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={() =>
                        setDisplayValue(displayValue.slice(0, -1) || "0")
                    }
                    className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors"
                >
                    <Delete className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={() => performOperation("divide")}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Divide className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={() => performOperation("multiply")}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Multiply className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>

                {/* Numbers and Operations */}
                {[7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => inputDigit(num)}
                        className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={() => performOperation("subtract")}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors"
                >
                    <Minus className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>
                <button
                    onClick={() => performOperation("add")}
                    className="bg-gray-600 text-white p-2 rounded-xl hover:bg-gray-500 transition-colors row-span-2 h-full"
                >
                    <Plus className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>

                {[4, 5, 6].map((num) => (
                    <button
                        key={num}
                        onClick={() => inputDigit(num)}
                        className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={calculateResult}
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors row-span-2 h-full"
                >
                    <Equal className="h-5 w-5 md:h-6 md:w-6 mx-auto" />
                </button>

                {[1, 2, 3].map((num) => (
                    <button
                        key={num}
                        onClick={() => inputDigit(num)}
                        className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors text-xl md:text-2xl"
                    >
                        {num}
                    </button>
                ))}

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
        </div>
    );
};

export default CalculatorPage;