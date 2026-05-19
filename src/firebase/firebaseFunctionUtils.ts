import { getAuth } from "firebase/auth";

const getFunctionsUrl = (functionName: string) => {
    const region = 'us-central1';
    const projectId = import.meta.env.VITE_FIREBASE_STORAGE_PROJECT_ID;
    return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
}

export const uploadFileWithFunction = async (file: File): Promise<{ url: string; path: string }> => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to upload files.");
    }

    const token = await user.getIdToken();
    const formData = new FormData();
    formData.append('file', file);

    const functionUrl = getFunctionsUrl('attendifyUploadFile');

    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Function call failed.');
    }

    return result;
}
