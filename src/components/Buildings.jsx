import { useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import { RepeatWrapping, TextureLoader } from 'three'
import { rectToWorld, WORLD_SCALE } from '../utils/world'

const Buildings = ({ campus }) => {
  const brickTexture = useLoader(TextureLoader, '/brick.jpg')
  brickTexture.wrapS = RepeatWrapping
  brickTexture.wrapT = RepeatWrapping
  const brickTextures = useMemo(() => {
    return campus.buildings.reduce((acc, building) => {
      const texture = brickTexture.clone()
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.needsUpdate = true
      acc[building.id] = texture
      return acc
    }, {})
  }, [brickTexture, campus.buildings])

  return campus.buildings.map((building) => {
    const { position, size } = rectToWorld(campus, building.rect)
    const height = building.id === 'classrooms' ? 3.5 : 2.8
    const repeatX = Math.max(1, Math.round(size[0] * 2.2))
    const repeatY = Math.max(1, Math.round(height * 2.4))
    const buildingTexture = brickTextures[building.id] ?? brickTexture
    buildingTexture.repeat.set(repeatX, repeatY)
    const windowColumns = Math.max(2, Math.floor(size[0] / 2.0))
    const windowRows = Math.max(1, Math.floor((height - 1.2) / 1.3))
    const windowSpacingX = size[0] / (windowColumns + 1)
    const windowSpacingY = (height - 1.1) / (windowRows + 1)

    return (
      <group key={building.id}>
        <mesh position={[position[0], height / 2, position[2]]} castShadow receiveShadow>
          <boxGeometry args={[size[0], height, size[1]]} />
          <meshStandardMaterial map={buildingTexture} color="#ffffff" roughness={0.8} />
        </mesh>

        <mesh position={[position[0], 0.9, position[2] + size[1] / 2 - 0.015]} castShadow>
          <boxGeometry args={[0.9, 1.8, 0.08]} />
          <meshStandardMaterial color="#6a4a2f" roughness={0.65} />
        </mesh>
        <mesh position={[position[0], 0.95, position[2] + size[1] / 2 - 0.035]} castShadow>
          <boxGeometry args={[1.02, 1.9, 0.04]} />
          <meshStandardMaterial color="#3d2a1a" roughness={0.6} />
        </mesh>
        <mesh position={[position[0] + 0.3, 0.9, position[2] + size[1] / 2 - 0.06]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 10]} />
          <meshStandardMaterial color="#d2b48c" roughness={0.4} />
        </mesh>

        {Array.from({ length: windowRows }).map((_, row) =>
          Array.from({ length: windowColumns }).map((__, col) => {
            const x = position[0] - size[0] / 2 + windowSpacingX * (col + 1)
            const y = 1 + windowSpacingY * (row + 1)
            return (
              <mesh
                key={`${building.id}-win-${row}-${col}`}
                position={[x, y, position[2] + size[1] / 2 + 0.03]}
                castShadow
              >
                <boxGeometry args={[0.5, 0.5, 0.05]} />
                <meshStandardMaterial
                  color="#cbe6ff"
                  emissive="#b6d9ff"
                  emissiveIntensity={0.6}
                  roughness={0.2}
                />
              </mesh>
            )
          }),
        )}
      </group>
    )
  })
}

export default Buildings
