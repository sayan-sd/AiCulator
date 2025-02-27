import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

const PenWidthControl = ({
    penWidth,
    setPenWidth,
    isMenuOpen,
    selectedColor,
    menuBar,
}) => {
    const [showSlider, setShowSlider] = useState(false);

    useEffect(() => {
        if (menuBar==false) {
            setShowSlider(false);
        }
    }, [menuBar]);

    return (
        <div className="relative mt-2">
            {/* Circular Pen Width Button */}
            <button
                onClick={() => setShowSlider(!showSlider)}
                className="w-8 h-8 rounded-full bg-gray-400 border-2 border-gray-900 flex items-center justify-center relative overflow-hidden"
            >
                <Pencil size={16} className="text-gray-900 z-50" />
                <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                        height: `${(penWidth / 6) * 100}%`,
                        backgroundColor: selectedColor,
                    }}
                />
            </button>

            {/* Slider Panel */}
            {showSlider && isMenuOpen && (
                <div
                    className="absolute transform rotate-90 origin-left bg-gray-600 left-24 -top-16 p-3 rounded-md shadow-lg flex items-center gap-3"
                    style={{
                        width: "150px",
                    }}
                >
                    <span className="transform -rotate-90 font-medium text-white">
                        {penWidth}
                    </span>
                    <input
                        type="range"
                        min="1"
                        max="6"
                        value={penWidth}
                        onChange={(e) => setPenWidth(Number(e.target.value))}
                        className="slider w-full rotate-180"
                    />
                </div>
            )}
        </div>
    );
};

export default PenWidthControl;
