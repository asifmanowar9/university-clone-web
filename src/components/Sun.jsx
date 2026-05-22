import { useLoader } from '@react-three/fiber'
import { TextureLoader, SRGBColorSpace } from 'three'

const Sun = ({ position }) => {
  const texture = useLoader(TextureLoader, '/sun-48190.png')

  texture.colorSpace = SRGBColorSpace

  return (
    <sprite position={position} scale={[25, 25, 1]} renderOrder={999}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </sprite>
  )
}

export default Sun