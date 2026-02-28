import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassroomStore } from '../store/classroomStore';
import { SUBJECTS } from '../data/subjects';
import { PERSONAS } from '../data/personas';
import { detectSubjectWithAI } from '../services/openaiService';

export default function LandingScreen({ onStart }) {
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isListening, setIsListening] = useState(false);

    const setTopic = useClassroomStore((state) => state.setTopic);
    const setDetectedSubject = useClassroomStore((state) => state.setDetectedSubject);
    const setSubject = useClassroomStore((state) => state.setSubject);

    const students = PERSONAS.filter(p => p.role === "student");

    const recognitionRef = useRef(null)

    // Check STT support
    const STTSupported = typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)

    const handleSpeakTopic = () => {
        if (!STTSupported) {
            // Show a message telling user to type instead
            setError('Speech input is only supported on Chrome and Edge. Please type your topic instead.')
            return
        }

        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
            setIsListening(false)
            return
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognitionAPI()
        recognition.lang = 'en-US'
        recognition.continuous = false
        recognition.interimResults = true
        recognition.maxAlternatives = 1

        recognition.onstart = () => setIsListening(true)

        recognition.onresult = (event) => {
            let transcript = ''
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript
            }
            setInputText(transcript)
        }

        recognition.onend = () => setIsListening(false)

        recognition.onerror = (event) => {
            console.warn('STT error:', event.error)
            setIsListening(false)
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone access and try again.')
            }
        }

        recognitionRef.current = recognition
        recognition.start()
    }

    const handleStart = async () => {
        if (!inputText.trim()) {
            setError("Please enter a topic to start the class.");
            return;
        }

        try {
            setError("");
            setIsLoading(true);

            const detectedSubjectName = await detectSubjectWithAI(inputText);

            let matchedSubject = SUBJECTS.find(s =>
                s.name.toLowerCase() === detectedSubjectName.toLowerCase() ||
                s.name.toLowerCase().replace(/\s/g, '') === detectedSubjectName.toLowerCase().replace(/\s/g, '') ||
                s.name.toLowerCase().includes(detectedSubjectName.toLowerCase()) ||
                detectedSubjectName.toLowerCase().includes(s.name.toLowerCase())
            );
            if (!matchedSubject) {
                matchedSubject = SUBJECTS[0]; // Fallback to Biology
            }

            setTopic(inputText);
            setDetectedSubject(matchedSubject);
            setSubject(matchedSubject);

            if (onStart) onStart();
        } catch (err) {
            console.error("Start flow error:", err);
            // Fallback scenario
            const fallbackSubject = SUBJECTS[0];
            setTopic(inputText);
            setDetectedSubject(fallbackSubject);
            setSubject(fallbackSubject);
            if (onStart) onStart();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white overflow-hidden relative" style={{ backgroundSize: '200% 200%', animation: 'gradientMove 15s ease infinite' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />

            <div className="z-10 flex flex-col items-center w-full max-w-3xl">

                {/* TOP SECTION */}
                <div className="text-center mb-12 flex flex-col items-center">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="text-6xl mb-4 drop-shadow-lg"
                    >
                        🎓
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        Cognify Classroom
                    </h1>
                    <p className="text-xl text-slate-400 font-medium drop-shadow-sm">
                        An AI-powered classroom simulation. Type a topic to begin.
                    </p>
                </div>

                {/* MIDDLE SECTION - INPUT AREA */}
                <div className="w-full bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-slate-700/50 shadow-2xl mb-12">
                    <label className="block text-lg font-semibold text-slate-200 mb-4 ml-1">
                        What should the class be about today?
                    </label>

                    <div className="relative mb-2">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full bg-slate-950/50 text-white placeholder-slate-500 rounded-2xl p-4 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all resize-none shadow-inner"
                            style={{ minHeight: '100px' }}
                            maxLength={300}
                            placeholder="e.g. photosynthesis, Newton's laws, World War II, Shakespeare..."
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm font-medium text-slate-400 ml-1">
                            {inputText.length} / 300
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-red-400 text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.button
                            onClick={handleSpeakTopic}
                            title={!STTSupported ? 'Speech input requires Chrome or Edge browser' : 'Click to speak your topic'}
                            style={{
                                opacity: STTSupported ? 1 : 0.5,
                                cursor: STTSupported ? 'pointer' : 'not-allowed',
                            }}
                            whileHover={STTSupported && !isLoading ? { scale: 1.05 } : {}}
                            whileTap={STTSupported && !isLoading ? { scale: 0.95 } : {}}
                            disabled={isLoading}
                            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center min-w-[160px] ${isListening
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isListening ? '🔴 Listening...' : STTSupported ? '🎤 Speak Topic' : '🎤 Chrome Only'}
                        </motion.button>

                        <button
                            onClick={handleStart}
                            disabled={isLoading}
                            className={`px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-400/30 flex items-center justify-center min-w-[200px] ${isLoading ? 'opacity-75 cursor-wait' : 'hover:scale-105 hover:from-indigo-500 hover:to-purple-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]'
                                }`}
                        >
                            {isLoading ? "🔄 Setting up classroom..." : "🚀 Start Class"}
                        </button>
                    </div>
                </div>

                {/* BOTTOM SECTION */}
                <div className="w-full flex flex-col items-center">
                    <p className="text-slate-400 font-medium mb-6">Your classroom today 👇</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        {students.map((student) => (
                            <motion.div
                                key={student.id}
                                whileHover={{ scale: 1.05 }}
                                className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center gap-3 shadow-xl"
                            >
                                <div
                                    className="w-16 h-16 rounded-full shadow-inner flex items-center justify-center text-2xl font-bold uppercase"
                                    style={{ backgroundColor: student.avatarColor, color: '#fff' }}
                                >
                                    {student.name.charAt(0)}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white font-bold text-lg leading-tight">{student.name}</h3>
                                    <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mt-1">
                                        {student.personality.replace('_', ' ')}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
