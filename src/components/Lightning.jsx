import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

const Lightning = ({ isActive }) => {
  const lightRef = useRef(null)
  const flashRef = useRef(null)
  const nextFlashRef = useRef(0)

  useFrame((state) => {
    const light = lightRef.current
    if (!light) return

    const time = state.clock.elapsedTime

    if (!isActive) {
      light.intensity = 0
      flashRef.current = null
      nextFlashRef.current = time + 2
      return
    }

    if (!flashRef.current && time >= nextFlashRef.current) {
      const duration = 0.18 + Math.random() * 0.28
      const peak = 1.8 + Math.random() * 3.2
      flashRef.current = { start: time, duration, peak }
      nextFlashRef.current = time + 3 + Math.random() * 6
    }

    if (flashRef.current) {
      const progress = (time - flashRef.current.start) / flashRef.current.duration
      if (progress >= 1) {
        flashRef.current = null
        light.intensity = 0
      } else {
        const pulse = Math.sin(progress * Math.PI)
        const flicker = 0.85 + Math.sin(time * 60) * 0.15
        light.intensity = flashRef.current.peak * Math.pow(pulse, 1.6) * flicker
      }
    } else {
      light.intensity = 0
    }
  })

  return (
    <pointLight
      ref={lightRef}
      position={[0, 18, 0]}
      color="#e8f4ff"
      intensity={0}
      distance={120}
      decay={2}
    />
  )
}

export default Lightning
