import { rectToWorld } from '../utils/world'

const Roads = ({ campus }) =>
  campus.paths.map((path, index) => {
    const { position, size } = rectToWorld(campus, path)
    return (
      <mesh key={`road-${index}`} position={[position[0], 0.02, position[2]]} receiveShadow>
        <boxGeometry args={[size[0], 0.05, size[1]]} />
        <meshStandardMaterial color="#515151" roughness={0.95} />
      </mesh>
    )
  })

export default Roads
