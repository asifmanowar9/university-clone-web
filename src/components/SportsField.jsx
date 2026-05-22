import { buildLamp } from './LampPosts'
import { campusToWorld, rectToWorld } from '../utils/world'

const SportsField = ({ campus, isNight }) =>
  campus.fields.map((field) => {
    const { position, size } = rectToWorld(campus, field.rect)
    const pitchWidth = size[0] * 0.5
    const pitchHeight = size[1] * 0.6
    const [goalLeftX, , goalLeftZ] = campusToWorld(
      campus,
      field.rect.x + 8,
      field.rect.y + field.rect.h / 2,
    )
    const [goalRightX, , goalRightZ] = campusToWorld(
      campus,
      field.rect.x + field.rect.w - 8,
      field.rect.y + field.rect.h / 2,
    )

    return (
      <group key={field.id}>
        <mesh position={[position[0], 0.01, position[2]]} receiveShadow>
          <boxGeometry args={[size[0], 0.04, size[1]]} />
          <meshStandardMaterial color="#4f8f6b" roughness={0.85} />
        </mesh>

        <mesh position={[position[0], 0.05, position[2]]} receiveShadow>
          <boxGeometry args={[size[0] * 0.96, 0.02, size[1] * 0.92]} />
          <meshStandardMaterial color="#2f6a45" roughness={0.9} />
        </mesh>

        <mesh position={[position[0], 0.07, position[2]]}>
          <boxGeometry args={[size[0] * 0.94, 0.01, size[1] * 0.9]} />
          <meshStandardMaterial color="#e6f2e8" roughness={0.6} />
        </mesh>

        <mesh position={[position[0], 0.08, position[2]]}>
          <boxGeometry args={[pitchWidth, 0.01, pitchHeight]} />
          <meshStandardMaterial color="#ccb27a" roughness={0.7} />
        </mesh>

        <mesh position={[goalLeftX, 0.35, goalLeftZ]} castShadow>
          <boxGeometry args={[0.08, 0.7, 1.6]} />
          <meshStandardMaterial color="#f5f7fb" roughness={0.35} />
        </mesh>
        <mesh position={[goalRightX, 0.35, goalRightZ]} castShadow>
          <boxGeometry args={[0.08, 0.7, 1.6]} />
          <meshStandardMaterial color="#f5f7fb" roughness={0.35} />
        </mesh>

        {[
          { x: field.rect.x + 12, y: field.rect.y + 12 },
          { x: field.rect.x + field.rect.w - 12, y: field.rect.y + 12 },
          { x: field.rect.x + 12, y: field.rect.y + field.rect.h - 12 },
          { x: field.rect.x + field.rect.w - 12, y: field.rect.y + field.rect.h - 12 },
        ].map((corner, index) => {
          const [x, , z] = campusToWorld(campus, corner.x, corner.y)
          return (
            <group key={`corner-${field.id}-${index}`} position={[x, 0.05, z]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
                <meshStandardMaterial color="#3b3f46" roughness={0.5} />
              </mesh>
              <mesh position={[0.06, 0.6, 0]} castShadow>
                <boxGeometry args={[0.12, 0.08, 0.02]} />
                <meshStandardMaterial color="#e76f51" roughness={0.4} />
              </mesh>

              {buildLamp(`lamp-field-${field.id}-${index}`, [0, 0, 0], isNight)}
            </group>
          )
        })}
      </group>
    )
  })

export default SportsField
