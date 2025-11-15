
import { GoogleGenAI, Modality } from "@google/genai";

// API KEY must be set in environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY not found. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export interface GenerationResult {
    images: string[];
    blockedMessage: string | null;
}

export const generateImages = async (prompt: string, numberOfImages: number): Promise<GenerationResult> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                numberOfImages,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("No images were generated. This may be due to the safety policy. Try adjusting your prompt.");
        }

        const images: string[] = [];
        const blockedImagesReasons: string[] = [];

        for (const generatedImage of response.generatedImages) {
            if (generatedImage.image?.imageBytes) {
                images.push(`data:image/png;base64,${generatedImage.image.imageBytes}`);
            } else if (generatedImage.reason) {
                blockedImagesReasons.push(generatedImage.reason);
            }
        }

        if (images.length === 0) {
            if (blockedImagesReasons.length > 0) {
                const uniqueReasons = [...new Set(blockedImagesReasons)];
                throw new Error(`All images were blocked by the safety policy. Reason(s): ${uniqueReasons.join(', ')}`);
            }
            throw new Error("Image generation failed. The API returned no valid image data.");
        }
        
        let blockedMessage: string | null = null;
        if (blockedImagesReasons.length > 0) {
            const blockedCount = numberOfImages - images.length;
            const uniqueReasons = [...new Set(blockedImagesReasons)];
            blockedMessage = `${blockedCount} image(s) couldn't be generated due to safety policies. Reason(s): ${uniqueReasons.join(', ')}`;
        }
        
        return { images, blockedMessage };

    } catch (error) {
        console.error("Error generating images:", error);
        if (error instanceof Error) {
            if (typeof window !== 'undefined' && !window.navigator.onLine) {
                 throw new Error("You appear to be offline. Please check your internet connection.");
            }
            throw new Error(`Failed to generate images: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating images.");
    }
};

export const editImage = async (prompt: string, imageBase64: string, imageMimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: imageMimeType,
            },
        };
        const textPart = {
            text: prompt,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const candidate = response.candidates?.[0];
        if (!candidate) {
            throw new Error("Image editing failed. The API returned an empty response.");
        }

        // Check for non-stop finish reasons
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            throw new Error(`Image editing was stopped. Reason: ${candidate.finishReason}. This may be due to a safety policy violation or an issue with the prompt.`);
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("Image editing failed. The API did not return an image, which could be due to a safety policy violation.");

    } catch (error) {
        console.error("Error editing image:", error);
        if (error instanceof Error) {
             if (typeof window !== 'undefined' && !window.navigator.onLine) {
                 throw new Error("You appear to be offline. Please check your internet connection.");
            }
            throw new Error(`Failed to edit image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while editing the image.");
    }
};
