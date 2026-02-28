import { create } from 'zustand';

export const useClassroomStore = create((set) => ({
    subject: null,
    topic: null,
    detectedSubject: null,
    phase: "landing",
    conversationLog: [],
    isPlaying: true,
    speed: 1,
    currentSpeaker: null,
    isSpeaking: false,
    evaluationData: null,
    classEnded: false,

    // Observer Mode State
    observerName: null,
    isObserverJoined: false,
    observerMessages: [],

    setTopic: (topic) => set({ topic }),
    setSubject: (subject) => set({ subject }),
    setDetectedSubject: (detectedSubject) => set({ detectedSubject }),
    setPhase: (phase) => set({ phase }),
    addMessage: (message) => set((state) => ({ conversationLog: [...state.conversationLog, message] })),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setSpeed: (speed) => set({ speed }),
    setCurrentSpeaker: (currentSpeaker) => set({ currentSpeaker }),
    setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
    setEvaluationData: (evaluationData) => set({ evaluationData }),
    setClassEnded: (classEnded) => set({ classEnded }),

    // Observer Actions
    setObserverName: (name) => set({ observerName: name }),
    setIsObserverJoined: (bool) => set({ isObserverJoined: bool }),
    addObserverMessage: (msg) => set((state) => ({ observerMessages: [...state.observerMessages, msg] })),
    resetObserver: () => set({ observerName: null, isObserverJoined: false, observerMessages: [] }),

    resetStore: () => set({
        subject: null,
        topic: null,
        detectedSubject: null,
        phase: "landing",
        conversationLog: [],
        isPlaying: true,
        speed: 1,
        currentSpeaker: null,
        isSpeaking: false,
        evaluationData: null,
        classEnded: false,
        observerName: null,
        isObserverJoined: false,
        observerMessages: [],
    })
}));
