import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { SRGBColorSpace, TextureLoader } from 'three'

const DarkClouds = () => {
  const groupRef = useRef(null)
  const { camera } = useThree()
  const texture = useLoader(TextureLoader, '/darkcloud.png')

  texture.colorSpace = SRGBColorSpace

  const clouds = useMemo(
    () => [
      { position: [-30, 9, -20], scale: [24, 10, 1], opacity: 0.75 },
      { position: [16, 10, -26], scale: [20, 10, 1], opacity: 0.7 },
      { position: [-4, 8, 28], scale: [30, 10, 1], opacity: 0.78 },
      { position: [26, 9, 14], scale: [22, 11, 1], opacity: 0.72 },
      { position: [-36, 11, 8], scale: [18, 12, 1], opacity: 0.68 },
    ],
    [],
  )

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(camera.position)
    }
  })

  return (
    <group ref={groupRef} renderOrder={5}>
      {clouds.map((cloud, index) => (
        <sprite
          key={`cloud-${index}`}
          position={cloud.position}
          scale={cloud.scale}
        >
          <spriteMaterial
            map={texture}
            transparent
            opacity={cloud.opacity}
            depthWrite={false}
            fog={false}
          />
        </sprite>
      ))}
    </group>
  )
}

export default DarkClouds
