const ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY

const VOICES = {
    teacher: {
        voice_id: 'onwK4e9ZLuTAKqWW03F9',
        stability: 0.55,
        similarity_boost: 0.75,
        style: 0.25,
        speed: 1.15,
        label: 'Daniel - British Teacher'
    },
    ali: {
        voice_id: 'N2lVS1w4EtoT3dr4eOWO',
        stability: 0.40,
        similarity_boost: 0.80,
        style: 0.75,
        speed: 1.20,
        label: 'Callum - Energetic Fast Learner'
    },
    kirtan: {
        voice_id: 'IKne3meq5aSn9XLyUdCD',
        stability: 0.90,
        similarity_boost: 0.70,
        style: 0.10,
        speed: 0.78,
        label: 'Charlie - Calm Careful ESL'
    },
    tayyab: {
        voice_id: 'TX3LPaxmHKxFdv7VOQHJ',
        stability: 0.20,
        similarity_boost: 0.85,
        style: 0.95,
        speed: 1.30,
        label: 'Liam - Hyper Class Clown'
    },
    rana: {
        voice_id: 'bIHbv24MWmeRgasZH58o',
        stability: 0.92,
        similarity_boost: 0.78,
        style: 0.30,
        speed: 0.88,
        label: 'Will - Soft Thoughtful Rana'
    }
}

let currentAudio = null

