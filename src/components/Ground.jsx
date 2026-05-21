import { WORLD_SCALE } from '../utils/world'

const Ground = ({ campus }) => {
  const groundSize = [campus.width * WORLD_SCALE, campus.height * WORLD_SCALE]

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={groundSize} />
      <meshStandardMaterial color="#d4e2d5" roughness={0.95} metalness={0.05} />
    </mesh>
  )
}

export default Ground
