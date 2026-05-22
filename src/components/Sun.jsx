import { useMemo } from 'react'
import { AdditiveBlending, CanvasTexture } from 'three'

const createSunTexture = () => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.02,
    size / 2,
    size / 2,
    size * 0.32,
  )
  gradient.addColorStop(0, 'rgba(255, 255, 245, 1)')
  gradient.addColorStop(0.15, 'rgba(255, 248, 220, 1)')
  gradient.addColorStop(0.32, 'rgba(255, 228, 170, 0.9)')
  gradient.addColorStop(0.55, 'rgba(255, 205, 130, 0.45)')
  gradient.addColorStop(1, 'rgba(255, 205, 130, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

const Sun = ({ position }) => {
  const texture = useMemo(() => createSunTexture(), [])

  return (
    <sprite position={position} scale={[6, 6, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={1}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  )
}

export default Sun
