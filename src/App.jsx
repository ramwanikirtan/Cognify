import { useState } from 'react'
import LandingScreen from './screens/LandingScreen'
import ClassroomScreen from './screens/ClassroomScreen'
import EvaluationScreen from './screens/EvaluationScreen'

function App() {
  const [screen, setScreen] = useState('landing')

  return (
    <div className="w-full min-h-screen bg-gray-900">
      {screen === 'landing' && <LandingScreen onStart={() => setScreen('classroom')} />}
      {screen === 'classroom' && <ClassroomScreen onEnd={() => setScreen('evaluation')} />}
      {screen === 'evaluation' && <EvaluationScreen onRestart={() => setScreen('landing')} />}
    </div>
  )
}

export default App
