import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Vector3 } from 'three'
import { clamp, circleHitsRect, campusToWorld, PLAYER_START } from '../utils/world'
import Cars from './Cars'
import Npcs from './Npcs'
import SkyDome from './SkyDome'
import VoxelWorld from './VoxelWorld'

const CampusScene = ({ campus, mode }) => {
  const playerRef = useRef(null)
  const keysRef = useRef(new Set())
  const playerPosRef = useRef({ ...PLAYER_START })
  const yawRef = useRef(0)
  const pitchRef = useRef(-0.2)
  const yawTargetRef = useRef(0)
  const pitchTargetRef = useRef(-0.2)
  const tempTarget = useMemo(() => new Vector3(), [])
  const tempDir = useMemo(() => new Vector3(), [])
  const tempPosition = useMemo(() => new Vector3(), [])
  const isNight = mode === 'night'
  const sunPosition = [14, 18, -10]

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
      <Npcs campus={campus} />

      <mesh ref={playerRef} position={[0, 0.6, 0]} visible={false}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#1f2a44" />
      </mesh>
    </>
  )
}

export default CampusScene
