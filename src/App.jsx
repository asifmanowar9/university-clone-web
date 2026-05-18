import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BackSide,
  Object3D,
  SRGBColorSpace,
  RepeatWrapping,
  TextureLoader,
  Vector3,
} from 'three'
import './App.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const WORLD_SCALE = 0.025
const PLAYER_START = { x: 200, y: 1950 }

const circleHitsRect = (x, y, r, rect) => {
  const closestX = clamp(x, rect.x, rect.x + rect.w)
  const closestY = clamp(y, rect.y, rect.y + rect.h)
  const dx = x - closestX
  const dy = y - closestY
  return dx * dx + dy * dy < r * r
}

const campusToWorld = (campus, x, y) => {
  const originX = campus.width / 2
  const originY = campus.height / 2
  return [(x - originX) * WORLD_SCALE, 0, (y - originY) * WORLD_SCALE]
}

const rectToWorld = (campus, rect) => {
  const centerX = rect.x + rect.w / 2
  const centerY = rect.y + rect.h / 2
  const [x, , z] = campusToWorld(campus, centerX, centerY)
  return {
    position: [x, 0, z],
    size: [rect.w * WORLD_SCALE, rect.h * WORLD_SCALE],
  }
}

const SkyDome = ({ isNight }) => {
  const skyTexture = useLoader(TextureLoader, '/sky.jpg')
  skyTexture.colorSpace = SRGBColorSpace
  skyTexture.wrapS = RepeatWrapping
  skyTexture.wrapT = RepeatWrapping
  skyTexture.repeat.set(1, 1)
  skyTexture.flipY = false
  skyTexture.needsUpdate = true

  return (
    <mesh scale={160}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshBasicMaterial
        map={skyTexture}
        side={BackSide}
        depthWrite={false}
        color={isNight ? '#2b2f3a' : '#ffffff'}
      />
    </mesh>
  )
}

const Cars = ({ campus }) => {
  const bodyRef = useRef(null)
  const roofRef = useRef(null)
  const noseRef = useRef(null)
  const wheelRef = useRef(null)
  const temp = useMemo(() => new Object3D(), [])
  const carTexture = useLoader(TextureLoader, '/carr.webp')
  carTexture.colorSpace = SRGBColorSpace
  carTexture.flipY = false
  carTexture.wrapS = RepeatWrapping
  carTexture.wrapT = RepeatWrapping
  carTexture.repeat.set(1, 1)
  carTexture.needsUpdate = true

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
    if (!bodyRef.current || !roofRef.current || !noseRef.current || !wheelRef.current) {
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
        x =
          car.direction > 0 ? path.x + wrapped : path.x + (car.length - wrapped)
        y = path.y + path.h / 2 + car.laneOffset
        rotation = car.direction > 0 ? Math.PI / 2 : -Math.PI / 2
      } else {
        x = path.x + path.w / 2 + car.laneOffset
        y =
          car.direction > 0 ? path.y + wrapped : path.y + (car.length - wrapped)
        rotation = car.direction > 0 ? 0 : Math.PI
      }

      const [wx, , wz] = campusToWorld(campus, x, y)
      temp.position.set(wx, 0.28, wz)
      temp.rotation.set(0, rotation, 0)
      temp.updateMatrix()
      bodyRef.current.setMatrixAt(index, temp.matrix)

      temp.position.set(wx, 0.46, wz)
      temp.rotation.set(0, rotation, 0)
      temp.translateX(-0.05)
      temp.updateMatrix()
      roofRef.current.setMatrixAt(index, temp.matrix)

      temp.position.set(wx, 0.34, wz)
      temp.rotation.set(0, rotation, 0)
      temp.translateX(0.24)
      temp.updateMatrix()
      noseRef.current.setMatrixAt(index, temp.matrix)

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
    noseRef.current.instanceMatrix.needsUpdate = true
    wheelRef.current.instanceMatrix.needsUpdate = true
    roofRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[null, null, cars.length]} castShadow>
        <boxGeometry args={[0.78, 0.22, 0.42]} />
        <meshStandardMaterial map={carTexture} roughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={roofRef} args={[null, null, cars.length]} castShadow>
        <boxGeometry args={[0.38, 0.18, 0.3]} />
        <meshStandardMaterial color="#e8eef2" roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={noseRef} args={[null, null, cars.length]} castShadow>
        <boxGeometry args={[0.22, 0.16, 0.38]} />
        <meshStandardMaterial map={carTexture} roughness={0.32} />
      </instancedMesh>
      <instancedMesh ref={wheelRef} args={[null, null, cars.length * 4]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.16, 12]} />
        <meshStandardMaterial color="#1f1f1f" roughness={0.9} />
      </instancedMesh>
    </group>
  )
}


