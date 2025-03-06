import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, X } from "lucide-react";

const PhotoCaptureModal = ({ isOpen, onClose, onPhotoCapture }) => {
    const [cameraStream, setCameraStream] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    // clean up camera when component unmounts or modal closes
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

    // video plays when stream is set
    useEffect(() => {
        if (cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
            videoRef.current
                .play()
                .then(() => {
                    // console.log("Video playback started");
                })
                .catch((err) => {
                    console.error("Error playing video:", err);
                    setError(`Error playing video: ${err.message}`);
                });
        }
    }, [cameraStream]);

    // start the camera
    const startCamera = async () => {
        try {
            setError(null);

            // stop any existing stream at the beginning
            stopCamera();

            // try to access back camera first
            try {
                const backCameraStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: { exact: "environment" },
                        },
                        audio: false,
                    });

                setCameraStream(backCameraStream);
                setIsVideoReady(false);
                return;
            } catch (backCameraError) {
                // if back camera fails, fall back to front camera
                const frontCameraStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: { ideal: "user" },
                        },
                        audio: false,
                    });

                setCameraStream(frontCameraStream);
                setIsVideoReady(false);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(
                `Error accessing camera: ${
                    err.message || "No camera available"
                }`
            );
        }
    };

    // stop the camera and release resources
    const stopCamera = () => {
        if (cameraStream) {
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

    // capture photo and send image file
    const capturePhoto = () => {
        if (!videoRef.current || !isVideoReady) {
            setError(
                "Video not ready for capturing. Please wait for camera to initialize."
            );
            return;
        }

        try {
            const canvas = document.createElement("canvas");
            const videoElement = videoRef.current;

            // Match the aspect ratio of the modal
            canvas.width = 1280;
            canvas.height = 720;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(
                videoElement,   // source: live video feed
                0,
                0,
                videoElement.videoWidth,
                videoElement.videoHeight,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const photoData = canvas.toDataURL("image/png");
            // console.log("Photo captured");
            onPhotoCapture(photoData);
            stopCamera();
            onClose();
        } catch (err) {
            console.error("Error capturing photo:", err);
            setError(`Error capturing photo: ${err.message}`);
        }
    };

    // when user upload image file
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    // sending the uploaded image file
                    onPhotoCapture(reader.result);
                    onClose(); // close the photo mode
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
        setError(
            `Video error: ${
                e.target.error ? e.target.error.message : "Unknown error"
            }`
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E2433] rounded-xl w-full max-w-[480px] shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h2 className="text-white text-lg font-semibold">
                        Capture or Upload Photo
                    </h2>
                    <button
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="text-white/50 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4">
                    {cameraStream ? (
                        <div className="space-y-4">
                            <div
                                className="bg-black rounded-lg overflow-hidden"
                                style={{ aspectRatio: "16/9" }}
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={handleVideoReady}
                                    onLoadedData={handleVideoReady}
                                    onError={handleVideoError}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={capturePhoto}
                                    disabled={!isVideoReady}
                                    className={`flex-1 py-3 rounded-lg text-white flex items-center justify-center space-x-2 ${
                                        isVideoReady
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : "bg-blue-400 cursor-not-allowed"
                                    }`}
                                >
                                    <Camera size={20} />
                                    <span>
                                        {isVideoReady
                                            ? "Capture Photo"
                                            : "Camera initializing..."}
                                    </span>
                                </button>
                                <button
                                    onClick={stopCamera}
                                    className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <button
                                onClick={startCamera}
                                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white flex items-center justify-center space-x-2"
                            >
                                <Camera size={20} />
                                <span>Start Camera</span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-lg text-white flex items-center justify-center space-x-2"
                                >
                                    <Upload size={20} />
                                    <span>Upload Photo</span>
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
            </div>
        </div>
    );
};

export default PhotoCaptureModal;
