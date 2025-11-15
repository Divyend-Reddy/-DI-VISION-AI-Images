
import React, { useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateImages, editImage, GenerationResult } from '../services/geminiService';
import { DownloadIcon, UploadIcon } from '../components/Icons';

const stylePresets = [
  { id: 'none', name: 'None', promptSuffix: '', imageUrl: 'https://picsum.photos/seed/style-none/200/200' },
  { id: 'realistic', name: 'Realistic', promptSuffix: 'photorealistic, 8k, detailed, high quality, sharp focus, professional', imageUrl: 'https://picsum.photos/seed/style-realistic/200/200' },
  { id: '3d-art', name: '3D Art', promptSuffix: '3d render, octane render, cinematic lighting, trending on artstation, hyperrealistic', imageUrl: 'https://picsum.photos/seed/style-3d/200/200' },
  { id: 'anime', name: 'Anime', promptSuffix: 'anime style, key visual, beautiful, intricate detail, by studio ghibli and makoto shinkai', imageUrl: 'https://picsum.photos/seed/style-anime/200/200' },
  { id: 'digital-painting', name: 'Digital Painting', promptSuffix: 'digital painting, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski', imageUrl: 'https://picsum.photos/seed/style-painting/200/200' },
];

type Mode = 'generate' | 'edit';

