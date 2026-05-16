import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Object3D, Vector3 } from 'three'
import './App.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const WORLD_SCALE = 0.025

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

const VoxelWorld = ({ campus }) => {
  const blockSize = 40
  const blockWorld = blockSize * WORLD_SCALE
  const halfBlock = blockSize / 2

  const rectContains = (rect, x, y) =>
    x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h

  const blocks = useMemo(() => {
    const ground = []
    const roads = []
    const sidewalks = []
    const buildingBlocks = []
    const windowBlocks = []
    const foliage = []
    const maxX = Math.floor(campus.width / blockSize)
    const maxY = Math.floor(campus.height / blockSize)

    for (let y = 0; y <= maxY; y += 1) {
      for (let x = 0; x <= maxX; x += 1) {
        const cx = x * blockSize + halfBlock
        const cy = y * blockSize + halfBlock
        ground.push({ x: cx, y: cy, z: 0 })

        const isRoad = campus.paths.some((path) => rectContains(path, cx, cy))
        if (isRoad) {
          roads.push({ x: cx, y: cy, z: 0.12 })
        } else {
          const nearRoad = campus.paths.some(
            (path) =>
              rectContains(path, cx + blockSize, cy) ||
              rectContains(path, cx - blockSize, cy) ||
              rectContains(path, cx, cy + blockSize) ||
              rectContains(path, cx, cy - blockSize),
          )
          if (nearRoad) {
            sidewalks.push({ x: cx, y: cy, z: 0.2 })
          }
        }
      }
    }

    campus.buildings.forEach((building) => {
      const startX = Math.floor(building.rect.x / blockSize)
      const endX = Math.floor((building.rect.x + building.rect.w) / blockSize)
      const startY = Math.floor(building.rect.y / blockSize)
      const endY = Math.floor((building.rect.y + building.rect.h) / blockSize)
      const height = building.id === 'classrooms' ? 6 : 4
      for (let z = 1; z <= height; z += 1) {
        for (let y = startY; y <= endY; y += 1) {
          for (let x = startX; x <= endX; x += 1) {
            const cx = x * blockSize + halfBlock
            const cy = y * blockSize + halfBlock
            buildingBlocks.push({ x: cx, y: cy, z, color: building.color })
          }
        }
      }

      for (let z = 2; z <= height; z += 2) {
        for (let x = startX + 1; x <= endX - 1; x += 2) {
          const cx = x * blockSize + halfBlock
          const cy = startY * blockSize + halfBlock
          windowBlocks.push({ x: cx, y: cy, z: z + 0.1 })
        }
      }
    })

    campus.landmarks.forEach((tree) => {
      const trunkHeight = 2
      for (let z = 1; z <= trunkHeight; z += 1) {
        foliage.push({ x: tree.x, y: tree.y, z, type: 'trunk' })
      }
      foliage.push({ x: tree.x, y: tree.y, z: trunkHeight + 1, type: 'leaf' })
    })

    return { ground, roads, sidewalks, buildingBlocks, windowBlocks, foliage }
  }, [campus])

  const buildInstances = (items, ref, useColors = false) => {
    if (!ref?.current || items.length === 0) {
      return
    }
    const temp = new Object3D()
    const tempColor = new Color()
    items.forEach((item, index) => {
      const [wx, , wz] = campusToWorld(campus, item.x, item.y)
      const y = (item.z ?? 0) * blockWorld
      temp.position.set(wx, y + blockWorld / 2, wz)
      temp.updateMatrix()
      ref.current.setMatrixAt(index, temp.matrix)
      if (useColors && item.color) {
        tempColor.set(item.color)
        ref.current.setColorAt(index, tempColor)
      }
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (useColors && ref.current.instanceColor) {
      ref.current.instanceColor.needsUpdate = true
    }
  }

  const groundRef = useRef(null)
  const roadRef = useRef(null)
  const sidewalkRef = useRef(null)
  const buildingRef = useRef(null)
  const windowRef = useRef(null)
  const trunkRef = useRef(null)
  const leafRef = useRef(null)

  useEffect(() => {
    if (groundRef.current) buildInstances(blocks.ground, groundRef)
    if (roadRef.current) buildInstances(blocks.roads, roadRef)
    if (sidewalkRef.current) buildInstances(blocks.sidewalks, sidewalkRef)
    if (buildingRef.current) {
      buildInstances(blocks.buildingBlocks, buildingRef, true)
    }
    if (windowRef.current) buildInstances(blocks.windowBlocks, windowRef)

    const trunks = blocks.foliage.filter((item) => item.type === 'trunk')
    const leaves = blocks.foliage.filter((item) => item.type === 'leaf')
    if (trunkRef.current) buildInstances(trunks, trunkRef)
    if (leafRef.current) buildInstances(leaves, leafRef)
  }, [blocks])

  return (
    <group>
      <instancedMesh
        ref={groundRef}
        args={[null, null, blocks.ground.length]}
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[blockWorld, blockWorld * 0.3, blockWorld]} />
        <meshStandardMaterial color="#8dc46a" roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={roadRef}
        args={[null, null, blocks.roads.length]}
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[blockWorld, blockWorld * 0.2, blockWorld]} />
        <meshStandardMaterial color="#4f4f4f" roughness={0.95} />
      </instancedMesh>
      <instancedMesh
        ref={sidewalkRef}
        args={[null, null, blocks.sidewalks.length]}
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[blockWorld, blockWorld * 0.25, blockWorld]} />
        <meshStandardMaterial color="#a6a6a6" roughness={0.85} />
      </instancedMesh>
      <instancedMesh
        ref={buildingRef}
        args={[null, null, blocks.buildingBlocks.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[blockWorld, blockWorld, blockWorld]} />
        <meshStandardMaterial vertexColors roughness={0.75} />
      </instancedMesh>
      <instancedMesh
        ref={windowRef}
        args={[null, null, blocks.windowBlocks.length]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[blockWorld, blockWorld * 0.7, blockWorld * 0.2]} />
        <meshStandardMaterial
          color="#ffe9a3"
          emissive="#ffd27d"
          emissiveIntensity={1.1}
          roughness={0.4}
        />
      </instancedMesh>
      <instancedMesh
        ref={trunkRef}
        args={[null, null, blocks.foliage.filter((item) => item.type === 'trunk').length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[blockWorld * 0.5, blockWorld, blockWorld * 0.5]} />
        <meshStandardMaterial color="#6d5a42" roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={leafRef}
        args={[null, null, blocks.foliage.filter((item) => item.type === 'leaf').length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[blockWorld * 1.4, blockWorld * 1.4, blockWorld * 1.4]} />
        <meshStandardMaterial color="#4e9b4f" roughness={0.9} />
      </instancedMesh>
    </group>
  )
}

const CampusScene = ({ campus }) => {
  const playerRef = useRef(null)
  const keysRef = useRef(new Set())
  const playerPosRef = useRef({ x: 200, y: 1950 })
  const yawRef = useRef(0)
  const pitchRef = useRef(-0.2)
  const yawTargetRef = useRef(0)
  const pitchTargetRef = useRef(-0.2)
  const tempTarget = useMemo(() => new Vector3(), [])
  const tempDir = useMemo(() => new Vector3(), [])
  const tempPosition = useMemo(() => new Vector3(), [])

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
  })

  return (
    <>
      <color attach="background" args={['#cfe4b4']} />
      <fog attach="fog" args={['#e4ead8', 20, 70]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 18, 12]} intensity={1.1} castShadow />

      <VoxelWorld campus={campus} />

      {campus.entrances.map((entry) => {
        const [x, , z] = campusToWorld(campus, entry.x, entry.y)
        return (
          <mesh key={entry.id} position={[x, 0.2, z]} castShadow>
            <boxGeometry args={[0.6, 0.4, 0.6]} />
            <meshStandardMaterial color="#2f4858" />
          </mesh>
        )
      })}

      {campus.npcs.map((npc) => {
        const [x, , z] = campusToWorld(campus, npc.x, npc.y)
        return (
          <mesh key={npc.id} position={[x, 0.6, z]} castShadow>
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshStandardMaterial color="#264653" />
          </mesh>
        )
      })}

      <mesh ref={playerRef} position={[0, 0.6, 0]} visible={false}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#1f2a44" />
      </mesh>
    </>
  )
}

function App() {
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
          color: '#577590',
        },
        {
          id: 'library',
          name: 'Library',
          type: 'Library',
          rect: { x: 360, y: 420, w: 180, h: 150 },
          color: '#f28f3b',
        },
        {
          id: 'teachers',
          name: "Teachers' Room",
          type: 'Office',
          rect: { x: 840, y: 420, w: 220, h: 150 },
          color: '#4d9078',
        },
        {
          id: 'admission',
          name: 'Admission Office',
          type: 'Office',
          rect: { x: 520, y: 1180, w: 360, h: 180 },
          color: '#90be6d',
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
      <Canvas className="campus-canvas" shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <CampusScene campus={campus} />
      </Canvas>
    </div>
  )
}

export default App
