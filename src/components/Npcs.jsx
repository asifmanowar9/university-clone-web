import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { clamp, campusToWorld } from '../utils/world'

const Npcs = ({ campus }) => {
  const npcRefs = useRef([])
  const npcSpawns = useMemo(() => {
    const pool = [...campus.npcs]
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const swap = Math.floor(Math.random() * (i + 1))
      const temp = pool[i]
      pool[i] = pool[swap]
      pool[swap] = temp
    }
    const maxCount = Math.min(2, pool.length)
    return pool.slice(0, maxCount).map((npc) => {
      const jitterX = (Math.random() - 0.5) * 80
      const jitterY = (Math.random() - 0.5) * 80
      return {
        ...npc,
        x: clamp(npc.x + jitterX, 20, campus.width - 20),
        y: clamp(npc.y + jitterY, 20, campus.height - 20),
        pace: 18 + Math.random() * 26,
        speed: 0.5 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      }
    })
  }, [campus])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    npcSpawns.forEach((npc, index) => {
      const group = npcRefs.current[index]
      if (!group) return
      const pace = npc.pace
      const offset = Math.sin(time * npc.speed + npc.phase) * pace
      const walkX = clamp(npc.x + offset, 20, campus.width - 20)
      const [wx, , wz] = campusToWorld(campus, walkX, npc.y)
      group.position.set(wx, 0.15, wz)
      group.rotation.y = offset >= 0 ? Math.PI / 2 : -Math.PI / 2

      const stride = Math.sin(time * 6 + npc.phase) * 0.45
      const armStride = Math.sin(time * 6 + npc.phase + Math.PI) * 0.5
      const leftLeg = group.getObjectByName('leftLeg')
      const rightLeg = group.getObjectByName('rightLeg')
      const leftArm = group.getObjectByName('leftArm')
      const rightArm = group.getObjectByName('rightArm')
      if (leftLeg) leftLeg.rotation.x = stride
      if (rightLeg) rightLeg.rotation.x = -stride
      if (leftArm) leftArm.rotation.x = armStride
      if (rightArm) rightArm.rotation.x = -armStride
    })
  })

  return npcSpawns.map((npc, index) => (
    <group
      key={npc.id}
      ref={(node) => {
        npcRefs.current[index] = node
      }}
    >
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.45, 6, 10]} />
        <meshStandardMaterial color="#2d3f66" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshStandardMaterial color="#f2d7c4" roughness={0.4} />
      </mesh>
      <mesh name="leftArm" position={[-0.22, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.32, 4, 8]} />
        <meshStandardMaterial color="#3a4f7a" roughness={0.65} />
      </mesh>
      <mesh name="rightArm" position={[0.22, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.32, 4, 8]} />
        <meshStandardMaterial color="#3a4f7a" roughness={0.65} />
      </mesh>
      <mesh name="leftLeg" position={[-0.1, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.36, 4, 8]} />
        <meshStandardMaterial color="#1b1f2a" roughness={0.8} />
      </mesh>
      <mesh name="rightLeg" position={[0.1, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.36, 4, 8]} />
        <meshStandardMaterial color="#1b1f2a" roughness={0.8} />
      </mesh>
    </group>
  ))
}

export default Npcs
