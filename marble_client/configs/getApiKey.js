import apiKeyMapping from "@/configs/apiKeyMapping";

const getApiKeyByDomain = () => {
    if (typeof window === "undefined") {
        // Return null or a default value when on the server side
        return null;
    }
    
    const currentDomain = window.location.hostname;
    return apiKeyMapping[currentDomain] || null;
};

export default getApiKeyByDomain;
