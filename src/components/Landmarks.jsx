import { campusToWorld, WORLD_SCALE } from '../utils/world'

const Landmarks = ({ campus }) =>
  campus.landmarks.map((tree, index) => {
    const [x, , z] = campusToWorld(campus, tree.x, tree.y)
    const trunkHeight = 0.9
    const canopy = Math.max(0.4, tree.r * WORLD_SCALE * 0.2)
    return (
      <group key={`tree-${index}`} position={[x, 0, z]}>
        <mesh position={[0, trunkHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, trunkHeight, 10]} />
          <meshStandardMaterial color="#6d5a42" roughness={0.9} />
        </mesh>
        <mesh position={[0, trunkHeight + canopy * 0.9, 0]} castShadow>
          <sphereGeometry args={[canopy, 12, 12]} />
          <meshStandardMaterial color="#4e9b4f" roughness={0.85} />
        </mesh>
      </group>
    )
  })

export default Landmarks
