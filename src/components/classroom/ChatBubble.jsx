export default function ChatBubble({ message, personas }) {
    const persona = message?.speakerId === 'observer'
        ? { avatarColor: '#6366f1', name: message.speakerName }
        : personas?.find(p => p.id === message?.speakerId)

    return (
        <div style={{ padding: '8px 12px', marginBottom: 8, borderLeft: `3px solid ${persona?.avatarColor || '#666'}` }}>
            <span style={{ color: persona?.avatarColor || 'white', fontWeight: 'bold', fontSize: 13 }}>{message?.speakerName}: </span>
            <span style={{ color: '#e2e8f0', fontSize: 13 }}>{message?.text}</span>
        </div>
    )
}
