import Buildings from './Buildings'
import Ground from './Ground'
import Landmarks from './Landmarks'
import LampPosts from './LampPosts'
import MainGate from './MainGate'
import Roads from './Roads'

const VoxelWorld = ({ campus, isNight }) => (
  <group>
    <Ground campus={campus} />
    <Roads campus={campus} />
    <MainGate campus={campus} />
    <Buildings campus={campus} />
    <LampPosts campus={campus} isNight={isNight} />
    <Landmarks campus={campus} />
  </group>
)

export default VoxelWorld