async function speakWithElevenLabs(text, speakerId) {
    const config = VOICES[speakerId] || VOICES.teacher
    console.log(`[ElevenLabs] Speaking as ${config.label}:`, text.slice(0, 40))

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.voice_id}`,
        {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: config.stability,
                    similarity_boost: config.similarity_boost,
                    style: config.style,
                    use_speaker_boost: true
                }
            })
        }
    )

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`ElevenLabs ${response.status}: ${err}`)
    }

    const audioBlob = await response.blob()
    console.log('[ElevenLabs] Success, audio size:', audioBlob.size, 'bytes for speaker:', speakerId)
    if (audioBlob.size === 0) throw new Error('Empty audio blob')

    if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
    }

    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    currentAudio = audio
    audio.playbackRate = config.speed || 1.0

    return new Promise((resolve) => {
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (currentAudio === audio) currentAudio = null;
            resolve()
        }
        audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            if (currentAudio === audio) currentAudio = null;
            resolve()
        }
        audio.play().catch(() => {
            URL.revokeObjectURL(audioUrl);
            if (currentAudio === audio) currentAudio = null;
            resolve()
        })
        setTimeout(() => resolve(), 60000)
    })
}

function speakWithBrowserTTS(text, speakerId) {
    const PROFILES = {
        teacher: { pitch: 0.6, rate: 0.80 },
        ali: { pitch: 1.5, rate: 1.20 },
        kirtan: { pitch: 0.55, rate: 0.72 },
        tayyab: { pitch: 1.8, rate: 1.35 },
        rana: { pitch: 0.95, rate: 0.85 },
    }
    return new Promise((resolve) => {
        try {
            if (!window.speechSynthesis) { resolve(); return }
            window.speechSynthesis.cancel()
            const profile = PROFILES[speakerId] || PROFILES.teacher
            const chunks = text.match(/[^.!?]+[.!?]+/g) || [text]
            let index = 0
            function next() {
                if (index >= chunks.length) { resolve(); return }
                const u = new SpeechSynthesisUtterance(chunks[index++])
                u.pitch = profile.pitch
                u.rate = profile.rate
                u.volume = 1.0
                u.lang = 'en-US'
                u.onend = next
                u.onerror = next
                window.speechSynthesis.speak(u)
            }
            next()
            setTimeout(() => resolve(), 40000)
        } catch (e) { resolve() }
    })
}

function speakWithResponsiveVoice(text, speakerId) {
    const MAP = {
        teacher: { voice: 'UK English Male', rate: 0.85, pitch: 0.7 },
        ali: { voice: 'US English Male', rate: 1.2, pitch: 1.4 },
        kirtan: { voice: 'Australian Male', rate: 0.78, pitch: 0.65 },
        tayyab: { voice: 'US English Male', rate: 1.3, pitch: 1.7 },
        rana: { voice: 'UK English Male', rate: 0.88, pitch: 1.0 },
    }
    return new Promise((resolve) => {
        try {
            if (typeof window.responsiveVoice === 'undefined') { resolve(); return }
            const p = MAP[speakerId] || MAP.teacher
            window.responsiveVoice.speak(text, p.voice, {
                rate: p.rate, pitch: p.pitch, volume: 1,
                onend: () => resolve(), onerror: () => resolve()
            })
            setTimeout(() => resolve(), 40000)
        } catch (e) { resolve() }
    })
}

export async function speakText(text, speakerId = 'teacher') {
    if (!text || text.trim().length === 0) return

    let id = speakerId
    if (speakerId && (speakerId.includes('Neural') || speakerId.includes('en-US'))) {
        id = 'teacher'
    }

    // Priority 1: ElevenLabs — genuinely distinct voices
    if (ELEVENLABS_KEY && ELEVENLABS_KEY.length > 10 && ELEVENLABS_KEY !== 'your_key_here') {
        try {
            await speakWithElevenLabs(text, id)
            return
        } catch (e) {
            console.warn('[TTS] ElevenLabs failed:', e.message, '— trying fallback')
        }
    }

    // Priority 2: ResponsiveVoice
    if (typeof window.responsiveVoice !== 'undefined') {
        return speakWithResponsiveVoice(text, id)
    }

    // Priority 3: Browser TTS
    return speakWithBrowserTTS(text, id)
}

export function stopSpeaking() {
    try {
        if (currentAudio) {
            console.log('[TTS] Stopping current audio object')
            currentAudio.pause()
            currentAudio.src = ''
            currentAudio = null
        }
        document.querySelectorAll('audio').forEach(a => {
            a.pause()
            a.src = ''
        })
        if (typeof window.responsiveVoice !== 'undefined') window.responsiveVoice.cancel()
        if (window.speechSynthesis) {
            console.log('[TTS] Cancelling browser speech')
            window.speechSynthesis.cancel()
        }
    } catch (e) {
        console.warn('[TTS] Error in stopSpeaking:', e)
    }
}

export async function fetchAudioBlob(text, speakerId = 'teacher') {
    if (!ELEVENLABS_KEY || ELEVENLABS_KEY.length < 10) {
        throw new Error('No ElevenLabs key')
    }

    const config = VOICES[speakerId] || VOICES.teacher
    console.log('[ElevenLabs] Pre-fetching audio for:', speakerId)

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.voice_id}`,
        {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: config.stability,
                    similarity_boost: config.similarity_boost,
                    style: config.style,
                    use_speaker_boost: true
                }
            })
        }
    )

    if (!response.ok) throw new Error(`ElevenLabs ${response.status}`)
    const blob = await response.blob()
    if (blob.size === 0) throw new Error('Empty blob')
    console.log('[ElevenLabs] Audio pre-fetched, size:', blob.size)
    return blob
}

export function playAudioBlob(blob, speakerId = 'teacher') {
    const config = VOICES[speakerId] || VOICES.teacher
    return new Promise((resolve) => {
        try {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.src = '';
            }

            const audioUrl = URL.createObjectURL(blob)
            const audio = new Audio(audioUrl)
            currentAudio = audio
            audio.playbackRate = config.speed || 1.0

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                if (currentAudio === audio) currentAudio = null;
                resolve()
            }
            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                if (currentAudio === audio) currentAudio = null;
                resolve()
            }
            audio.play().catch(() => {
                if (currentAudio === audio) currentAudio = null;
                resolve()
            })

            setTimeout(() => {
                if (currentAudio === audio) {
                    currentAudio.pause();
                    currentAudio = null;
                    resolve();
                }
            }, 60000)
        } catch (e) {
            resolve()
        }
    })
}

export function createSynthesizer() { return null }

export function getVoiceForSpeaker(speakerId) {
    return speakerId || 'teacher'
}
