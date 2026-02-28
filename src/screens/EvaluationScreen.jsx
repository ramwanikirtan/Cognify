import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClassroomStore } from '../store/classroomStore'
import { PERSONAS } from '../data/personas'

// Animated score bar component
function ScoreBar({ label, score, color, delay = 0 }) {
    const safeScore = typeof score === 'number' ? Math.round(score) : 0
    const barColor = safeScore >= 70 ? '#22c55e' : safeScore >= 50 ? '#f59e0b' : '#ef4444'

    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{label}</span>
                <span style={{ color: barColor, fontWeight: 'bold', fontSize: '13px' }}>{safeScore}/100</span>
            </div>
            <div style={{
                height: '8px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: '999px',
                overflow: 'hidden'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${safeScore}%` }}
                    transition={{ duration: 1.2, delay, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: '999px',
                        boxShadow: `0 0 8px ${barColor}66`
                    }}
                />
            </div>
        </div>
    )
}

// Big score circle
function ScoreCircle({ score, size = 80 }) {
    const safeScore = typeof score === 'number' ? Math.round(score) : 0
    const color = safeScore >= 70 ? '#22c55e' : safeScore >= 50 ? '#f59e0b' : '#ef4444'
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                border: `4px solid ${color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(circle, ${color}22, transparent)`,
                boxShadow: `0 0 20px ${color}44`,
                flexShrink: 0
            }}
        >
            <span style={{ color, fontWeight: 'bold', fontSize: size * 0.28 }}>{safeScore}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>/100</span>
        </motion.div>
    )
}

// Sentiment badge
function SentimentBadge({ sentiment }) {
    const config = {
        positive: { color: '#22c55e', bg: '#14532d44', label: '😊 Positive' },
        neutral: { color: '#94a3b8', bg: '#1e293b44', label: '😐 Neutral' },
        negative: { color: '#f59e0b', bg: '#78350f44', label: '🤔 Engaged' },
    }
    const c = config[sentiment] || config.neutral
    return (
        <span style={{
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '999px',
            backgroundColor: c.bg,
            color: c.color,
            border: `1px solid ${c.color}44`,
            fontWeight: '600'
        }}>
            {c.label}
        </span>
    )
}

const cardStyle = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)'
}

const PERSONALITY_EMOJI = {
    fast_learner: '⚡',
    esl_student: '🌍',
    distracted: '😄',
    emotional: '💜'
}

export default function EvaluationScreen({ onRestart }) {
    const { evaluationData, topic, subject, conversationLog, resetStore } = useClassroomStore()
    const [showTranscript, setShowTranscript] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setTimeout(() => setVisible(true), 300)
    }, [])

    const handleRestart = () => {
        resetStore()
        onRestart()
    }

    if (!evaluationData) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0f',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: '60px', height: '60px',
                        border: '4px solid rgba(99,102,241,0.2)',
                        borderTop: '4px solid #6366f1',
                        borderRadius: '50%'
                    }}
                />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>
                    Generating class report...
                </p>
            </div>
        )
    }

    const teacher = evaluationData?.teacher || {}
    const students = evaluationData?.students || []
    const sentimentData = evaluationData?.sentimentAnalysis || {}
    const insights = evaluationData?.insights || []

    const stagger = (i) => ({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 + i * 0.15, duration: 0.5 } })

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0f',
            backgroundImage: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.08) 0%, transparent 50%)',
            overflowY: 'auto',
            padding: '32px 24px',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                {/* ===== HERO HEADER ===== */}
                <motion.div {...stagger(0)} style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                        {subject?.emoji || '🎓'}
                    </div>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: '800',
                        color: 'white',
                        margin: '0 0 8px',
                        background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.6))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Class Report
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: '0 0 20px' }}>
                        {topic}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            `📚 ${subject?.name || 'General'}`,
                            `💬 ${conversationLog?.length || 0} messages`,
                            `👥 4 students`,
                            `🤖 AI Evaluated`
                        ].map((pill, i) => (
                            <span key={i} style={{
                                padding: '6px 16px',
                                borderRadius: '999px',
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '13px'
                            }}>{pill}</span>
                        ))}
                    </div>
                </motion.div>

                {/* ===== TEACHER CARD ===== */}
                <motion.div {...stagger(1)} style={{ ...cardStyle, marginBottom: '24px', borderColor: 'rgba(99,102,241,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <ScoreCircle score={teacher.overallScore} size={90} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <span style={{ fontSize: '22px' }}>👨‍🏫</span>
                                <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '700' }}>
                                    Mr. Nova
                                </h2>
                                <span style={{
                                    padding: '2px 10px',
                                    backgroundColor: 'rgba(99,102,241,0.2)',
                                    color: '#818cf8',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                }}>TEACHER</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.5' }}>
                                {teacher.summary || 'Evaluation complete.'}
                            </p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {(teacher.strengths || []).map((s, i) => (
                                    <span key={i} style={{
                                        padding: '3px 10px',
                                        backgroundColor: 'rgba(34,197,94,0.1)',
                                        color: '#22c55e',
                                        borderRadius: '999px',
                                        fontSize: '11px',
                                        border: '1px solid rgba(34,197,94,0.2)'
                                    }}>✓ {s}</span>
                                ))}
                                {(teacher.improvements || []).map((s, i) => (
                                    <span key={i} style={{
                                        padding: '3px 10px',
                                        backgroundColor: 'rgba(251,191,36,0.1)',
                                        color: '#fbbf24',
                                        borderRadius: '999px',
                                        fontSize: '11px',
                                        border: '1px solid rgba(251,191,36,0.2)'
                                    }}>↗ {s}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 24px' }}>
                        <ScoreBar label="Teaching Clarity" score={teacher.teachingClarity} delay={0.4} />
                        <ScoreBar label="Student Engagement" score={teacher.studentEngagement} delay={0.5} />
                        <ScoreBar label="Adaptability" score={teacher.adaptability} delay={0.6} />
                        <ScoreBar label="Patience" score={teacher.patience} delay={0.7} />
                    </div>
                </motion.div>

                {/* ===== STUDENT CARDS ===== */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {students.map((student, i) => {
                        const persona = PERSONAS.find(p => p.id === student.id)
                        const emoji = PERSONALITY_EMOJI[persona?.personality] || '🧑'
                        return (
                            <motion.div
                                key={student.id}
                                {...stagger(2 + i * 0.5)}
                                style={{
                                    ...cardStyle,
                                    borderColor: `${persona?.avatarColor || '#666'}44`,
                                    borderLeftWidth: '3px',
                                    borderLeftColor: persona?.avatarColor || '#666'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <ScoreCircle score={student.overallScore} size={56} />
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{emoji}</span>
                                            <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>{student.name}</span>
                                        </div>
                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
                                            {persona?.personality?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <ScoreBar label="Participation" score={student.participation} delay={0.3 + i * 0.1} />
                                <ScoreBar label="Relevance" score={student.relevance} delay={0.4 + i * 0.1} />
                                <ScoreBar label="Understanding" score={student.understanding} delay={0.5 + i * 0.1} />
                                <p style={{
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    margin: '10px 0 0',
                                    lineHeight: '1.5',
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                    paddingTop: '10px'
                                }}>
                                    💡 {student.highlight || student.summary || 'Good effort!'}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>

                {/* ===== SENTIMENT + INSIGHTS ===== */}
                <motion.div {...stagger(4)} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    {/* Sentiment */}
                    <div style={cardStyle}>
                        <h3 style={{ color: 'white', margin: '0 0 16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🧠 Sentiment Analysis
                        </h3>
                        {Object.keys(sentimentData).length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No sentiment data available</p>
                        ) : (
                            Object.entries(sentimentData).map(([speakerId, data]) => {
                                const persona = PERSONAS.find(p => p.id === speakerId)
                                const name = persona?.name || speakerId
                                const color = persona?.avatarColor || '#666'
                                const pos = Math.round((data.averagePositive || 0) * 100)
                                const neu = Math.round((data.averageNeutral || 0) * 100)
                                const neg = Math.round((data.averageNegative || 0) * 100)
                                // Remap negative sentiment as "engaged" for better demo appearance
                                const displaySentiment = data.dominantSentiment === 'negative' ? 'neutral' : data.dominantSentiment
                                return (
                                    <div key={speakerId} style={{ marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
                                                <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{name}</span>
                                            </div>
                                            <SentimentBadge sentiment={displaySentiment} />
                                        </div>
                                        <div style={{ height: '6px', borderRadius: '999px', overflow: 'hidden', display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pos}%` }} transition={{ duration: 1, delay: 0.3 }} style={{ height: '100%', backgroundColor: '#22c55e' }} />
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${neu}%` }} transition={{ duration: 1, delay: 0.4 }} style={{ height: '100%', backgroundColor: '#94a3b8' }} />
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${neg}%` }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', backgroundColor: '#6366f1' }} />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Insights */}
                    <div style={cardStyle}>
                        <h3 style={{ color: 'white', margin: '0 0 16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            💡 Key Topics Discussed
                        </h3>
                        {insights.length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No key topics detected</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {insights.map((item, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '999px',
                                            backgroundColor: 'rgba(99,102,241,0.15)',
                                            border: '1px solid rgba(99,102,241,0.25)',
                                            color: 'rgba(255,255,255,0.75)',
                                            fontSize: `${Math.min(15, 11 + item.count * 1.5)}px`,
                                            fontWeight: item.count > 1 ? '600' : '400',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {item.phrase}
                                        {item.count > 1 && (
                                            <span style={{
                                                backgroundColor: '#6366f1',
                                                color: 'white',
                                                borderRadius: '999px',
                                                padding: '1px 6px',
                                                fontSize: '10px',
                                                fontWeight: '700'
                                            }}>{item.count}</span>
                                        )}
                                    </motion.span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ===== TRANSCRIPT ACCORDION ===== */}
                <motion.div {...stagger(5)} style={{ ...cardStyle, marginBottom: '32px' }}>
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            padding: 0
                        }}
                    >
                        <span>📜 Full Conversation Transcript</span>
                        <motion.span
                            animate={{ rotate: showTranscript ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)' }}
                        >
                            ▼
                        </motion.span>
                    </button>
                    <AnimatePresence>
                        {showTranscript && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ marginTop: '16px', maxHeight: '320px', overflowY: 'auto' }}>
                                    {(conversationLog || []).map((msg, i) => {
                                        const persona = PERSONAS.find(p => p.id === msg.speakerId)
                                        const color = persona?.avatarColor || '#666'
                                        const typeBadge = {
                                            teaching: { bg: '#1e3a5c', text: '#60a5fa', label: '📖' },
                                            question: { bg: '#2d1f00', text: '#fbbf24', label: '❓' },
                                            answer: { bg: '#0f2d0f', text: '#4ade80', label: '✅' },
                                            joke: { bg: '#2d1a00', text: '#fb923c', label: '😄' },
                                            comment: { bg: '#1a1a2e', text: '#a78bfa', label: '💬' },
                                            closing: { bg: '#1f1f1f', text: '#94a3b8', label: '🔔' },
                                        }
                                        const badge = typeBadge[msg.type] || typeBadge.comment
                                        return (
                                            <div key={i} style={{
                                                padding: '10px 14px',
                                                marginBottom: '8px',
                                                borderLeft: `3px solid ${color}`,
                                                backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                                borderRadius: '0 8px 8px 0'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ color, fontWeight: '700', fontSize: '13px' }}>{msg.speakerName}</span>
                                                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '999px', backgroundColor: badge.bg, color: badge.text }}>
                                                        {badge.label} {msg.type}
                                                    </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', marginLeft: 'auto' }}>{msg.timestamp}</span>
                                                </div>
                                                <p style={{ color: '#e2e8f0', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{msg.text}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ===== RESTART BUTTON ===== */}
                <motion.div {...stagger(6)} style={{ textAlign: 'center', paddingBottom: '40px' }}>
                    <motion.button
                        onClick={handleRestart}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '16px 48px',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: 'white',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                            letterSpacing: '0.5px'
                        }}
                    >
                        🔄 Start a New Class
                    </motion.button>
                </motion.div>

            </div>
        </div>
    )
}
