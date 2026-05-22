import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Vector3 } from 'three'
import { clamp, circleHitsRect, campusToWorld, PLAYER_START } from '../utils/world'
import Cars from './Cars'
import Npcs from './Npcs'
import Rain from './Rain'
import SkyDome from './SkyDome'
import Moon from './Moon'
import Sun from './Sun'
import DarkClouds from './DarkClouds'
import VoxelWorld from './VoxelWorld'

const CampusScene = ({ campus, mode, isRain }) => {
  const playerRef = useRef(null)
  const keysRef = useRef(new Set())
  const playerPosRef = useRef({ ...PLAYER_START })
  const yawRef = useRef(0)
  const pitchRef = useRef(-0.2)
  const yawTargetRef = useRef(0)
  const pitchTargetRef = useRef(-0.2)
  const pointerDownRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const tempTarget = useMemo(() => new Vector3(), [])
  const tempDir = useMemo(() => new Vector3(), [])
  const tempPosition = useMemo(() => new Vector3(), [])
  const isNight = mode === 'night'
  const sunPosition = [26, 28, -24]
  const moonPosition = [-32, 26, -30]

  useEffect(() => {
    const handlePointerDown = (event) => {
      pointerDownRef.current = true
      lastPointerRef.current = { x: event.clientX, y: event.clientY }
    }

    const handlePointerUp = () => {
      pointerDownRef.current = false
    }

    const handlePointerMove = (event) => {
      if (!pointerDownRef.current) return
      const deltaX = event.clientX - lastPointerRef.current.x
      const deltaY = event.clientY - lastPointerRef.current.y
      lastPointerRef.current = { x: event.clientX, y: event.clientY }

      const sensitivity = 0.0025
      yawTargetRef.current -= deltaX * sensitivity
      pitchTargetRef.current = clamp(
        pitchTargetRef.current - deltaY * sensitivity,
        -1.05,
        0.65,
      )
    }

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

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointerleave', handlePointerUp)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointerleave', handlePointerUp)
      window.removeEventListener('pointermove', handlePointerMove)
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
      <color
        attach="background"
        args={[isNight ? '#0b1220' : isRain ? '#c7d4e5' : '#d7e5f7']}
      />
      <fog
        attach="fog"
        args={[isNight ? '#111827' : isRain ? '#b5c4d8' : '#c9d9ee', 18, 72]}
      />
      <SkyDome isNight={isNight} isRain={isRain} />
      <ambientLight intensity={isNight ? 0.22 : isRain ? 0.38 : 0.18} />
      <hemisphereLight
        intensity={isNight ? 0.18 : isRain ? 0.32 : 0.2}
        color={isNight ? '#7aa2ff' : isRain ? '#d2e2f2' : '#cfe6ff'}
        groundColor={isNight ? '#1b2434' : isRain ? '#9aa9bb' : '#c6d2dd'}
      />
      <directionalLight
        position={sunPosition}
        intensity={isNight ? 0.35 : isRain ? 0.7 : 1.6}
        color={isNight ? '#b8ccff' : isRain ? '#e6f2ff' : '#fff2cc'}
        castShadow={!isNight && !isRain}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
        shadow-bias={-0.0005}
      />
      {!isNight && !isRain && <Sun position={sunPosition} />}
      {isNight && <Moon position={moonPosition} />}
      {isRain && <Rain campus={campus} />}
      {isRain && <DarkClouds />}
      <VoxelWorld campus={campus} isNight={isNight} isRain={isRain} />
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
