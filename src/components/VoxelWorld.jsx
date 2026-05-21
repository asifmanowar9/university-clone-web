import Buildings from './Buildings'
import Ground from './Ground'
import Landmarks from './Landmarks'
import Roads from './Roads'

const VoxelWorld = ({ campus }) => (
  <group>
    <Ground campus={campus} />
    <Roads campus={campus} />
    <Buildings campus={campus} />
    <Landmarks campus={campus} />
  </group>
)

export default VoxelWorld
