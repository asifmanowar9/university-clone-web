import { Canvas } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import './App.css'
import CampusScene from './components/CampusScene'
import { campusData } from './data/campus'

function App() {
  const [mode, setMode] = useState('day')
  const campus = useMemo(() => campusData, [])

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
        {mode === 'day' ? 'Switch to Night' : 'Switch to Day'}
      </button>
      <Canvas className="campus-canvas" shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <CampusScene campus={campus} mode={mode} />
      </Canvas>
    </div>
  )
}

export default App
