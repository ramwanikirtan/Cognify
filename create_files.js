import fs from 'fs';
import path from 'path';
const files = [
    'src/components/avatars/StudentAvatar.jsx',
    'src/components/avatars/TeacherAvatar.jsx',
    'src/components/classroom/Blackboard.jsx',
    'src/components/classroom/ChatBubble.jsx',
    'src/components/classroom/StudentDesk.jsx',
    'src/components/classroom/TeacherArea.jsx',
    'src/components/classroom/TypingAnimation.jsx',
    'src/components/controls/ControlBar.jsx',
    'src/components/evaluation/AnimatedReveal.jsx',
    'src/components/evaluation/EvalDashboard.jsx',
    'src/components/evaluation/ScoreCard.jsx',
    'src/store/classroomStore.js',
    'src/services/openaiService.js',
    'src/services/speechService.js',
    'src/services/analyticsService.js',
    'src/data/personas.js',
    'src/data/subjects.js',
    'src/utils/helpers.js'
];
files.forEach(f => {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, '');
});
