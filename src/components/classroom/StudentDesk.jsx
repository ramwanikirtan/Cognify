export default function StudentDesk({ persona, isActive, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {children}
        </div>
    )
}
