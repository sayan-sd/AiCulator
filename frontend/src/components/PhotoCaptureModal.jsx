import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, RefreshCw, SwitchCamera } from "lucide-react";

const PhotoCaptureModal = ({ isOpen, onClose, onPhotoCapture }) => {
    const [cameraStream, setCameraStream] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [error, setError] = useState(null);
    const [currentCameraType, setCurrentCameraType] = useState("user");
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    // Clean up camera when component unmounts or modal closes
    useEffect(() => {
        if (isOpen) {
            setError(null);
        } else {
            stopCamera();
        }
        
        return () => {
            stopCamera();
        };
    }, [isOpen]);

    // Make sure video plays when stream is set
    useEffect(() => {
        if (cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
            videoRef.current.play()
                .then(() => {
                    console.log("Video playback started");
                })
                .catch(err => {
                    console.error("Error playing video:", err);
                    setError(`Error playing video: ${err.message}`);
                });
        }
    }, [cameraStream]);

    const startCamera = async () => {
        try {
            setError(null);
            
            // First stop any existing stream
            stopCamera();
            
            try {
                // First attempt: try back/environment camera
                console.log("Attempting to access back camera...");
                const backCameraStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: { exact: "environment" }
                    },
                    audio: false
                });
                
                console.log("Back camera accessed successfully");
                setCameraStream(backCameraStream);
                setCurrentCameraType("environment");
            } catch (backCameraError) {
                // If back camera fails, fall back to front camera
                console.log("Back camera failed, falling back to front camera...");
                const frontCameraStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: { ideal: "user" }
                    },
                    audio: false
                });
                
                console.log("Front camera accessed successfully");
                setCameraStream(frontCameraStream);
                setCurrentCameraType("user");
            }
            
            setIsVideoReady(false);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(`Error accessing camera: ${err.message || "No camera available"}`);
        }
    };

    const switchCamera = () => {
        const newCameraType = currentCameraType === "environment" ? "user" : "environment";
        startCamera(newCameraType);
    };

    const stopCamera = () => {
        if (cameraStream) {
            console.log("Stopping camera stream");
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
            setIsVideoReady(false);
            
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    };

    const handleVideoReady = () => {
        console.log("Video is ready");
        setIsVideoReady(true);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !isVideoReady) {
            setError("Video not ready for capturing. Please wait for camera to initialize.");
            return;
        }
        
        try {
            console.log(`Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
            
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            const photoData = canvas.toDataURL("image/png");
            console.log("Photo captured");
            onPhotoCapture(photoData);
            stopCamera();
            onClose();
        } catch (err) {
            console.error("Error capturing photo:", err);
            setError(`Error capturing photo: ${err.message}`);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    onPhotoCapture(reader.result);
                    onClose();
                };
                reader.onerror = () => {
                    setError("Error reading file");
                };
                reader.readAsDataURL(file);
            } catch (err) {
                console.error("Error uploading file:", err);
                setError(`Error uploading file: ${err.message}`);
            }
        }
    };

    const handleVideoError = (e) => {
        console.error("Video element error:", e);
        setError(`Video error: ${e.target.error ? e.target.error.message : "Unknown error"}`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 text-white p-4 rounded-lg max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        Capture or Upload Photo
                    </h2>
                    <button
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-2 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {cameraStream ? (
                        <div className="relative">
                            <div className="bg-black rounded-lg" style={{ height: "300px" }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={handleVideoReady}
                                    onLoadedData={handleVideoReady}
                                    onError={handleVideoError}
                                    className="w-full h-full rounded-lg"
                                    style={{ objectFit: "contain" }}
                                />
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    onClick={capturePhoto}
                                    disabled={!isVideoReady}
                                    className={`w-full p-2 rounded-lg flex items-center justify-center gap-2 ${
                                        isVideoReady
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : "bg-blue-400 cursor-not-allowed"
                                    }`}
                                >
                                    <Camera size={20} />
                                    {isVideoReady ? "Capture Photo" : "Camera initializing..."}
                                </button>
                                <button
                                    onClick={switchCamera}
                                    className="bg-green-600 hover:bg-green-700 p-2 rounded-lg"
                                    title="Switch Camera"
                                >
                                    <SwitchCamera size={20} />
                                </button>
                                <button
                                    onClick={() => {
                                        stopCamera();
                                        startCamera(); // Restart camera
                                    }}
                                    className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded-lg"
                                    title="Restart Camera"
                                >
                                    <RefreshCw size={20} />
                                </button>
                                <button
                                    onClick={stopCamera}
                                    className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <button
                                onClick={startCamera}
                                className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-lg flex items-center justify-center gap-2"
                            >
                                <Camera size={20} />
                                Start Camera
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <Upload size={20} />
                                    Upload Photo
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Debug info */}
                {/* <div className="mt-4 text-xs text-gray-400">
                    <p>Camera active: {cameraStream ? "Yes" : "No"}</p>
                    <p>Video ready: {isVideoReady ? "Yes" : "No"}</p>
                    <p>Current camera: {currentCameraType === "environment" ? "Back" : "Front"}</p>
                </div> */}
            </div>
        </div>
    );
};

export default PhotoCaptureModal;