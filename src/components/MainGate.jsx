import { Text } from '@react-three/drei'
import { campusToWorld, WORLD_SCALE } from '../utils/world'

const MainGate = ({ campus }) => {
  const gate = campus.entrances.find((entry) => entry.id === 'main-gate')
  if (!gate) return null

  const isPointInRect = (rect, x, y) =>
    x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
  const gatePath = campus.paths.find((path) => isPointInRect(path, gate.x, gate.y))
  const gateX = gatePath ? gatePath.x + gatePath.w / 2 : gate.x
  const [x, , z] = campusToWorld(campus, gateX, gate.y)
  const extraMargin = 70
  const pillarOffset =
    (gatePath ? gatePath.w / 2 + extraMargin : 120) * WORLD_SCALE

  return (
    <group position={[x, 0, z]}>
      <mesh position={[-pillarOffset, 2.1, 0]} castShadow>
        <boxGeometry args={[0.5, 4.2, 0.6]} />
        <meshStandardMaterial color="#c9d2da" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[pillarOffset, 2.1, 0]} castShadow>
        <boxGeometry args={[0.5, 4.2, 0.6]} />
        <meshStandardMaterial color="#c9d2da" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 3.9, 0]} castShadow>
        <boxGeometry args={[pillarOffset * 2 + 1.2, 0.35, 0.8]} />
        <meshStandardMaterial color="#2c3644" roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[pillarOffset * 2 - 1.0, 2.6, 0.18]} />
        <meshStandardMaterial
          color="#8fb7e8"
          roughness={0.08}
          metalness={0.1}
          transparent
          opacity={0.45}
        />
      </mesh>

      <Text
        position={[0, 3.9, 0.43]}
        fontSize={0.38}
        color="#eef4ff"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.2}
      >
        R. P. Shaha University
      </Text>
      <Text
        position={[0, 3.9, -0.43]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.38}
        color="#eef4ff"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.2}
      >
        R. P. Shaha University
      </Text>
    </group>
  )
}

export default MainGate
