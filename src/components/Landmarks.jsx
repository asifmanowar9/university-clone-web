import { campusToWorld } from '../utils/world'

const Landmarks = ({ campus }) => {
  const roadRows = campus.landmarks.filter((tree) => tree.y >= 700 && tree.y <= 950)
  const rowA = roadRows
    .filter((tree) => tree.y < 830)
    .sort((a, b) => a.x - b.x)
    .filter((_, index) => index % 2 === 0)
  const rowB = roadRows
    .filter((tree) => tree.y >= 830)
    .sort((a, b) => a.x - b.x)
    .filter((_, index) => index % 2 === 0)
  const trees = [...rowA, ...rowB]

  return (
    <group>
      {trees.map((tree, index) => {
        const [x, , z] = campusToWorld(campus, tree.x, tree.y)
        const seed = Math.sin(index * 91.3) * 0.5 + 0.5
        const height = 2.4 + seed * 0.9
        const trunkRadius = 0.1 + seed * 0.03
        const canopyRadius = 0.9 + seed * 0.3
        const canopyColor = seed > 0.5 ? '#2f6a45' : '#2b5e3f'
        const canopyShadow = seed > 0.5 ? '#255237' : '#224a34'

        return (
          <group key={`tree-${index}`} position={[x, 0, z]}>
            <mesh position={[0, height / 2, 0]} castShadow>
              <cylinderGeometry args={[trunkRadius * 0.65, trunkRadius, height, 10]} />
              <meshStandardMaterial color="#6a5648" roughness={0.85} />
            </mesh>

            <mesh position={[0, height * 0.4, 0]} castShadow>
              <coneGeometry args={[canopyRadius * 1.1, height * 0.45, 12]} />
              <meshStandardMaterial color={canopyShadow} roughness={0.8} />
            </mesh>
            <mesh position={[0, height * 0.58, 0]} castShadow>
              <coneGeometry args={[canopyRadius * 0.9, height * 0.4, 12]} />
              <meshStandardMaterial color={canopyColor} roughness={0.75} />
            </mesh>
            <mesh position={[0, height * 0.74, 0]} castShadow>
              <coneGeometry args={[canopyRadius * 0.7, height * 0.32, 12]} />
              <meshStandardMaterial color={canopyShadow} roughness={0.8} />
            </mesh>
            <mesh position={[0, height * 0.88, 0]} castShadow>
              <coneGeometry args={[canopyRadius * 0.5, height * 0.24, 12]} />
              <meshStandardMaterial color={canopyColor} roughness={0.75} />
            </mesh>
          </group>
        )
      })}

      {[rowA, rowB].flatMap((row, rowIndex) =>
        row.slice(0, -1).map((tree, index) => {
          const next = row[index + 1]
          const midX = (tree.x + next.x) / 2
          const midY = (tree.y + next.y) / 2
          const [x, , z] = campusToWorld(campus, midX, midY)
          const angle = Math.atan2(next.y - tree.y, next.x - tree.x)

          return (
            <group
              key={`bench-${rowIndex}-${index}`}
              position={[x, 0.18, z]}
              rotation={[0, -angle, 0]}
            >
              <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.95, 0.08, 0.32]} />
                <meshStandardMaterial color="#8a6a4f" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.32, -0.12]} castShadow>
                <boxGeometry args={[0.95, 0.28, 0.06]} />
                <meshStandardMaterial color="#6d523f" roughness={0.7} />
              </mesh>
              <mesh position={[-0.38, 0.05, 0]} castShadow>
                <boxGeometry args={[0.08, 0.1, 0.22]} />
                <meshStandardMaterial color="#3b3b3b" roughness={0.5} />
              </mesh>
              <mesh position={[0.38, 0.05, 0]} castShadow>
                <boxGeometry args={[0.08, 0.1, 0.22]} />
                <meshStandardMaterial color="#3b3b3b" roughness={0.5} />
              </mesh>
            </group>
          )
        }),
      )}
    </group>
  )
}

export default Landmarks
