import type { JsonResult } from "@/app/types";

/**
 * Loads a sample JSON file from the public/samples directory
 * This is used for demonstration purposes to allow users to try the app
 * without having to upload their own files
 */
export async function loadSampleFile(filename: string): Promise<JsonResult> {
    try {
        const response = await fetch(`/samples/${filename}`);

        if (!response.ok) {
            throw new Error(`Failed to load sample file: ${response.statusText}`);
        }

        const data = await response.json();

        // Add metadata to make it match the format expected by the app
        return {
            ...data,
            filename: `sample_${filename}`,
            timestamp: new Date().toISOString(),
            is_active: false
        };
    } catch (error) {
        console.error("Error loading sample file:", error);
        throw error;
    }
}