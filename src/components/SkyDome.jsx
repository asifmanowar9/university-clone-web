import { BackSide } from 'three'

const SkyDome = ({ isNight }) => (
  <mesh scale={180}>
    <sphereGeometry args={[1, 48, 32]} />
    <meshBasicMaterial
      side={BackSide}
      depthWrite={false}
      color={isNight ? '#0f172a' : '#e7f1ff'}
    />
  </mesh>
)

export default SkyDome
