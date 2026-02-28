import { motion, AnimatePresence } from 'framer-motion'

const REACTIONS = {
    fast_learner: {
        active: { emoji: '✊', label: 'Pumping fist!', color: '#fbbf24' },
        mention: { emoji: '🙋', label: 'Pick me!', color: '#60a5fa' },
        idle: { emoji: '📚', label: 'Reading ahead', color: '#94a3b8' },
        joke: { emoji: '🙄', label: 'Eye roll', color: '#a78bfa' },
    },
    esl_student: {
        active: { emoji: '🤚', label: 'Raising hand!', color: '#4ade80' },
        mention: { emoji: '😅', label: 'Nervous!', color: '#fbbf24' },
        idle: { emoji: '📖', label: 'Looking up words', color: '#94a3b8' },
        joke: { emoji: '😕', label: 'Confused', color: '#f87171' },
    },
    distracted: {
        active: { emoji: '😂', label: 'LOL!', color: '#fb923c' },
        mention: { emoji: '😴', label: 'Waking up...', color: '#94a3b8' },
        idle: { emoji: '💤', label: 'Zzzz...', color: '#64748b' },
        joke: { emoji: '🤣', label: 'HAHA!', color: '#fbbf24' },
    },
    emotional: {
        active: { emoji: '🥺', label: 'Deeply moved', color: '#c084fc' },
        mention: { emoji: '💜', label: 'Feeling it...', color: '#a78bfa' },
        idle: { emoji: '💭', label: 'Overthinking', color: '#94a3b8' },
        joke: { emoji: '😤', label: 'Not funny!', color: '#f87171' },
    }
}

const HAIR_STYLES = {
    fast_learner: (
        <div style={{
            position: 'absolute', top: '-7px', left: '-2px',
            width: '52px', height: '22px',
            backgroundColor: '#4a2c0a',
            borderRadius: '50% 50% 0 0',
            zIndex: 4
        }}>
            {/* Spiky bits */}
            {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                    position: 'absolute', top: '-6px', left: `${4 + i * 11}px`,
                    width: '8px', height: '12px',
                    backgroundColor: '#4a2c0a',
                    borderRadius: '50% 50% 0 0',
                    transform: `rotate(${i % 2 === 0 ? -10 : 10}deg)`
                }} />
            ))}
        </div>
    ),
    esl_student: (
        <div style={{
            position: 'absolute', top: '-6px', left: '-3px',
            width: '54px', height: '20px',
            backgroundColor: '#111',
            borderRadius: '50% 50% 0 0',
            zIndex: 4
        }}>
            {/* Side part */}
            <div style={{
                position: 'absolute', top: '4px', left: '8px',
                width: '20px', height: '3px',
                backgroundColor: '#222',
                borderRadius: '2px'
            }} />
        </div>
    ),
    distracted: (
        <div style={{
            position: 'absolute',
            top: '-7px',
            left: '-2px',
            width: '50px',
            height: '20px',
            backgroundColor: '#6b3a1f',
            borderRadius: '50% 50% 0 0',
            zIndex: 4
        }}>
            <div style={{
                position: 'absolute',
                top: '-5px',
                right: '6px',
                width: '8px',
                height: '11px',
                backgroundColor: '#6b3a1f',
                borderRadius: '50%',
                transform: 'rotate(20deg)',
                transformOrigin: 'bottom center'
            }} />
        </div>
    ),
    emotional: (
        <div style={{
            position: 'absolute', top: '-6px', left: '-6px',
            width: '60px', height: '26px',
            backgroundColor: '#2c1810',
            borderRadius: '50% 50% 0 0',
            zIndex: 4
        }}>
            {/* Longer sides */}
            <div style={{
                position: 'absolute', top: '10px', left: '-2px',
                width: '8px', height: '16px',
                backgroundColor: '#2c1810',
                borderRadius: '0 0 4px 4px'
            }} />
            <div style={{
                position: 'absolute', top: '10px', right: '-2px',
                width: '8px', height: '16px',
                backgroundColor: '#2c1810',
                borderRadius: '0 0 4px 4px'
            }} />
        </div>
    )
}

