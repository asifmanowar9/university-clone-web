import { useMemo } from 'react'
import { campusToWorld, WORLD_SCALE } from '../utils/world'

const seededRandom = (seed) => {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

const Ground = ({ campus, isRain }) => {
  const groundSize = [campus.width * WORLD_SCALE, campus.height * WORLD_SCALE]
  const puddles = useMemo(() => {
    const items = []
    const count = 24

    for (let i = 0; i < count; i += 1) {
      const r1 = seededRandom(i * 12.7 + 1.1)
      const r2 = seededRandom(i * 8.3 + 7.4)
      const r3 = seededRandom(i * 15.6 + 3.8)
      const r4 = seededRandom(i * 5.9 + 9.1)
      const r5 = seededRandom(i * 3.2 + 4.6)
      const x = r1 * campus.width
      const y = r2 * campus.height
      const [worldX, , worldZ] = campusToWorld(campus, x, y)
      items.push({
        position: [worldX, 0.012, worldZ],
        radius: 0.25 + r3 * 0.65,
        stretch: 0.55 + r4 * 0.85,
        rotation: r5 * Math.PI,
      })
    }

    return items
  }, [campus])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={groundSize} />
        <meshStandardMaterial
          color={isRain ? '#c7d6c9' : '#d4e2d5'}
          roughness={isRain ? 0.72 : 0.95}
          metalness={isRain ? 0.12 : 0.05}
        />
      </mesh>
      {isRain && (
        <group>
          {puddles.map((puddle, index) => (
            <mesh
              key={`puddle-ground-${index}`}
              position={puddle.position}
              rotation={[-Math.PI / 2, 0, puddle.rotation]}
              scale={[puddle.stretch, 1, 1]}
            >
              <circleGeometry args={[puddle.radius, 24]} />
              <meshStandardMaterial
                color="#9db3c9"
                roughness={0.12}
                metalness={0.9}
                transparent
                opacity={0.6}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

export default Ground
