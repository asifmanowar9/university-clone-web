import { Canvas } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import './App.css'
import CampusScene from './components/CampusScene'
import { campusData } from './data/campus'

function App() {
  const [mode, setMode] = useState('day')
  const campus = useMemo(() => campusData, [])
  const modeOrder = ['day', 'night', 'rain']
  const modeLabels = {
    day: 'Switch to Night',
    night: 'Switch to Rain',
    rain: 'Switch to Day',
  }

  return (
    <div className="app">
      <button
        type="button"
        onClick={() =>
          setMode((prev) => {
            const nextIndex = (modeOrder.indexOf(prev) + 1) % modeOrder.length
            return modeOrder[nextIndex]
          })
        }
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
      <Canvas className="campus-canvas" shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <CampusScene campus={campus} mode={mode} />
      </Canvas>
    </div>
  )
}

export default App