const GeneratorPage: React.FC = () => {
    const { user, deductCredits, setPage } = useAppContext();
    const [mode, setMode] = useState<Mode>('generate');
    const [prompt, setPrompt] = useState('');
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [selectedStyle, setSelectedStyle] = useState<string>('none');
    
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [imageFileInfo, setImageFileInfo] = useState<{ base64: string; mimeType: string } | null>(null);

    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    
    const switchMode = (newMode: Mode) => {
        setMode(newMode);
        setPrompt('');
        setError(null);
        setInfoMessage(null);
        setGeneratedImages([]);
        setInputImage(null);
        setImageFileInfo(null);
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setInputImage(dataUrl);
                const [header, base64Data] = dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1];
                if (base64Data && mimeType) {
                    setImageFileInfo({ base64: base64Data, mimeType });
                    setError(null);
                } else {
                    setError("Invalid file format. Please upload a valid image.");
                    setInputImage(null);
                    setImageFileInfo(null);
                }
            };
            reader.onerror = () => setError("Failed to read the image file.");
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        if (!user) {
            setError('You must be logged in to generate images.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setInfoMessage(null);
        setGeneratedImages([]);

        const process = async (cost: number, action: () => Promise<any>) => {
            if (user.credits < cost && !user.isAdmin) {
                setError('Insufficient credits.');
                setIsLoading(false);
                return;
            }
            try {
                if(!deductCredits(cost)) {
                    setError('Transaction failed. Please check your credits.');
                    return;
                }
                await action();
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        if (mode === 'generate') {
            const creditCost = 5 * numberOfImages;
            const selectedPreset = stylePresets.find(p => p.id === selectedStyle);
            const finalPrompt = selectedPreset && selectedPreset.id !== 'none'
                ? `${prompt.trim()}, ${selectedPreset.promptSuffix}`
                : prompt.trim();
            
            await process(creditCost, async () => {
                const result: GenerationResult = await generateImages(finalPrompt, numberOfImages);
                setGeneratedImages(result.images);
                setInfoMessage(result.blockedMessage);
            });
        } else { // mode === 'edit'
            if (!imageFileInfo) {
                setError('Please upload an image to edit.');
                setIsLoading(false);
                return;
            }
            await process(5, async () => {
                const editedImage = await editImage(prompt.trim(), imageFileInfo.base64, imageFileInfo.mimeType);
                setGeneratedImages([editedImage]);
            });
        }
    }, [prompt, numberOfImages, user, deductCredits, selectedStyle, mode, imageFileInfo]);

    const handleDownload = (imageUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        const downloadName = mode === 'edit' ? 'di-vision-edited.png' : `di-vision-image-${index + 1}.png`;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderGenerateMode = () => (
      <>
        <div className="space-y-2">
            <label className="block text-sm font-medium">Choose a Style</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {stylePresets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => setSelectedStyle(preset.id)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-card dark:focus:ring-offset-dark-card focus:ring-primary ${selectedStyle === preset.id ? 'border-primary scale-105' : 'border-transparent hover:border-gray-400 dark:hover:border-gray-600'}`}
                        aria-pressed={selectedStyle === preset.id}
                        disabled={isLoading}
                    >
                        <img src={preset.imageUrl} alt={preset.name} className="w-full h-16 object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-1">
                            <span className="text-white font-semibold text-xs text-center">{preset.name}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="w-full sm:w-auto">
                <label htmlFor="num-images" className="block mb-1 text-sm font-medium">Number of Images (5 credits each)</label>
                <select id="num-images" value={numberOfImages} onChange={(e) => setNumberOfImages(parseInt(e.target.value))} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full" disabled={isLoading}>
                    {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
            <button onClick={handleSubmit} disabled={isLoading || !prompt.trim()} className="w-full sm:w-auto px-8 py-3 text-lg font-bold text-white bg-primary rounded-lg shadow-md hover:bg-primary-hover transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105">
                {isLoading ? 'Generating...' : `Generate (${5 * numberOfImages} credits)`}
            </button>
        </div>
      </>
    );

    const renderEditMode = () => (
      <>
        <div className="space-y-4">
            {inputImage ? (
                <div className="relative">
                    <img src={inputImage} alt="Input for editing" className="w-full max-h-72 object-contain rounded-lg" />
                    <button onClick={() => { setInputImage(null); setImageFileInfo(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors" aria-label="Remove image">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ) : (
                <div>
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-500/10 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                        <input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                </div>
            )}
        </div>
         <div className="flex items-center justify-end gap-4 pt-4">
            <button onClick={handleSubmit} disabled={isLoading || !prompt.trim() || !inputImage} className="w-full sm:w-auto px-8 py-3 text-lg font-bold text-white bg-primary rounded-lg shadow-md hover:bg-primary-hover transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105">
                {isLoading ? 'Editing...' : `Edit Image (5 credits)`}
            </button>
        </div>
      </>
    );

    const ShimmeringSkeleton = () => (
        <div className="aspect-square bg-light-card dark:bg-dark-card rounded-2xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-300/10 dark:via-gray-500/10 to-transparent animate-shimmer" />
        </div>
    );

    const renderResults = () => {
        if (isLoading) {
            const count = mode === 'edit' ? 1 : numberOfImages;
            if (mode === 'edit' && inputImage) {
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResultCard title="Before" imageSrc={inputImage} isOriginal />
                        <div>
                            <h2 className="text-xl font-semibold text-center mb-2">After</h2>
                            <ShimmeringSkeleton />
                        </div>
                    </div>
                );
            }
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: count }).map((_, i) => <ShimmeringSkeleton key={i} />)}
                </div>
            );
        }

        if (generatedImages.length > 0) {
            if (mode === 'edit' && inputImage) {
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <ResultCard title="Before" imageSrc={inputImage} isOriginal />
                        <ResultCard title="After" imageSrc={generatedImages[0]} onDownload={() => handleDownload(generatedImages[0], 0)} />
                    </div>
                );
            }
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedImages.map((src, index) => (
                        <ResultCard key={index} imageSrc={src} onDownload={() => handleDownload(src, index)} />
                    ))}
                </div>
            );
        }
        return null;
    };
    
    const ResultCard: React.FC<{title?: string, imageSrc: string, onDownload?: () => void, isOriginal?: boolean}> = ({title, imageSrc, onDownload, isOriginal}) => (
        <div className="animate-fade-in">
            {title && <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>}
            <div className="relative group aspect-square">
                <img src={imageSrc} alt={title || "Generated image"} className="w-full h-full object-cover rounded-2xl shadow-soft dark:shadow-soft-dark"/>
                {!isOriginal && (
                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center rounded-2xl">
                        <button onClick={onDownload} className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300 flex items-center gap-2 px-4 py-2 bg-white/90 text-black font-semibold rounded-lg hover:bg-white">
                            <DownloadIcon />
                            Download
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8 animate-slide-in-up">
            <div className="p-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark border border-light-border dark:border-dark-border backdrop-filter backdrop-blur">
                <div className="flex justify-center mb-6 border-b border-light-border dark:border-dark-border">
                    <TabButton isActive={mode === 'generate'} onClick={() => switchMode('generate')}>Create</TabButton>
                    <TabButton isActive={mode === 'edit'} onClick={() => switchMode('edit')}>Edit</TabButton>
                </div>
                
                <div className="space-y-6">
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={mode === 'generate' ? "Describe the image you want to create..." : "Describe the edit you want to make..."} className="w-full p-4 text-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px] transition" disabled={isLoading} aria-label="Prompt for image generation" />
                    {mode === 'generate' ? renderGenerateMode() : renderEditMode()}
                </div>

                {error && <div className="mt-6 p-4 text-center text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-lg" role="alert">{error}</div>}
                {infoMessage && <div className="mt-6 p-4 text-center text-yellow-700 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-lg" role="status">{infoMessage}</div>}
                
                {user && user.credits < 5 && !user.isAdmin && (
                     <div className="mt-6 p-4 text-center text-yellow-700 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-lg">
                        You're low on credits. <button onClick={() => setPage('credits')} className="font-bold underline hover:text-yellow-800 dark:hover:text-yellow-200">Purchase More</button>
                    </div>
                )}
            </div>
            
            <div className="mt-12">
                {renderResults()}
            </div>
        </div>
    );
};

const TabButton: React.FC<{isActive: boolean, onClick: () => void, children: React.ReactNode}> = ({isActive, onClick, children}) => (
    <button onClick={onClick} className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-400'}`}>{children}</button>
);

export default GeneratorPage;
