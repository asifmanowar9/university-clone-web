import Buildings from './Buildings'
import Ground from './Ground'
import Landmarks from './Landmarks'
import LampPosts from './LampPosts'
import MainGate from './MainGate'
import Roads from './Roads'
import SportsField from './SportsField'

const VoxelWorld = ({ campus, isNight, isRain }) => (
  <group>
    <Ground campus={campus} isRain={isRain} />
    <Roads campus={campus} isRain={isRain} />
    <SportsField campus={campus} isNight={isNight} />
    <MainGate campus={campus} />
    <Buildings campus={campus} />
    <LampPosts campus={campus} isNight={isNight} />
    <Landmarks campus={campus} />
  </group>
)

export default VoxelWorld
