export const detectSubject = (userInput, subjects) => {
    if (!userInput || !subjects || subjects.length === 0) return null;

    const lowerInput = userInput.toLowerCase();

    for (const subject of subjects) {
        if (!subject.keywords) continue;
        for (const keyword of subject.keywords) {
            if (lowerInput.includes(keyword.toLowerCase())) {
                return subject;
            }
        }
    }

    return null;
};

export const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getDelay = (baseMs, speed) => {
    if (speed <= 0) return baseMs;
    return baseMs / speed;
};

export const formatTimestamp = (date) => {
    try {
        if (!date || isNaN(new Date(date).getTime())) return '';
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(new Date(date));
    } catch (e) {
        return '';
    }
};

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
