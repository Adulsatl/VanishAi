import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon, Upload, Trash2, Wand2, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  };

  const handleRemoveBackground = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image_file', originalFile);

      const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
        headers: {
          'X-Api-Key': 'your api', //add your api
        },
        responseType: 'arraybuffer'
      });

      const blob = new Blob([response.data], { type: 'image/png' });
      const base64data = await convertBlobToBase64(blob);
      setProcessedImage(base64data);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Error removing background:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setImage(null);
    setProcessedImage(null);
    setError(null);
    setOriginalFile(null);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Sparkles className="w-8 h-8 text-white" />
              <h1 className="text-5xl font-bold text-white">
                Vanish AI
              </h1>
            </motion.div>
            <p className="text-xl text-white/90">
              Transform your images instantly with our AI-powered background removal
            </p>
          </div>

          {/* Main Content */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-2xl shadow-2xl p-8"
          >
            <AnimatePresence mode="wait">
              {!image ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
                    ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-white/50'}`}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    animate={{ y: isDragActive ? -10 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-xl text-gray-600 mb-2">
                      {isDragActive
                        ? "Drop your image here"
                        : "Drag & drop an image here, or click to select"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PNG, JPG or JPEG (max. 10MB)
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Image */}
                    <motion.div 
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Original Image
                      </h3>
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover-scale">
                        <img
                          src={image}
                          alt="Original"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </motion.div>

                    {/* Processed Image */}
                    <motion.div 
                      initial={{ x: 20 }}
                      animate={{ x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Wand2 className="w-5 h-5" />
                        Processed Image
                      </h3>
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-[url('/checkerboard.png')] bg-repeat hover-scale">
                        {processedImage ? (
                          <img
                            src={processedImage}
                            alt="Processed"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            {isProcessing ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="flex flex-col items-center gap-3"
                              >
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
                                <p>Processing...</p>
                              </motion.div>
                            ) : (
                              <p>Click process to remove background</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-center py-2 bg-red-50 rounded-lg"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRemoveBackground}
                      disabled={isProcessing || !!processedImage}
                      className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors
                        ${isProcessing || processedImage
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                      <Wand2 className="w-5 h-5" />
                      {isProcessing ? 'Processing...' : 'Remove Background'}
                    </motion.button>
                    
                    <AnimatePresence>
                      {processedImage && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDownload}
                          className="px-6 py-3 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Reset
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Lightning Fast',
                description: 'Remove backgrounds in seconds with our advanced AI technology'
              },
              {
                title: 'Professional Quality',
                description: 'Get pixel-perfect results with precise edge detection'
              },
              {
                title: 'User Friendly',
                description: 'Simple drag and drop interface for seamless editing'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center p-6 glass-effect rounded-xl hover-scale"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
