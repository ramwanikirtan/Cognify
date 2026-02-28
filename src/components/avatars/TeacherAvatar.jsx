export default function TeacherAvatar({ persona, isActive, subject }) {
    const accentColor = subject?.themeColors?.accent || '#e74c3c'

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
        }}>
            {/* Outer wrapper with bob animation */}
            <div style={{
                animation: isActive ? 'teacherBob 1s ease-in-out infinite' : 'none',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.3s ease',
                position: 'relative',
                width: '90px',
                height: '130px',
            }}>

                {/* SHADOW */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '70px',
                    height: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '50%',
                    filter: 'blur(4px)'
                }} />

                {/* LEGS */}
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '44px',
                    height: '30px',
                    backgroundColor: '#1a2a4a',
                    borderRadius: '4px 4px 8px 8px',
                }} />

                {/* BODY / SUIT */}
                <div style={{
                    position: 'absolute',
                    bottom: '34px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '56px',
                    height: '50px',
                    backgroundColor: '#1e3a5f',
                    borderRadius: '10px 10px 4px 4px',
                    boxShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                }}>
                    {/* Shirt collar */}
                    <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '16px',
                        height: '20px',
                        backgroundColor: 'white',
                        borderRadius: '2px',
                    }} />
                    {/* TIE */}
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '8px',
                        height: '22px',
                        backgroundColor: accentColor,
                        borderRadius: '2px 2px 4px 4px',
                        zIndex: 2
                    }} />
                    {/* Left arm */}
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '-12px',
                        width: '12px',
                        height: '36px',
                        backgroundColor: '#1e3a5f',
                        borderRadius: '6px',
                    }} />
                    {/* Right arm */}
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '-12px',
                        width: '12px',
                        height: '36px',
                        backgroundColor: '#1e3a5f',
                        borderRadius: '6px',
                    }} />
                </div>

                {/* NECK */}
                <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '14px',
                    height: '10px',
                    backgroundColor: '#f5cba7',
                }} />

                {/* HEAD */}
                <div style={{
                    position: 'absolute',
                    bottom: '82px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '52px',
                    height: '54px',
                    backgroundColor: '#f5cba7',
                    borderRadius: '50% 50% 45% 45%',
                    boxShadow: '2px 3px 6px rgba(0,0,0,0.3)',
                    zIndex: 3
                }}>
                    {/* HAIR */}
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '-3px',
                        width: '58px',
                        height: '30px',
                        backgroundColor: '#4a2c0a',
                        borderRadius: '50% 50% 0 0',
                        zIndex: 4
                    }} />

                    {/* GLASSES LEFT */}
                    <div style={{
                        position: 'absolute',
                        top: '18px',
                        left: '5px',
                        width: '16px',
                        height: '12px',
                        border: '2px solid #333',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(150,200,255,0.15)',
                        zIndex: 5
                    }}>
                        {/* Eye left */}
                        <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: '3px'
                        }}>
                            <div style={{
                                width: '3px',
                                height: '3px',
                                backgroundColor: '#111',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '1px',
                                left: isActive ? '1px' : '0px'
                            }} />
                        </div>
                    </div>

                    {/* Glasses bridge */}
                    <div style={{
                        position: 'absolute',
                        top: '22px',
                        left: '21px',
                        width: '10px',
                        height: '2px',
                        backgroundColor: '#333',
                        zIndex: 5
                    }} />

                    {/* GLASSES RIGHT */}
                    <div style={{
                        position: 'absolute',
                        top: '18px',
                        right: '5px',
                        width: '16px',
                        height: '12px',
                        border: '2px solid #333',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(150,200,255,0.15)',
                        zIndex: 5
                    }}>
                        {/* Eye right */}
                        <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: '3px'
                        }}>
                            <div style={{
                                width: '3px',
                                height: '3px',
                                backgroundColor: '#111',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '1px',
                                left: isActive ? '1px' : '0px'
                            }} />
                        </div>
                    </div>

                    {/* MOUTH */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '18px',
                        height: '7px',
                        borderBottom: isActive ? '3px solid #c0392b' : '2px solid #999',
                        borderRadius: isActive ? '0 0 10px 10px' : '0',
                        zIndex: 5
                    }} />

                    {/* EARS */}
                    <div style={{
                        position: 'absolute',
                        top: '18px',
                        left: '-6px',
                        width: '8px',
                        height: '12px',
                        backgroundColor: '#f5cba7',
                        borderRadius: '50%',
                        zIndex: 2
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '18px',
                        right: '-6px',
                        width: '8px',
                        height: '12px',
                        backgroundColor: '#f5cba7',
                        borderRadius: '50%',
                        zIndex: 2
                    }} />
                </div>

                {/* Speaking indicator */}
                {isActive && (
                    <div style={{
                        position: 'absolute',
                        top: '-16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '3px',
                        alignItems: 'flex-end'
                    }}>
                        {[8, 14, 10, 16, 8].map((h, i) => (
                            <div key={i} style={{
                                width: '3px',
                                height: `${h}px`,
                                backgroundColor: subject?.themeColors?.accent || '#6366f1',
                                borderRadius: '2px',
                                animation: `soundWave 0.6s ease-in-out ${i * 0.1}s infinite alternate`
                            }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Name badge */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '2px 10px',
                borderRadius: '999px',
                letterSpacing: '1px'
            }}>
                MR. NOVA
            </div>

            {/* CSS animations */}
            <style>{`
        @keyframes teacherBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes soundWave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1.2); }
        }
      `}</style>
        </div>
    )
}