const VoxelWorld = ({ campus }) => {
  const brickTexture = useLoader(TextureLoader, '/brick.jpg')
  brickTexture.wrapS = RepeatWrapping
  brickTexture.wrapT = RepeatWrapping
  const brickTextures = useMemo(() => {
    return campus.buildings.reduce((acc, building) => {
      const texture = brickTexture.clone()
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.needsUpdate = true
      acc[building.id] = texture
      return acc
    }, {})
  }, [brickTexture, campus.buildings])

  const groundSize = [campus.width * WORLD_SCALE, 0.3, campus.height * WORLD_SCALE]
  const groundPosition = [0, -0.15, 0]

  return (
    <group>
      <mesh position={groundPosition} receiveShadow>
        <boxGeometry args={groundSize} />
        <meshStandardMaterial color="#8ecf7b" roughness={0.9} />
      </mesh>

      {campus.paths.map((path, index) => {
        const { position, size } = rectToWorld(campus, path)
        return (
          <mesh key={`road-${index}`} position={[position[0], 0.02, position[2]]} receiveShadow>
            <boxGeometry args={[size[0], 0.05, size[1]]} />
            <meshStandardMaterial color="#515151" roughness={0.95} />
          </mesh>
        )
      })}

      {campus.buildings.map((building) => {
        const { position, size } = rectToWorld(campus, building.rect)
        const height = building.id === 'classrooms' ? 3.5 : 2.8
        const repeatX = Math.max(1, Math.round(size[0] * 2.2))
        const repeatY = Math.max(1, Math.round(height * 2.4))
        const buildingTexture = brickTextures[building.id] ?? brickTexture
        buildingTexture.repeat.set(repeatX, repeatY)
        const windowColumns = Math.max(2, Math.floor(size[0] / 2.0))
        const windowRows = Math.max(1, Math.floor((height - 1.2) / 1.3))
        const windowSpacingX = size[0] / (windowColumns + 1)
        const windowSpacingY = (height - 1.1) / (windowRows + 1)
        return (
          <group key={building.id}>
            <mesh
              position={[position[0], height / 2, position[2]]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[size[0], height, size[1]]} />
              <meshStandardMaterial map={buildingTexture} color="#ffffff" roughness={0.8} />
            </mesh>

            <mesh
              position={[position[0], 0.9, position[2] + size[1] / 2 - 0.015]}
              castShadow
            >
              <boxGeometry args={[0.9, 1.8, 0.08]} />
              <meshStandardMaterial color="#6a4a2f" roughness={0.65} />
            </mesh>
            <mesh
              position={[position[0], 0.95, position[2] + size[1] / 2 - 0.035]}
              castShadow
            >
              <boxGeometry args={[1.02, 1.9, 0.04]} />
              <meshStandardMaterial color="#3d2a1a" roughness={0.6} />
            </mesh>
            <mesh
              position={[position[0] + 0.3, 0.9, position[2] + size[1] / 2 - 0.06]}
              castShadow
            >
              <cylinderGeometry args={[0.03, 0.03, 0.12, 10]} />
              <meshStandardMaterial color="#d2b48c" roughness={0.4} />
            </mesh>

            {Array.from({ length: windowRows }).map((_, row) =>
              Array.from({ length: windowColumns }).map((__, col) => {
                const x = position[0] - size[0] / 2 + windowSpacingX * (col + 1)
                const y = 1 + windowSpacingY * (row + 1)
                return (
                  <mesh
                    key={`${building.id}-win-${row}-${col}`}
                    position={[x, y, position[2] + size[1] / 2 + 0.03]}
                    castShadow
                  >
                    <boxGeometry args={[0.5, 0.5, 0.05]} />
                    <meshStandardMaterial
                      color="#cbe6ff"
                      emissive="#b6d9ff"
                      emissiveIntensity={0.6}
                      roughness={0.2}
                    />
                  </mesh>
                )
              }),
            )}
          </group>
        )
      })}

      {campus.landmarks.map((tree, index) => {
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
      })}
    </group>
  )
}

