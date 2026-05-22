import { useLoader } from '@react-three/fiber'
import { TextureLoader, SRGBColorSpace } from 'three'

const Moon = ({ position }) => {
  const texture = useLoader(TextureLoader, '/moon.png')
  texture.colorSpace = SRGBColorSpace

  return (
    <sprite position={position} scale={[5.4, 5.4, 1]}>
      <spriteMaterial map={texture} transparent opacity={0.95} depthWrite={false} />
    </sprite>
  )
}

export default Moon
