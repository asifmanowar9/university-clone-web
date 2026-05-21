import { WORLD_SCALE } from '../utils/world'

const Ground = ({ campus }) => {
  const groundSize = [campus.width * WORLD_SCALE, 0.3, campus.height * WORLD_SCALE]
  const groundPosition = [0, -0.15, 0]

  return (
    <mesh position={groundPosition} receiveShadow>
      <boxGeometry args={groundSize} />
      <meshStandardMaterial color="#8ecf7b" roughness={0.9} />
    </mesh>
  )
}

export default Ground