const CampusScene = ({ campus, mode }) => {
  const playerRef = useRef(null)
  const keysRef = useRef(new Set())
  const playerPosRef = useRef({ ...PLAYER_START })
  const npcRefs = useRef([])
  const yawRef = useRef(0)
  const pitchRef = useRef(-0.2)
  const yawTargetRef = useRef(0)
  const pitchTargetRef = useRef(-0.2)
  const tempTarget = useMemo(() => new Vector3(), [])
  const tempDir = useMemo(() => new Vector3(), [])
  const tempPosition = useMemo(() => new Vector3(), [])
  const isNight = mode === 'night'
  const sunPosition = [14, 18, -10]
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'
      ) {
        event.preventDefault()
        keysRef.current.add(key)
      }
    }

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase()
      keysRef.current.delete(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    const lookX =
      (keysRef.current.has('arrowleft') ? 1 : 0) -
      (keysRef.current.has('arrowright') ? 1 : 0)
    const lookY = 0

    const lookSpeed = 1.6
    yawTargetRef.current += lookX * lookSpeed * delta
    pitchTargetRef.current = clamp(
      pitchTargetRef.current + lookY * lookSpeed * delta,
      -1.05,
      0.65,
    )

    yawRef.current += (yawTargetRef.current - yawRef.current) * 0.12
    pitchRef.current += (pitchTargetRef.current - pitchRef.current) * 0.12

    const inputForward =
      (keysRef.current.has('arrowup') ? 1 : 0) -
      (keysRef.current.has('arrowdown') ? 1 : 0)
    const inputStrafe =
      (keysRef.current.has('arrowleft') ? 1 : 0) -
      (keysRef.current.has('arrowright') ? 1 : 0)

    let moveX = 0
    let moveY = 0
    if (inputForward !== 0 || inputStrafe !== 0) {
      const forwardX = Math.sin(yawRef.current)
      const forwardY = Math.cos(yawRef.current)
      const rightX = forwardY
      const rightY = -forwardX
      const length = Math.hypot(inputForward, inputStrafe)
      const normForward = inputForward / length
      const normStrafe = inputStrafe / length
      moveX = rightX * normStrafe + forwardX * normForward
      moveY = rightY * normStrafe + forwardY * normForward
    }

    const speed = 210
    const nextX = playerPosRef.current.x + moveX * speed * delta
    const nextY = playerPosRef.current.y + moveY * speed * delta
    const clampedX = clamp(nextX, 14, campus.width - 14)
    const clampedY = clamp(nextY, 14, campus.height - 14)

    const hit = campus.buildings.some((building) =>
      circleHitsRect(clampedX, clampedY, 14, building.rect),
    )

    if (hit) {
      const tryX = campus.buildings.some((building) =>
        circleHitsRect(clampedX, playerPosRef.current.y, 14, building.rect),
      )
      const tryY = campus.buildings.some((building) =>
        circleHitsRect(playerPosRef.current.x, clampedY, 14, building.rect),
      )
      if (!tryX) playerPosRef.current.x = clampedX
      if (!tryY) playerPosRef.current.y = clampedY
    } else {
      playerPosRef.current.x = clampedX
      playerPosRef.current.y = clampedY
    }

    const [worldX, , worldZ] = campusToWorld(
      campus,
      playerPosRef.current.x,
      playerPosRef.current.y,
    )
    if (playerRef.current) {
      playerRef.current.position.set(worldX, 0.6, worldZ)
    }

    const eyeHeight = 1.6
    state.camera.position.set(worldX, eyeHeight, worldZ)
    tempPosition.set(worldX, eyeHeight, worldZ)
    tempDir.set(
      Math.sin(yawRef.current) * Math.cos(pitchRef.current),
      Math.sin(pitchRef.current),
      Math.cos(yawRef.current) * Math.cos(pitchRef.current),
    )
    tempTarget.copy(tempDir).multiplyScalar(6).add(tempPosition)
    state.camera.lookAt(tempTarget)

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

  return (
    <>
      <color attach="background" args={[isNight ? '#0b1020' : '#b7dcff']} />
      <fog attach="fog" args={[isNight ? '#141a28' : '#cfe7ff', 20, 75]} />
      <SkyDome isNight={isNight} />
      <ambientLight intensity={isNight ? 0.25 : 0.7} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={isNight ? 0.35 : 1.1}
        color={isNight ? '#a9c4ff' : '#ffffff'}
        castShadow
      />
      {!isNight && (
        <mesh position={sunPosition}>
          <sphereGeometry args={[1.4, 24, 24]} />
          <meshBasicMaterial color="#ffe8a3" />
        </mesh>
      )}
      {isNight &&
        campus.entrances.map((entry) => {
          const [x, , z] = campusToWorld(campus, entry.x, entry.y)
          return (
            <pointLight
              key={`light-${entry.id}`}
              position={[x, 1.2, z]}
              intensity={0.9}
              distance={6}
              color="#ffd7a3"
            />
          )
        })}

      <VoxelWorld campus={campus} />
      <Cars campus={campus} />

      {npcSpawns.map((npc, index) => (
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
      ))}

      <mesh ref={playerRef} position={[0, 0.6, 0]} visible={false}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#1f2a44" />
      </mesh>
    </>
  )
}

