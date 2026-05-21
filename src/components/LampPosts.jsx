import { campusToWorld, WORLD_SCALE } from '../utils/world'

const getRectDistance = (a, b) => {
  const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), 0)
  const dy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h), 0)
  return Math.hypot(dx, dy)
}

const buildLamp = (key, position, isNight) => (
  <group key={key} position={position}>
    <mesh position={[0, 1.2, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.08, 2.4, 10]} />
      <meshStandardMaterial color="#3b3f46" roughness={0.5} metalness={0.6} />
    </mesh>
    <mesh position={[0, 2.4, 0]} castShadow>
      <sphereGeometry args={[0.16, 12, 12]} />
      <meshStandardMaterial
        color="#fff2c6"
        emissive="#ffe6a6"
        emissiveIntensity={isNight ? 1.4 : 0.15}
        roughness={0.2}
        metalness={0.05}
      />
    </mesh>
    {isNight && (
      <pointLight
        position={[0, 2.4, 0]}
        intensity={1.1}
        distance={9}
        color="#ffd7a3"
      />
    )}
  </group>
)

const LampPosts = ({ campus, isNight }) => {
  const lamps = []
  const gate = campus.entrances.find((entry) => entry.id === 'main-gate')
  if (gate) {
    const isPointInRect = (rect, x, y) =>
      x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
    const gatePath = campus.paths.find((path) => isPointInRect(path, gate.x, gate.y))
    const gateX = gatePath ? gatePath.x + gatePath.w / 2 : gate.x
    const extraMargin = 70
    const pillarOffset =
      (gatePath ? gatePath.w / 2 + extraMargin : 120) * WORLD_SCALE
    const left = campusToWorld(campus, gateX - pillarOffset / WORLD_SCALE, gate.y)
    const right = campusToWorld(campus, gateX + pillarOffset / WORLD_SCALE, gate.y)
    lamps.push(buildLamp('lamp-gate-left', left, isNight))
    lamps.push(buildLamp('lamp-gate-right', right, isNight))
  }

  campus.buildings.forEach((building, index) => {
    if (!campus.paths.length) return
    const nearest = campus.paths.reduce(
      (best, path) => {
        const distance = getRectDistance(building.rect, path)
        if (!best || distance < best.distance) {
          return { path, distance }
        }
        return best
      },
      null,
    )
    if (!nearest) return
    const path = nearest.path
    const bx = building.rect.x + building.rect.w / 2
    const by = building.rect.y + building.rect.h / 2
    const px = path.x + path.w / 2
    const py = path.y + path.h / 2
    const offset = 18
    let corners = []

    if (Math.abs(px - bx) > Math.abs(py - by)) {
      const edgeX = px > bx ? building.rect.x + building.rect.w : building.rect.x
      const shiftX = px > bx ? offset : -offset
      corners = [
        { x: edgeX + shiftX, y: building.rect.y + 8 },
        { x: edgeX + shiftX, y: building.rect.y + building.rect.h - 8 },
      ]
    } else {
      const edgeY = py > by ? building.rect.y + building.rect.h : building.rect.y
      const shiftY = py > by ? offset : -offset
      corners = [
        { x: building.rect.x + 8, y: edgeY + shiftY },
        { x: building.rect.x + building.rect.w - 8, y: edgeY + shiftY },
      ]
    }

    corners.forEach((corner, cornerIndex) => {
      const [x, , z] = campusToWorld(campus, corner.x, corner.y)
      lamps.push(buildLamp(`lamp-building-${index}-${cornerIndex}`, [x, 0, z], isNight))
    })
  })

  return <group>{lamps}</group>
}

export default LampPosts
