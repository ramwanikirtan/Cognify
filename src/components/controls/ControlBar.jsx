import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ControlBar({
    isPlaying,
    onPauseResume,
    onSkip,
    speed,
    onSpeedChange,
    onAskQuestion,
    currentSpeaker,
    isSpeaking
}) {
    const [inputText, setInputText] = useState("");

    const handleAsk = () => {
        if (inputText.trim()) {
            onAskQuestion(inputText.trim());
            setInputText("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAsk();
        }
    };

    const displaySpeaker = currentSpeaker === 'teacher'
        ? 'Mr. Nova'
        : (currentSpeaker ? currentSpeaker.charAt(0).toUpperCase() + currentSpeaker.slice(1) : '');

    return (
        <div className="w-full h-[72px] bg-[#0f0f1a] border-t border-slate-700/50 flex items-center justify-between px-6 relative z-30">

            {/* LEFT GROUP */}
            <div className="flex items-center gap-4">
                {/* PAUSE/RESUME BUTTON */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onPauseResume}
                    className={`px-4 py-2 rounded-lg font-bold text-white transition-colors duration-200 ${isPlaying ? 'bg-slate-600 hover:bg-slate-500' : 'bg-green-600 hover:bg-green-500'
                        }`}
                >
                    {isPlaying ? "⏸ Pause" : "▶ Resume"}
                </motion.button>

                {/* SKIP BUTTON */}
                <motion.button
                    whileHover={isSpeaking ? { scale: 1.05 } : {}}
                    whileTap={isSpeaking ? { scale: 0.95 } : {}}
                    onClick={isSpeaking ? onSkip : undefined}
                    disabled={!isSpeaking}
                    className={`px-4 py-2 rounded-lg font-bold text-white transition-opacity duration-200 bg-slate-700 ${isSpeaking
                        ? 'hover:bg-slate-600 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed'
                        }`}
                >
                    ⏭ Skip
                </motion.button>

                {/* SPEED CONTROL */}
                <div className="flex items-center ml-2 space-x-1 border border-slate-700 rounded-lg p-1 bg-slate-900/50">
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider px-2">Speed:</span>
                    {[0.5, 1, 2].map((s) => (
                        <button
                            key={s}
                            onClick={() => onSpeedChange(s)}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                border: 'none',
                                backgroundColor: Number(speed) === s ? '#6366f1' : '#2d2d3d',
                                color: 'white',
                                transition: 'all 0.2s'
                            }}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            </div>

            {/* CENTER INDICATOR (Absolutely Positioned) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                    {(isSpeaking && currentSpeaker) || !isPlaying ? (
                        <motion.div
                            key={isSpeaking ? 'speaking' : 'paused'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-black/60 backdrop-blur-sm border border-slate-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg"
                        >
                            {isSpeaking
                                ? `🎙 ${displaySpeaker} is speaking...`
                                : "⏸ Paused"}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* RIGHT GROUP */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    maxLength={150}
                    className="bg-slate-900 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 text-sm"
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAsk}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                    💬 Ask
                </motion.button>
            </div>
        </div>
    );
}