function App() {
  const [mode, setMode] = useState('day')
  const campus = useMemo(
    () => ({
      width: 1400,
      height: 2200,
      paths: [
        { x: 100, y: 0, w: 90, h: 2200 },
        { x: 260, y: 820, w: 1060, h: 70 },
        { x: 260, y: 1600, w: 1060, h: 70 },
        { x: 680, y: 1400, w: 70, h: 420 },
        { x: 700, y: 160, w: 70, h: 460 },
      ],
      buildings: [
        {
          id: 'classrooms',
          name: 'Class Rooms',
          type: 'Classrooms',
          rect: { x: 520, y: 80, w: 760, h: 520 },
          color: '#8b3f2a',
        },
        {
          id: 'library',
          name: 'Library',
          type: 'Library',
          rect: { x: 360, y: 420, w: 180, h: 150 },
          color: '#8b3f2a',
        },
        {
          id: 'teachers',
          name: "Teachers' Room",
          type: 'Office',
          rect: { x: 840, y: 420, w: 220, h: 150 },
          color: '#8b3f2a',
        },
        {
          id: 'admission',
          name: 'Admission Office',
          type: 'Office',
          rect: { x: 520, y: 1180, w: 360, h: 180 },
          color: '#8b3f2a',
        },
      ],
      entrances: [
        {
          id: 'classrooms-main',
          label: 'Class Rooms',
          buildingId: 'classrooms',
          x: 900,
          y: 610,
        },
        {
          id: 'library-main',
          label: 'Library',
          buildingId: 'library',
          x: 450,
          y: 580,
        },
        {
          id: 'teachers-main',
          label: "Teachers' Room",
          buildingId: 'teachers',
          x: 950,
          y: 580,
        },
        {
          id: 'admission-main',
          label: 'Admission Office',
          buildingId: 'admission',
          x: 700,
          y: 1380,
        },
        {
          id: 'main-gate',
          label: 'Main Gate',
          x: 200,
          y: 2050,
        },
      ],
      npcs: [
        {
          id: 'npc-library',
          name: 'Librarian',
          role: 'Library',
          message: 'Quiet zone is open. Ask at the desk for study rooms.',
          x: 420,
          y: 650,
        },
        {
          id: 'npc-teachers',
          name: 'Teacher',
          role: "Teachers' Room",
          message: 'Staff meeting starts at 2 PM. Visitors wait outside.',
          x: 980,
          y: 650,
        },
        {
          id: 'npc-admission',
          name: 'Admissions Guide',
          role: 'Admission Office',
          message: 'Submit your forms here and check the notice board.',
          x: 740,
          y: 1460,
        },
      ],
      landmarks: [
        { x: 70, y: 120, r: 70 },
        { x: 320, y: 760, r: 26 },
        { x: 430, y: 760, r: 26 },
        { x: 540, y: 760, r: 26 },
        { x: 650, y: 760, r: 26 },
        { x: 760, y: 760, r: 26 },
        { x: 870, y: 760, r: 26 },
        { x: 980, y: 760, r: 26 },
        { x: 1090, y: 760, r: 26 },
        { x: 350, y: 900, r: 22 },
        { x: 460, y: 900, r: 22 },
        { x: 570, y: 900, r: 22 },
        { x: 680, y: 900, r: 22 },
        { x: 790, y: 900, r: 22 },
        { x: 900, y: 900, r: 22 },
        { x: 1010, y: 900, r: 22 },
        { x: 1120, y: 900, r: 22 },
      ],
    }),
    [],
  )

  return (
    <div className="app">
      <button
        type="button"
        onClick={() => setMode((prev) => (prev === 'day' ? 'night' : 'day'))}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 5,
          padding: '8px 12px',
          borderRadius: '999px',
          border: '1px solid rgba(0,0,0,0.2)',
          background: 'rgba(255,255,255,0.9)',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {mode === 'day' ? 'Switch to Night' : 'Switch to Day'}
      </button>
      <Canvas className="campus-canvas" shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <CampusScene campus={campus} mode={mode} />
      </Canvas>
    </div>
  )
}

export default App
