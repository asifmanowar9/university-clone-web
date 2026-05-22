import { Canvas } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import './App.css'
import CampusScene from './components/CampusScene'
import { campusData } from './data/campus'

function App() {
  const [mode, setMode] = useState('day')
  const [isRain, setIsRain] = useState(false)
  const campus = useMemo(() => campusData, [])
  const modeLabels = {
    day: 'Switch to Night',
    night: 'Switch to Day',
  }

  return (
    <div className="app">
      <button
        type="button"
        onClick={() => setMode((prev) => (prev === 'day' ? 'night' : 'day'))}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 5,
          padding: '8px 12px',
          borderRadius: '999px',
          border: '1px solid rgba(0,0,0,0.2)',
          background: 'rgba(255,255,255,0.9)',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {modeLabels[mode]}
      </button>
      <button
        type="button"
        onClick={() => setIsRain((prev) => !prev)}
        style={{
          position: 'absolute',
          top: 20,
          left: 160,
          zIndex: 5,
          padding: '8px 12px',
          borderRadius: '999px',
          border: '1px solid rgba(0,0,0,0.2)',
          background: 'rgba(255,255,255,0.9)',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {isRain ? 'Stop Rain' : 'Start Rain'}
      </button>
      <Canvas className="campus-canvas" shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <CampusScene campus={campus} mode={mode} isRain={isRain} />
      </Canvas>
    </div>
  )
}

export default App
