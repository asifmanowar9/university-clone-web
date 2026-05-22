import { useMemo } from 'react'
import { campusToWorld, rectToWorld } from '../utils/world'

const seededRandom = (seed) => {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

const Roads = ({ campus, isRain }) => {
  const puddles = useMemo(() => {
    const items = []

    campus.paths.forEach((path, pathIndex) => {
      const count = Math.max(2, Math.floor((path.w * path.h) / 90000))
      for (let i = 0; i < count; i += 1) {
        const seed = (pathIndex + 1) * 100 + i * 17
        const r1 = seededRandom(seed + 1.4)
        const r2 = seededRandom(seed + 5.9)
        const r3 = seededRandom(seed + 8.1)
        const r4 = seededRandom(seed + 3.6)
        const r5 = seededRandom(seed + 11.2)
        const x = path.x + r1 * path.w
        const y = path.y + r2 * path.h
        const [worldX, , worldZ] = campusToWorld(campus, x, y)
        items.push({
          key: `road-${pathIndex}-${i}`,
          position: [worldX, 0.02, worldZ],
          radius: 0.18 + r3 * 0.35,
          stretch: 0.6 + r4 * 0.7,
          rotation: r5 * Math.PI,
        })
      }
    })

    return items
  }, [campus])

  return (
    <group>
      {campus.paths.map((path, index) => {
        const { position, size } = rectToWorld(campus, path)
        return (
          <mesh
            key={`road-${index}`}
            position={[position[0], 0.01, position[2]]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[size[0], size[1]]} />
            <meshStandardMaterial
              color={isRain ? '#1f242a' : '#2f3338'}
              roughness={isRain ? 0.35 : 0.85}
              metalness={isRain ? 0.4 : 0.2}
            />
          </mesh>
        )
      })}
      {isRain && (
        <group>
          {puddles.map((puddle) => (
            <mesh
              key={`puddle-${puddle.key}`}
              position={puddle.position}
              rotation={[-Math.PI / 2, 0, puddle.rotation]}
              scale={[puddle.stretch, 1, 1]}
            >
              <circleGeometry args={[puddle.radius, 20]} />
              <meshStandardMaterial
                color="#a8bfd6"
                roughness={0.08}
                metalness={0.95}
                transparent
                opacity={0.65}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

export default Roads
