import { rectToWorld } from '../utils/world'

const Roads = ({ campus }) =>
  campus.paths.map((path, index) => {
    const { position, size } = rectToWorld(campus, path)
    return (
      <mesh
        key={`road-${index}`}
        position={[position[0], 0.01, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial color="#2f3338" roughness={0.85} metalness={0.2} />
      </mesh>
    )
  })

export default Roads
