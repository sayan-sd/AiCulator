import React, { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";

const PhotoCaptureModal = ({ isOpen, onClose, onPhotoCapture }) => {
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            setCameraStream(stream);
            videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || videoRef.current.videoWidth === 0) {
            console.error("Video not ready for capturing.");
            return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL("image/png");
        onPhotoCapture(photoData);
        stopCamera();
        onClose();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        // console.log(file)
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onPhotoCapture(reader.result);
                onClose();
            };
            reader.readAsDataURL(file);
        }
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

                <div className="space-y-4">
                    {cameraStream ? (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full rounded-lg"
                            />
                            <button
                                onClick={capturePhoto}
                                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-lg flex items-center justify-center gap-2"
                            >
                                <Camera size={20} />
                                Capture Photo
                            </button>
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
            </div>
        </div>
    );
};

export default PhotoCaptureModal;
