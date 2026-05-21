import { useLoader } from '@react-three/fiber'
import { BackSide, RepeatWrapping, SRGBColorSpace, TextureLoader } from 'three'

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

export default SkyDome
