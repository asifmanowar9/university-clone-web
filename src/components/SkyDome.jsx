import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { BackSide } from 'three'

const SkyDome = ({ isNight, isRain }) => {
  const meshRef = useRef(null)
  const { camera } = useThree()
  const color = isNight ? '#0f172a' : isRain ? '#b9c6d8' : '#00BFFF'

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position)
    }
  })

  return (
    <mesh ref={meshRef} scale={320}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshBasicMaterial side={BackSide} depthWrite={false} color={color} />
    </mesh>
  )
}

export default SkyDome
