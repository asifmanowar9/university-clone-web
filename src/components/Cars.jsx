import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { campusToWorld, PLAYER_START } from '../utils/world'

const Cars = ({ campus }) => {
  const bodyRef = useRef(null)
  const roofRef = useRef(null)
  const glassRef = useRef(null)
  const lightRef = useRef(null)
  const wheelRef = useRef(null)
  const temp = useMemo(() => new Object3D(), [])

  const cars = useMemo(() => {
    const colors = ['#d1495b', '#f4b860', '#4d908e', '#577590', '#f2cc8f']
    const carDefs = []
    const isPointInRect = (rect, x, y) =>
      x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
    const mainPathIndex = campus.paths.findIndex((path) =>
      isPointInRect(path, PLAYER_START.x, PLAYER_START.y),
    )

    campus.paths.forEach((path, index) => {
      if (index !== mainPathIndex) return
      const hasBuildingEntrance = campus.entrances.some(
        (entry) => entry.id !== 'main-gate' && isPointInRect(path, entry.x, entry.y),
      )
      if (hasBuildingEntrance) return
      const horizontal = path.w >= path.h
      const length = horizontal ? path.w : path.h
      const laneSize = horizontal ? path.h : path.w
      const lanes = [laneSize * 0.2, -laneSize * 0.2]
      const carCount = Math.max(1, Math.floor(length / 780))
      const beforeCount = carDefs.length

      for (let i = 0; i < carCount; i += 1) {
        if (Math.random() < 0.65) continue
        const speedVariance = 0.7 + Math.random() * 0.6
        carDefs.push({
          id: `${index}-${i}`,
          pathIndex: index,
          horizontal,
          length,
          laneOffset: lanes[i % lanes.length] + (Math.random() - 0.5) * 6,
          direction: i % 2 === 0 ? 1 : -1,
          speed: (70 + i * 8) * speedVariance,
          offset: (length / carCount) * (i + Math.random() * 0.6),
          color: colors[(index + i) % colors.length],
        })
      }

      if (beforeCount === carDefs.length && Math.random() < 0.4) {
        carDefs.push({
          id: `${index}-fallback`,
          pathIndex: index,
          horizontal,
          length,
          laneOffset: lanes[0],
          direction: 1,
          speed: 72,
          offset: Math.random() * length,
          color: colors[index % colors.length],
        })
      }
    })

    if (carDefs.length === 0 && campus.paths.length > 0) {
      const path = campus.paths[0]
      const horizontal = path.w >= path.h
      const length = horizontal ? path.w : path.h
      const laneSize = horizontal ? path.h : path.w
      carDefs.push({
        id: 'fallback-0',
        pathIndex: 0,
        horizontal,
        length,
        laneOffset: laneSize * 0.2,
        direction: 1,
        speed: 70,
        offset: length * 0.25,
        color: colors[0],
      })
    }

    return carDefs
  }, [campus])

  useFrame((state) => {
    if (
      !bodyRef.current ||
      !roofRef.current ||
      !glassRef.current ||
      !lightRef.current ||
      !wheelRef.current
    ) {
      return
    }

    const time = state.clock.getElapsedTime()

    cars.forEach((car, index) => {
      const path = campus.paths[car.pathIndex]
      const travel = (time * car.speed + car.offset) % car.length
      const wrapped = travel < 0 ? travel + car.length : travel

      let x = 0
      let y = 0
      let rotation = 0

      if (car.horizontal) {
        x = car.direction > 0 ? path.x + wrapped : path.x + (car.length - wrapped)
        y = path.y + path.h / 2 + car.laneOffset
        rotation = car.direction > 0 ? Math.PI / 2 : -Math.PI / 2
      } else {
        x = path.x + path.w / 2 + car.laneOffset
        y = car.direction > 0 ? path.y + wrapped : path.y + (car.length - wrapped)
        rotation = car.direction > 0 ? 0 : Math.PI
      }

      const [wx, , wz] = campusToWorld(campus, x, y)
      temp.position.set(wx, 0.26, wz)
      temp.rotation.set(0, rotation, 0)
      temp.updateMatrix()
      bodyRef.current.setMatrixAt(index, temp.matrix)

      temp.position.set(wx, 0.42, wz)
      temp.rotation.set(0, rotation, 0)
      temp.translateX(-0.12)
      temp.updateMatrix()
      roofRef.current.setMatrixAt(index, temp.matrix)

      temp.position.set(wx, 0.38, wz)
      temp.rotation.set(0, rotation, 0)
      temp.translateX(0.14)
      temp.updateMatrix()
      glassRef.current.setMatrixAt(index, temp.matrix)

      temp.position.set(wx, 0.26, wz)
      temp.rotation.set(0, rotation, 0)
      temp.translateX(0.38)
      temp.updateMatrix()
      lightRef.current.setMatrixAt(index, temp.matrix)

      const wheelOffsets = [
        { x: 0.22, z: 0.22 },
        { x: -0.22, z: 0.22 },
        { x: 0.22, z: -0.22 },
        { x: -0.22, z: -0.22 },
      ]
      wheelOffsets.forEach((offset, wheelIndex) => {
        temp.position.set(wx, 0.12, wz)
        temp.rotation.set(0, rotation, 0)
        temp.translateX(offset.x)
        temp.translateZ(offset.z)
        temp.rotateZ(Math.PI / 2)
        temp.updateMatrix()
        wheelRef.current.setMatrixAt(index * 4 + wheelIndex, temp.matrix)
      })
    })

    bodyRef.current.instanceMatrix.needsUpdate = true
    glassRef.current.instanceMatrix.needsUpdate = true
    lightRef.current.instanceMatrix.needsUpdate = true
    wheelRef.current.instanceMatrix.needsUpdate = true
    roofRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[null, null, cars.length]} castShadow>
        <boxGeometry args={[0.9, 0.2, 0.42]} />
        <meshStandardMaterial color="#3f4854" roughness={0.35} metalness={0.3} />
      </instancedMesh>
      <instancedMesh ref={roofRef} args={[null, null, cars.length]} castShadow>
        <boxGeometry args={[0.46, 0.16, 0.3]} />
        <meshStandardMaterial color="#2b3139" roughness={0.3} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={glassRef} args={[null, null, cars.length]} castShadow>
        <boxGeometry args={[0.28, 0.14, 0.32]} />
        <meshStandardMaterial
          color="#8fb7e8"
          roughness={0.1}
          metalness={0.05}
          transparent
          opacity={0.6}
        />
      </instancedMesh>
      <instancedMesh ref={lightRef} args={[null, null, cars.length]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.3]} />
        <meshStandardMaterial color="#f8fbff" emissive="#d9ecff" emissiveIntensity={0.7} />
      </instancedMesh>
      <instancedMesh ref={wheelRef} args={[null, null, cars.length * 4]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.16, 14]} />
        <meshStandardMaterial color="#1f1f1f" roughness={0.9} />
      </instancedMesh>
    </group>
  )
}

export default Cars
