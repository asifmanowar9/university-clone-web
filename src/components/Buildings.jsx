import { rectToWorld } from '../utils/world'

const Buildings = ({ campus }) =>
  campus.buildings.map((building) => {
    const { position, size } = rectToWorld(campus, building.rect)
    const height = building.id === 'classrooms' ? 3.8 : 3.0
    const windowColumns = Math.max(2, Math.floor(size[0] / 3.2))
    const windowRows = Math.max(2, Math.floor((height - 1.0) / 1.2))
    const windowSpacingX = size[0] / (windowColumns + 1)
    const windowSpacingY = (height - 1.0) / (windowRows + 1)
    const panelWidth = Math.min(1.05, windowSpacingX * 0.7)
    const panelHeight = Math.min(0.9, windowSpacingY * 0.65)

    return (
      <group key={building.id}>
        <mesh position={[position[0], height / 2, position[2]]} castShadow receiveShadow>
          <boxGeometry args={[size[0], height, size[1]]} />
          <meshStandardMaterial color="#e8edf1" roughness={0.55} metalness={0.12} />
        </mesh>

        <mesh position={[position[0], 0.09, position[2]]} receiveShadow>
          <boxGeometry args={[size[0] + 0.2, 0.18, size[1] + 0.2]} />
          <meshStandardMaterial color="#c3cbd2" roughness={0.75} metalness={0.08} />
        </mesh>

        <mesh position={[position[0], 0.95, position[2] + size[1] / 2 - 0.03]} castShadow>
          <boxGeometry args={[1.2, 1.9, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[position[0], 0.95, position[2] + size[1] / 2 + 0.01]} castShadow>
          <boxGeometry args={[1.05, 1.75, 0.04]} />
          <meshStandardMaterial
            color="#8cb5e6"
            roughness={0.1}
            metalness={0.05}
            transparent
            opacity={0.55}
          />
        </mesh>

        {Array.from({ length: windowRows }).map((_, row) =>
          Array.from({ length: windowColumns }).map((__, col) => {
            const x = position[0] - size[0] / 2 + windowSpacingX * (col + 1)
            const y = 0.8 + windowSpacingY * (row + 1)
            return (
              <mesh
                key={`${building.id}-win-${row}-${col}`}
                position={[x, y, position[2] + size[1] / 2 + 0.02]}
                castShadow
              >
                <boxGeometry args={[panelWidth, panelHeight, 0.03]} />
                <meshStandardMaterial
                  color="#9fc2ec"
                  roughness={0.08}
                  metalness={0.05}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            )
          }),
        )}
      </group>
    )
  })

export default Buildings