const BODY_COLORS = {
    fast_learner: '#1a5276',
    esl_student: '#1e8449',
    distracted: '#784212',
    emotional: '#6c3483'
}

export default function StudentAvatar({ persona, isActive, subject, reactionType }) {
    if (!persona) return null

    const personality = persona.personality
    const reactions = REACTIONS[personality] || REACTIONS.fast_learner
    const bodyColor = BODY_COLORS[personality] || '#333'

    // Determine current reaction
    let currentReaction = null
    if (reactionType === 'joke') currentReaction = reactions.joke
    else if (isActive) currentReaction = reactions.active
    else if (reactionType === 'mention') currentReaction = reactions.mention
    else currentReaction = reactions.idle

    // Body bob when active
    const bobAnimation = isActive
        ? { y: [0, -8, 0], transition: { duration: 0.8, repeat: Infinity } }
        : reactionType === 'mention'
            ? { x: [0, -4, 4, 0], transition: { duration: 0.4, repeat: 2 } }
            : { scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity } }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>

            {/* Reaction bubble above avatar */}
            <AnimatePresence mode="wait">
                {(isActive || reactionType) && currentReaction && (
                    <motion.div
                        key={`${reactionType}-${isActive}`}
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: `2px solid ${currentReaction.color}`,
                            borderRadius: '12px',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                            boxShadow: `0 0 12px ${currentReaction.color}44`,
                            marginBottom: '2px',
                            zIndex: 10,
                            position: 'relative'
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>{currentReaction.emoji}</span>
                        <span style={{ color: currentReaction.color, fontSize: '10px', fontWeight: '700' }}>
                            {currentReaction.label}
                        </span>
                        {/* Bubble tail */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-7px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '0',
                            height: '0',
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: `6px solid ${currentReaction.color}`
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Avatar body */}
            <motion.div
                animate={bobAnimation}
                style={{
                    position: 'relative',
                    width: '64px',
                    height: '96px',
                }}
            >
                {/* Shadow */}
                <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '48px',
                    height: '8px',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    borderRadius: '50%',
                    filter: 'blur(3px)'
                }} />

                {/* Legs */}
                <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '34px',
                    height: '22px',
                    backgroundColor: bodyColor,
                    borderRadius: '3px 3px 6px 6px',
                    filter: 'brightness(0.7)'
                }} />

                {/* Body */}
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '46px',
                    height: '40px',
                    backgroundColor: bodyColor,
                    borderRadius: '10px 10px 4px 4px',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {/* Left arm */}
                    <div style={{
                        position: 'absolute', top: '6px', left: '-9px',
                        width: '9px', height: '24px',
                        backgroundColor: bodyColor,
                        borderRadius: '4px',
                        transform: isActive ? 'rotate(-20deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        transformOrigin: 'top center'
                    }} />
                    {/* Right arm */}
                    <div style={{
                        position: 'absolute', top: '6px', right: '-9px',
                        width: '9px', height: '24px',
                        backgroundColor: bodyColor,
                        borderRadius: '4px',
                        transform: isActive && personality === 'esl_student' ? 'rotate(-60deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        transformOrigin: 'top center'
                    }} />
                </div>

                {/* Neck */}
                <div style={{
                    position: 'absolute',
                    bottom: '61px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '14px',
                    height: '10px',
                    backgroundColor: '#f5cba7',
                    zIndex: 2
                }} />

                {/* Head */}
                <div style={{
                    position: 'absolute',
                    bottom: '65px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '44px',
                    height: '46px',
                    backgroundColor: '#f5cba7',
                    borderRadius: '50% 50% 45% 45%',
                    boxShadow: '1px 2px 4px rgba(0,0,0,0.25)',
                    zIndex: 3,
                    overflow: 'visible'
                }}>
                    {/* Hair */}
                    {HAIR_STYLES[personality]}

                    {/* Eyes */}
                    {/* Left eye */}
                    <div style={{
                        position: 'absolute', top: '16px', left: '6px',
                        width: '12px', height: '10px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        zIndex: 5
                    }}>
                        <div style={{
                            width: '5px', height: '5px',
                            backgroundColor: '#111',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: isActive ? '2px' : '3px',
                            left: isActive ? '3px' : '3px',
                            transition: 'all 0.2s'
                        }} />
                    </div>

                    {/* Right eye */}
                    <div style={{
                        position: 'absolute', top: '16px', right: '6px',
                        width: '12px', height: '10px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        zIndex: 5
                    }}>
                        <div style={{
                            width: '5px', height: '5px',
                            backgroundColor: '#111',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: isActive ? '2px' : '3px',
                            left: isActive ? '3px' : '3px',
                            transition: 'all 0.2s'
                        }} />
                    </div>

                    {/* Mouth */}
                    <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: personality === 'distracted'
                            ? (isActive ? '20px' : '12px')
                            : '14px',
                        height: personality === 'distracted'
                            ? (isActive ? '8px' : '5px')
                            : '6px',
                        borderBottom: isActive
                            ? `3px solid ${personality === 'emotional' ? '#c084fc' : '#c0392b'}`
                            : '2px solid #aaa',
                        borderRight: !isActive && personality === 'distracted' ? '2px solid #aaa' : 'none',
                        borderRadius: isActive
                            ? (personality === 'distracted' ? '0 0 12px 12px' : '0 0 8px 8px')
                            : (personality === 'distracted' ? '0 0 8px 0' : '0'),
                        transition: 'all 0.3s'
                    }} />

                    {/* Tears for emotional when active */}
                    {personality === 'emotional' && isActive && (
                        <>
                            <motion.div
                                animate={{ y: [0, 15], opacity: [1, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                style={{
                                    position: 'absolute', top: '24px', left: '9px',
                                    width: '4px', height: '4px',
                                    backgroundColor: '#60a5fa',
                                    borderRadius: '50%'
                                }}
                            />
                            <motion.div
                                animate={{ y: [0, 15], opacity: [1, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                                style={{
                                    position: 'absolute', top: '24px', right: '9px',
                                    width: '4px', height: '4px',
                                    backgroundColor: '#60a5fa',
                                    borderRadius: '50%'
                                }}
                            />
                        </>
                    )}

                    {/* Ears */}
                    <div style={{
                        position: 'absolute', top: '14px', left: '-5px',
                        width: '7px', height: '10px',
                        backgroundColor: '#f5cba7', borderRadius: '50%', zIndex: 2
                    }} />
                    <div style={{
                        position: 'absolute', top: '14px', right: '-5px',
                        width: '7px', height: '10px',
                        backgroundColor: '#f5cba7', borderRadius: '50%', zIndex: 2
                    }} />
                </div>

                {/* Sound wave when speaking */}
                {isActive && (
                    <div style={{
                        position: 'absolute', top: '-18px', left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', gap: '2px', alignItems: 'flex-end'
                    }}>
                        {[5, 10, 7, 12, 6].map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ scaleY: [0.4, 1.2, 0.4] }}
                                transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                                style={{
                                    width: '3px',
                                    height: `${h}px`,
                                    backgroundColor: currentReaction?.color || '#6366f1',
                                    borderRadius: '2px',
                                    transformOrigin: 'bottom'
                                }}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Name badge */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: `1px solid ${isActive ? (currentReaction?.color || '#6366f1') : 'rgba(255,255,255,0.1)'}`,
                color: isActive ? (currentReaction?.color || 'white') : 'rgba(255,255,255,0.5)',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px',
                letterSpacing: '1px',
                transition: 'all 0.3s',
                boxShadow: isActive ? `0 0 8px ${currentReaction?.color || '#6366f1'}44` : 'none'
            }}>
                {persona.name?.toUpperCase()}
            </div>

            {/* Personality label */}
            <div style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '10px',
                fontStyle: 'italic',
                textAlign: 'center'
            }}>
                {['⚡ Fast Learner', '🌍 ESL Student', '😄 Class Clown', '💜 Empath'][
                    ['fast_learner', 'esl_student', 'distracted', 'emotional'].indexOf(personality)
                ] || personality}
            </div>

        </div>
    )
}
