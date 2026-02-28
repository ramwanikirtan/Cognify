export const analyzeSentiment = async (messages) => {
    try {
        if (!messages || messages.length === 0) return [];

        const validMessages = messages.filter(m => m.text && m.text.trim().length >= 3);
        if (validMessages.length === 0) return [];

        const endpoint = import.meta.env.VITE_AZURE_TEXT_ANALYTICS_ENDPOINT.replace(/\/$/, '');
        const url = `${endpoint}/text/analytics/v3.1/sentiment`;
        const key = import.meta.env.VITE_AZURE_TEXT_ANALYTICS_KEY;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": key
            },
            body: JSON.stringify({
                documents: validMessages.map(m => ({
                    id: m.id.toString(),
                    language: "en",
                    text: m.text
                }))
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Azure Sentiment Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return data.documents.map(doc => {
            const originalMessage = messages.find(m => m.id.toString() === doc.id);
            return {
                id: originalMessage.id,
                speakerId: originalMessage.speakerId,
                sentiment: doc.sentiment,
                confidenceScores: doc.confidenceScores
            };
        });
    } catch (error) {
        console.error("Error in analyzeSentiment:", error);
        throw error;
    }
};

export const extractKeyPhrases = async (messages) => {
    try {
        if (!messages || messages.length === 0) return [];

        const validMessages = messages.filter(m => m.text && m.text.trim().length >= 3);
        if (validMessages.length === 0) return [];

        const endpoint = import.meta.env.VITE_AZURE_TEXT_ANALYTICS_ENDPOINT.replace(/\/$/, '');
        const url = `${endpoint}/text/analytics/v3.1/keyPhrases`;
        const key = import.meta.env.VITE_AZURE_TEXT_ANALYTICS_KEY;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": key
            },
            body: JSON.stringify({
                documents: validMessages.map(m => ({
                    id: m.id.toString(),
                    language: "en",
                    text: m.text
                }))
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Azure KeyPhrases Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return data.documents.map(doc => {
            const originalMessage = messages.find(m => m.id.toString() === doc.id);
            return {
                id: originalMessage.id,
                speakerId: originalMessage.speakerId,
                keyPhrases: doc.keyPhrases
            };
        });
    } catch (error) {
        console.error("Error in extractKeyPhrases:", error);
        throw error;
    }
};

export const analyzeConversationSentiment = async (conversationLog) => {
    try {
        if (!conversationLog || conversationLog.length === 0) return {};

        const sentimentResults = await analyzeSentiment(conversationLog);
        const speakerStats = {};

        sentimentResults.forEach(result => {
            const sId = result.speakerId;
            if (!speakerStats[sId]) {
                speakerStats[sId] = {
                    dominantSentiment: "",
                    averagePositive: 0,
                    averageNegative: 0,
                    averageNeutral: 0,
                    messageCount: 0,
                    _sentimentCounts: { positive: 0, neutral: 0, negative: 0 }
                };
            }

            const stats = speakerStats[sId];
            stats.messageCount += 1;
            stats.averagePositive += result.confidenceScores.positive;
            stats.averageNegative += result.confidenceScores.negative;
            stats.averageNeutral += result.confidenceScores.neutral;

            if (stats._sentimentCounts[result.sentiment] !== undefined) {
                stats._sentimentCounts[result.sentiment] += 1;
            }
        });

        for (const sId in speakerStats) {
            const stats = speakerStats[sId];

            stats.averagePositive /= stats.messageCount;
            stats.averageNegative /= stats.messageCount;
            stats.averageNeutral /= stats.messageCount;

            let dominant = 'neutral';
            let maxCount = -1;

            for (const sent in stats._sentimentCounts) {
                if (stats._sentimentCounts[sent] > maxCount) {
                    maxCount = stats._sentimentCounts[sent];
                    dominant = sent;
                }
            }

            stats.dominantSentiment = dominant;
            delete stats._sentimentCounts;
        }

        return speakerStats;
    } catch (error) {
        console.warn("Error in analyzeConversationSentiment:", error);
        return {};
    }
};

export const getConversationInsights = async (conversationLog) => {
    try {
        if (!conversationLog || conversationLog.length === 0) return [];

        const keyPhrasesResults = await extractKeyPhrases(conversationLog);
        const phraseCounts = {};

        keyPhrasesResults.forEach(result => {
            result.keyPhrases.forEach(phrase => {
                const lowerPhrase = phrase.toLowerCase();
                if (!phraseCounts[lowerPhrase]) {
                    phraseCounts[lowerPhrase] = { phrase: lowerPhrase, count: 0 };
                }
                phraseCounts[lowerPhrase].count += 1;
            });
        });

        const phraseArray = Object.values(phraseCounts);
        phraseArray.sort((a, b) => b.count - a.count);

        return phraseArray.slice(0, 8);
    } catch (error) {
        console.warn("Error in getConversationInsights:", error);
        return [];
    }
};
