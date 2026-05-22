import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { TextureLoader } from 'three'
import { campusToWorld } from '../utils/world'

const createRainField = (campus, count) => {
  const positions = new Float32Array(count * 3)
  const speeds = new Float32Array(count)

  const [minX, , minZ] = campusToWorld(campus, 0, 0)
  const [maxX, , maxZ] = campusToWorld(campus, campus.width, campus.height)
  const lowX = Math.min(minX, maxX) - 4
  const highX = Math.max(minX, maxX) + 4
  const lowZ = Math.min(minZ, maxZ) - 4
  const highZ = Math.max(minZ, maxZ) + 4

  for (let i = 0; i < count; i += 1) {
    const base = i * 3
    positions[base] = lowX + Math.random() * (highX - lowX)
    positions[base + 1] = 4 + Math.random() * 18
    positions[base + 2] = lowZ + Math.random() * (highZ - lowZ)
    speeds[i] = 9 + Math.random() * 8
  }

  return {
    positions,
    speeds,
    bounds: { lowX, highX, lowZ, highZ },
  }
}

const Rain = ({ campus, intensity = 1800 }) => {
  const pointsRef = useRef(null)
  const rainTexture = useLoader(TextureLoader, '/Raindrop.jpeg')
  const { positions, speeds, bounds } = useMemo(
    () => createRainField(campus, intensity),
    [campus, intensity],
  )

  useFrame((state, delta) => {
    const driftX = Math.sin(state.clock.elapsedTime * 0.4) * 0.8
    const driftZ = Math.cos(state.clock.elapsedTime * 0.35) * 0.6

    for (let i = 0; i < speeds.length; i += 1) {
      const base = i * 3
      positions[base] += driftX * delta
      positions[base + 2] += driftZ * delta
      positions[base + 1] -= speeds[i] * delta

      if (positions[base + 1] < 0.1) {
        positions[base] =
          bounds.lowX + Math.random() * (bounds.highX - bounds.lowX)
        positions[base + 1] = 16 + Math.random() * 10
        positions[base + 2] =
          bounds.lowZ + Math.random() * (bounds.highZ - bounds.lowZ)
      }
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d9ecff"
        map={rainTexture}
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.75}
        alphaTest={0.2}
        depthWrite={false}
      />
    </points>
  )
}

export default Rain
