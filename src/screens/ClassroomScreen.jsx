import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useClassroomStore } from '../store/classroomStore';
import { PERSONAS } from '../data/personas';
import TeacherAvatar from '../components/avatars/TeacherAvatar';
import StudentAvatar from '../components/avatars/StudentAvatar';
import StudentDesk from '../components/classroom/StudentDesk';
import ChatBubble from '../components/classroom/ChatBubble';
import ControlBar from '../components/controls/ControlBar';

import { generateTeachingSlides, generateConversation, generateEvaluation, generateResponseToObserver } from '../services/openaiService';
import { speakText, stopSpeaking, getVoiceForSpeaker, fetchAudioBlob, playAudioBlob } from '../services/speechService';
import { analyzeConversationSentiment, getConversationInsights } from '../services/analyticsService';
import { sleep, generateMessageId, formatTimestamp, getDelay } from '../utils/helpers';
import { AnimatePresence } from 'framer-motion';

export default function ClassroomScreen({ onEnd }) {
    const subject = useClassroomStore((state) => state.subject);
    const topic = useClassroomStore((state) => state.topic);
    const conversationLog = useClassroomStore((state) => state.conversationLog);
    const isPlaying = useClassroomStore((state) => state.isPlaying);
    const speed = useClassroomStore((state) => state.speed);
    const currentSpeaker = useClassroomStore((state) => state.currentSpeaker);
    const phase = useClassroomStore((state) => state.phase);
    const isSpeaking = useClassroomStore((state) => state.isSpeaking);
    const classEnded = useClassroomStore((state) => state.classEnded);

    const addMessage = useClassroomStore((state) => state.addMessage);
    const setCurrentSpeaker = useClassroomStore((state) => state.setCurrentSpeaker);
    const setIsSpeaking = useClassroomStore((state) => state.setIsSpeaking);
    const setClassEnded = useClassroomStore((state) => state.setClassEnded);
    const setEvaluationData = useClassroomStore((state) => state.setEvaluationData);
    const setPhase = useClassroomStore((state) => state.setPhase);
    const setIsPlaying = useClassroomStore((state) => state.setIsPlaying);
    const setSpeed = useClassroomStore((state) => state.setSpeed);
    const { observerName, isObserverJoined, setObserverName, setIsObserverJoined, addObserverMessage } = useClassroomStore();

    const students = PERSONAS.filter(p => p.role === 'student');
    const teacher = PERSONAS.find(p => p.role === 'teacher');

    const personalityLabels = {
        fast_learner: '⚡ Fast Learner',
        esl_student: '🌍 ESL Student',
        distracted: '😄 Class Clown',
        emotional: '💜 Empath'
    };

    const [blackboardText, setBlackboardText] = useState("");
    const [blackboardConcept, setBlackboardConcept] = useState("");
    const [studentReactions, setStudentReactions] = useState({
        ali: null,
        kirtan: null,
        tayyab: null,
        rana: null
    })

    const bottomRef = useRef(null);

    console.log('blackboardText state:', blackboardText)
    console.log('blackboardConcept state:', blackboardConcept)
    const [isTyping, setIsTyping] = useState(false);
    const engineStarted = useRef(false);
    const skipRef = useRef(false);
    const blackboardRef = useRef(null);

    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speed);
    const conversationLogRef = useRef(conversationLog);
    const isEndingRef = useRef(false);

    const [showJoinModal, setShowJoinModal] = useState(false)
    const [joinNameInput, setJoinNameInput] = useState('')
    const [observerInput, setObserverInput] = useState('')
    const [isObserverTyping, setIsObserverTyping] = useState(false)
    const observerQueueRef = useRef([])

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        conversationLogRef.current = conversationLog;
    }, [conversationLog]);

    useEffect(() => {
        if (blackboardRef.current) {
            blackboardRef.current.scrollTop = blackboardRef.current.scrollHeight;
        }
    }, [blackboardText]);

    useEffect(() => {
        if (engineStarted.current) return;
        engineStarted.current = true;
        runClassroom();
    }, []);

    const handlePauseResume = () => {
        setIsPlaying(!isPlaying);
        isPlayingRef.current = !isPlaying;
    };

    const handleSkip = () => {
        skipRef.current = true;
    };

    const handleSpeedChange = (newSpeed) => {
        speedRef.current = newSpeed  // update ref immediately
        setSpeed(newSpeed)            // update store
        console.log('[Speed] Changed to:', newSpeed)
    };

    const handleAskQuestion = (questionText) => {
        if (!questionText || classEnded) return;

        const msg = {
            id: generateMessageId(),
            speakerId: 'observer',
            speakerName: 'Observer',
            text: questionText,
            timestamp: formatTimestamp(new Date()),
            type: 'question'
        };

        addMessage(msg);
    };

    const handleEndClass = () => {
        // Stop all speech immediately
        try {
            if (typeof window.responsiveVoice !== 'undefined') {
                window.responsiveVoice.cancel()
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel()
            }
        } catch (e) {
            console.warn('Error stopping speech:', e)
        }

        stopSpeaking()

        // Signal the engine to skip the rest and proceed to Phase 4 (Evaluation)
        isEndingRef.current = true
        skipRef.current = true
        isPlayingRef.current = true // Wake up the runner if paused
        setIsPlaying(true)

        // Clear local UI state
        setBlackboardText('')
        setBlackboardConcept('')
        setIsTyping(false)
        setCurrentSpeaker(null)
        setIsSpeaking(false)

        // Navigate to evaluation screen (where a spinner will show until Phase 4 finishes)
        onEnd()
    }

    async function typeTextOnBlackboard(text) {
        if (!text || text.length === 0) return
        setIsTyping(true)
        setBlackboardText('')
        await new Promise(r => setTimeout(r, 200))

        let current = ''
        for (let i = 0; i < text.length; i++) {
            if (skipRef.current) {
                setBlackboardText(text)
                break
            }
            current += text[i]
            setBlackboardText(current)
            const delay = Math.max(5, Math.floor(28 / speedRef.current))
            await new Promise(r => setTimeout(r, delay))
        }

        setIsTyping(false)
    }

    const handleJoinAsStudent = () => {
        if (!joinNameInput.trim()) return
        setObserverName(joinNameInput.trim())
        setIsObserverJoined(true)
        setShowJoinModal(false)
        setJoinNameInput('')

        // Add a welcome message to the conversation
        const welcomeMsg = {
            id: generateMessageId(),
            speakerId: 'teacher',
            speakerName: 'Mr. Nova',
            text: `Oh wonderful! We have a new student joining us today — ${joinNameInput.trim()}! Welcome to the class! Feel free to jump in anytime.`,
            timestamp: formatTimestamp(new Date()),
            type: 'comment'
        }
        addMessage(welcomeMsg)
        speakText(`Oh wonderful! We have a new student joining us — ${joinNameInput.trim()}! Welcome!`, 'teacher').catch(() => { })
    }

    const handleObserverSend = async () => {
        const text = observerInput.trim()
        if (!text || isObserverTyping) return

        setObserverInput('')
        setIsObserverTyping(true)

        // Add observer message to conversation
        const observerMsg = {
            id: generateMessageId(),
            speakerId: 'observer',
            speakerName: observerName,
            text: text,
            timestamp: formatTimestamp(new Date()),
            type: 'question'
        }
        addMessage(observerMsg)

        try {
            // Get the last 4 messages from conversationLog for context
            const recentHistory = conversationLogRef.current.slice(-4)

            // Generate AI responses to the observer
            const responses = await generateResponseToObserver(
                observerName,
                text,
                topic,
                subject?.name || 'General',
                recentHistory,
                PERSONAS
            )

            // Play each response with typing and voice
            for (const response of responses) {
                const msg = {
                    id: generateMessageId(),
                    speakerId: response.speakerId,
                    speakerName: response.speakerName,
                    text: response.text,
                    timestamp: formatTimestamp(new Date()),
                    type: response.type
                }

                setCurrentSpeaker(response.speakerId)
                addMessage(msg)

                if (response.speakerId === 'teacher') {
                    setBlackboardConcept(`Responding to ${observerName}`)
                    await typeTextOnBlackboard(response.text)
                }

                await speakText(response.text, response.speakerId).catch(() => { })
                setCurrentSpeaker(null)
                await new Promise(r => setTimeout(r, 400))
            }
        } catch (e) {
            console.error('Observer response error:', e)
        }

        setIsObserverTyping(false)
    }

    function triggerReaction(speakerId, type) {
        setStudentReactions(prev => ({ ...prev, [speakerId]: type }))
        // Clear reaction after 4 seconds
        setTimeout(() => {
            setStudentReactions(prev => ({ ...prev, [speakerId]: null }))
        }, 4000)
    }

    function detectMentions(text, currentSpeakerId) {
        const nameMap = {
            ali: ['ali', 'ali!'],
            kirtan: ['kirtan', 'kirtan!'],
            tayyab: ['tayyab', 'tayyab!'],
            rana: ['rana', 'rana!']
        }
        const lowerText = text.toLowerCase()

        Object.entries(nameMap).forEach(([id, names]) => {
            if (id !== currentSpeakerId) {
                const mentioned = names.some(n => lowerText.includes(n))
                if (mentioned) {
                    triggerReaction(id, 'mention')
                }
            }
        })

        // If it is a joke type trigger joke reaction on all non-speaking students
        if (lowerText.includes('haha') || lowerText.includes('joke') || lowerText.includes('funny') || lowerText.includes('lol')) {
            Object.keys(nameMap).forEach(id => {
                if (id !== currentSpeakerId) {
                    triggerReaction(id, 'joke')
                }
            })
        }
    }

    async function runClassroom() {
        console.log('runClassroom started, topic:', topic, 'subject:', subject?.name)

        // Wait for ResponsiveVoice to be ready (max 3 seconds)
        let rvWaitCount = 0
        while (typeof window.responsiveVoice === 'undefined' && rvWaitCount < 30) {
            await new Promise(r => setTimeout(r, 100))
            rvWaitCount++
        }
        if (typeof window.responsiveVoice !== 'undefined') {
            console.log('[TTS] ResponsiveVoice is ready')
        } else {
            console.log('[TTS] ResponsiveVoice not available, will use browser TTS')
        }

        try {
            // PHASE 1: Generate and display teaching slides
            const slides = await generateTeachingSlides(topic, subject?.name || 'General', PERSONAS);
            console.log('Teaching slides generated:', slides)

            for (const slide of slides) {
                if (isEndingRef.current) break;
                while (!isPlayingRef.current) {
                    if (isEndingRef.current) break;
                    await sleep(300);
                }
                if (isEndingRef.current) break;
                setBlackboardConcept(slide.concept);
                setBlackboardText('');
                await new Promise(r => setTimeout(r, 150));

                // Fetch audio blob FIRST before typing starts
                let audioBlob = null;
                try {
                    audioBlob = await fetchAudioBlob(slide.content, 'teacher');
                } catch (e) {
                    console.warn('Audio prefetch failed:', e);
                }

                // Now start typing AND play audio simultaneously
                const typingPromise = typeTextOnBlackboard(slide.content);
                const audioPromise = audioBlob ? playAudioBlob(audioBlob, 'teacher') : speakText(slide.content, 'teacher').catch(() => { });

                setCurrentSpeaker('teacher');
                setIsSpeaking(true);

                await Promise.all([typingPromise, audioPromise]);

                setIsSpeaking(false);
                setCurrentSpeaker(null);

                const msg = {
                    id: generateMessageId(),
                    speakerId: 'teacher',
                    speakerName: 'Mr. Nova',
                    text: slide.content,
                    timestamp: formatTimestamp(new Date()),
                    type: 'teaching'
                };
                addMessage(msg);

                await new Promise(r => setTimeout(r, getDelay(300, speedRef.current)));
            }

            // PHASE 2: Generate conversation
            let conversation = [];
            if (!isEndingRef.current) {
                const teachingContent = slides.map(s => s.content).join(' ');
                conversation = await generateConversation(
                    topic,
                    subject?.name || 'General',
                    teachingContent,
                    PERSONAS,
                    []
                );
            }

            // PHASE 3: Play through conversation messages one by one
            for (const turn of conversation) {
                if (isEndingRef.current) break;
                while (!isPlayingRef.current) {
                    if (isEndingRef.current) break; // Added check for isEndingRef
                    await sleep(300);
                }
                if (isEndingRef.current) break; // Added check for isEndingRef

                const msg = {
                    id: generateMessageId(),
                    speakerId: turn.speakerId,
                    speakerName: turn.speakerName,
                    text: turn.text,
                    timestamp: formatTimestamp(new Date()),
                    type: turn.type
                };

                if (skipRef.current) {
                    skipRef.current = false;
                    addMessage(msg);
                    setCurrentSpeaker(null);
                    if (isEndingRef.current) break;
                    continue;
                }

                setCurrentSpeaker(turn.speakerId);

                // Trigger reactions based on message content and type
                if (turn.type === 'joke') {
                    // Tayyab made a joke — all others react
                    Object.keys(studentReactions).forEach(id => {
                        if (id !== turn.speakerId) triggerReaction(id, 'joke')
                    })
                } else {
                    // Check if any student name is mentioned
                    detectMentions(turn.text, turn.speakerId)
                }

                setIsSpeaking(true);
                addMessage(msg);

                if (turn.speakerId === 'teacher') {
                    setBlackboardConcept('Mr. Nova responds');
                    setBlackboardText('');
                    await new Promise(r => setTimeout(r, 100));

                    let audioBlob = null;
                    try {
                        audioBlob = await fetchAudioBlob(turn.text, 'teacher');
                    } catch (e) { }

                    const typingPromise = typeTextOnBlackboard(turn.text);
                    const audioPromise = audioBlob ? playAudioBlob(audioBlob, 'teacher') : speakText(turn.text, 'teacher').catch(() => { });

                    await Promise.all([typingPromise, audioPromise]);
                } else {
                    await speakText(turn.text, turn.speakerId).catch(() => { });
                }

                setIsSpeaking(false);
                setCurrentSpeaker(null);

                await sleep(getDelay(300, speedRef.current));
            }

            // FINISHED - Phase 4 generation is now handled by EvaluationScreen
            setCurrentSpeaker(null);
            setClassEnded(true);
            await sleep(500);
            if (onEnd) onEnd();

        } catch (error) {
            console.error('Classroom engine error:', error);
        }
    }

    const topBarBg = subject?.themeColors?.primary
        ? `${subject.themeColors.primary}33`
        : 'rgba(55, 65, 81, 0.8)';

    const primaryColor = subject?.themeColors?.primary || 'transparent';
    const bgColor = subject?.themeColors?.bg || '#0a0a0f';

    return (
        <div
            className="flex flex-col w-full h-screen overflow-hidden font-sans relative"
            style={{ background: `linear-gradient(to bottom, #0a0a0f, ${bgColor})` }}
        >
            {/* AMBIENT GLOW */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                style={{ background: `radial-gradient(circle at top left, ${primaryColor}1A, transparent 50%)` }}
            />

            {/* TOP BAR */}
            <div
                className="flex shrink-0 items-center justify-between px-6 py-3 border-b border-white/10 backdrop-blur-sm shadow-sm z-20"
                style={{ backgroundColor: topBarBg }}
            >
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl drop-shadow-md relative">
                            <span className="absolute -left-3 top-2 w-2 h-2 rounded-full" style={{ backgroundColor: subject?.themeColors?.accent || '#fff' }}></span>
                            {subject?.emoji || '📚'}
                        </span>
                        <span className="text-2xl font-extrabold text-white tracking-wider">{subject?.name || 'Classroom Subject'}</span>
                    </div>
                    <span className="text-sm text-slate-300 font-medium mt-1 border-l-2 pl-2 border-white/20 capitalize">
                        Topic: {topic || 'Waiting for topic...'}
                    </span>
                </div>

                <div className="flex items-center">
                    {!isObserverJoined ? (
                        <motion.button
                            onClick={() => setShowJoinModal(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '13px',
                                marginRight: '10px'
                            }}
                        >
                            🎓 Join as Student
                        </motion.button>
                    ) : (
                        <div style={{
                            padding: '6px 14px',
                            backgroundColor: 'rgba(99,102,241,0.2)',
                            border: '1px solid rgba(99,102,241,0.4)',
                            borderRadius: '8px',
                            color: '#818cf8',
                            fontSize: '12px',
                            fontWeight: '700',
                            marginRight: '10px'
                        }}>
                            🧑 {observerName} — In Class
                        </div>
                    )}

                    <button
                        onClick={handleEndClass}
                        className="bg-red-600/90 hover:bg-red-500 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors border border-red-500/50 shadow-md shadow-red-500/20"
                    >
                        <span className="text-lg">⏹</span>
                        <span>End Class</span>
                    </button>
                </div>
            </div>

            {/* MIDDLE SECTION - Blackboard & Feed */}
            <div className="flex flex-1 overflow-hidden min-h-0 bg-slate-950">

                {/* BLACKBOARD (LEFT 55%) */}
                <div style={{
                    width: '55%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#1a3a1a',
                    border: `10px solid ${subject?.themeColors?.secondary || '#5c3a1e'}`,
                    borderRadius: '6px',
                    margin: '10px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4), 6px 6px 20px rgba(0,0,0,0.5)',
                    minHeight: '380px'
                }}>

                    {/* === BLACKBOARD HEADER === */}
                    <div style={{
                        padding: '10px 20px 8px',
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0,
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            fontFamily: "'Chalkboard SE', 'Comic Sans MS', cursive",
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: 'rgba(255,255,255,0.95)',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.1)'
                        }}>
                            {subject?.name || 'Classroom'}
                        </div>
                        <div style={{
                            width: '50%',
                            height: '1px',
                            background: 'rgba(255,255,255,0.15)',
                            margin: '6px auto'
                        }} />
                        <div style={{
                            fontFamily: "'Chalkboard SE', 'Comic Sans MS', cursive",
                            fontSize: '15px',
                            color: 'rgba(255,255,255,0.6)'
                        }}>
                            Today: {topic}
                        </div>
                    </div>

                    {/* === SLIDE CONTENT AREA === */}
                    <div
                        ref={blackboardRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '30px 40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '140px'
                        }}
                    >
                        {/* Concept label */}
                        {blackboardConcept ? (
                            <div style={{
                                fontFamily: "'Chalkboard SE', 'Comic Sans MS', cursive",
                                fontSize: '13px',
                                color: 'rgba(144,238,144,0.65)',
                                textTransform: 'uppercase',
                                letterSpacing: '3px',
                                marginBottom: '18px',
                                textAlign: 'center'
                            }}>
                                ✦ {blackboardConcept} ✦
                            </div>
                        ) : null}

                        {/* Main slide text */}
                        <div style={{
                            fontFamily: "'Chalkboard SE', 'Comic Sans MS', cursive",
                            fontSize: '21px',
                            color: 'rgba(255,255,255,0.93)',
                            lineHeight: '1.85',
                            textAlign: 'center',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            width: '100%',
                            maxWidth: '520px'
                        }}>
                            {blackboardText && blackboardText.length > 0 ? (
                                <span>
                                    {blackboardText}
                                    {isTyping ? (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                                            style={{ color: 'white', marginLeft: '2px', fontWeight: 'bold' }}
                                        >
                                            |
                                        </motion.span>
                                    ) : null}
                                </span>
                            ) : (
                                <span style={{
                                    color: 'rgba(255,255,255,0.18)',
                                    fontSize: '16px',
                                    fontStyle: 'italic'
                                }}>
                                    📖 Waiting for class to begin...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* === CHALK TRAY === */}
                    <div style={{
                        height: '5px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        flexShrink: 0
                    }} />

                    {/* === TEACHER AVATAR === */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        paddingBottom: '8px',
                        flexShrink: 0,
                        height: '160px',
                        overflow: 'visible'
                    }}>
                        <TeacherAvatar
                            persona={PERSONAS.find(p => p.id === 'teacher')}
                            isActive={currentSpeaker === 'teacher'}
                            subject={subject}
                        />
                    </div>
                </div>

                {/* CONVERSATION FEED (RIGHT 45%) */}
                <div className="w-[45%] h-full flex flex-col bg-slate-800/80 inset-shadow-sm shadow-inner overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700/80 bg-slate-900/90 shrink-0 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📋</span>
                            <h3 className="text-white font-bold text-lg tracking-wide drop-shadow-sm">Class Discussion</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 scroll-smooth bg-slate-900/50">
                        {conversationLog && conversationLog.length > 0 ? (
                            <div className="flex flex-col space-y-2 pb-2">
                                {conversationLog.map((msg, idx) => (
                                    <ChatBubble key={msg.id || idx} message={msg} personas={PERSONAS} />
                                ))}
                                <div ref={bottomRef} className="h-2 text-transparent">-</div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-10">
                                <span className="text-4xl mb-4 opacity-40">💬</span>
                                <p className="font-medium text-lg text-slate-400 leading-relaxed">The conversation will appear here as the class unfolds...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STUDENTS ROW WITH FLOOR */}
            <div className="h-[160px] shrink-0 bg-transparent flex items-center justify-around px-8 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] z-20 relative" style={{ overflow: 'visible', zIndex: 10 }}>
                {/* FLOOR DIVIDER */}
                <div
                    className="absolute top-0 inset-x-0 h-[2px]"
                    style={{ background: `linear-gradient(to right, transparent, ${subject?.themeColors?.primary || 'rgba(255,255,255,0.2)'}, transparent)` }}
                />
                {PERSONAS.filter(p => p.role === 'student').map(persona => (
                    <StudentDesk
                        key={persona.id}
                        persona={persona}
                        isActive={currentSpeaker === persona.id}
                    >
                        <StudentAvatar
                            persona={persona}
                            isActive={currentSpeaker === persona.id}
                            subject={subject}
                            reactionType={currentSpeaker === persona.id ? null : studentReactions[persona.id]}
                        />
                    </StudentDesk>
                ))}
            </div>

            {/* OBSERVER INPUT BAR */}
            {isObserverJoined && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{
                        backgroundColor: 'rgba(99,102,241,0.08)',
                        borderTop: '1px solid rgba(99,102,241,0.3)',
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexShrink: 0
                    }}
                >
                    <div style={{
                        width: '36px', height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', flexShrink: 0
                    }}>
                        🧑
                    </div>
                    <span style={{ color: '#818cf8', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                        {observerName}:
                    </span>
                    <input
                        type="text"
                        value={observerInput}
                        onChange={e => setObserverInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleObserverSend()}
                        placeholder={isObserverTyping ? 'Class is responding to you...' : 'Say something to the class...'}
                        disabled={isObserverTyping}
                        style={{
                            flex: 1,
                            padding: '8px 14px',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            borderRadius: '999px',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                            opacity: isObserverTyping ? 0.5 : 1
                        }}
                    />
                    <motion.button
                        onClick={handleObserverSend}
                        disabled={!observerInput.trim() || isObserverTyping}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '8px 18px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            borderRadius: '999px',
                            color: 'white',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '13px',
                            opacity: (!observerInput.trim() || isObserverTyping) ? 0.5 : 1
                        }}
                    >
                        Send 💬
                    </motion.button>
                </motion.div>
            )}

            {/* CONTROL BAR */}
            <div className="shrink-0 z-30">
                <ControlBar
                    isPlaying={isPlaying}
                    onPauseResume={handlePauseResume}
                    onSkip={handleSkip}
                    speed={speed}
                    onSpeedChange={handleSpeedChange}
                    onAskQuestion={handleAskQuestion}
                    currentSpeaker={currentSpeaker}
                    isSpeaking={isSpeaking}
                />
            </div>

            {/* JOIN MODAL */}
            <AnimatePresence>
                {showJoinModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                backgroundColor: '#1a1a2e',
                                border: '1px solid rgba(99,102,241,0.4)',
                                borderRadius: '20px',
                                padding: '32px',
                                width: '380px',
                                boxShadow: '0 0 40px rgba(99,102,241,0.3)'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎓</div>
                                <h2 style={{ color: 'white', margin: '0 0 8px', fontSize: '22px' }}>Join the Class!</h2>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
                                    Enter your name to become the 5th student. The teacher and classmates will respond to you personally!
                                </p>
                            </div>
                            <input
                                type="text"
                                value={joinNameInput}
                                onChange={e => setJoinNameInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleJoinAsStudent()}
                                placeholder="Your name..."
                                maxLength={20}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(99,102,241,0.4)',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none',
                                    marginBottom: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setShowJoinModal(false)}
                                    style={{
                                        flex: 1, padding: '12px',
                                        backgroundColor: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: 'rgba(255,255,255,0.6)',
                                        cursor: 'pointer', fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    onClick={handleJoinAsStudent}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!joinNameInput.trim()}
                                    style={{
                                        flex: 2, padding: '12px',
                                        background: joinNameInput.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.3)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: 'white',
                                        cursor: joinNameInput.trim() ? 'pointer' : 'not-allowed',
                                        fontSize: '14px',
                                        fontWeight: '700'
                                    }}
                                >
                                    🚀 Join Class!
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
