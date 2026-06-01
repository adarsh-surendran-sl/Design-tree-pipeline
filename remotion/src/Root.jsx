import { Composition, Still } from 'remotion'
import { DesignTreeFrame } from './DesignTreeFrame.jsx'

const defaultTree = {
  type: 'frame',
  width: 1080,
  height: 1080,
  backgroundColor: '#1a1a2e',
  children: [
    {
      id: 'headline',
      type: 'text',
      role: 'headline',
      text: 'Your Product',
      x: 64,
      y: 64,
      width: 952,
      height: 80,
      fontSize: 56,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 20,
    },
    {
      id: 'cta',
      type: 'button',
      role: 'cta',
      text: 'Shop Now',
      x: 64,
      y: 920,
      width: 240,
      height: 56,
      fontSize: 22,
      fontWeight: 'bold',
      backgroundColor: '#e94560',
      color: '#ffffff',
      borderRadius: 12,
      zIndex: 25,
    },
  ],
}

export const RemotionRoot = () => {
  return (
    <>
      <Still
        id="DesignTreeStill"
        component={DesignTreeFrame}
        width={1080}
        height={1080}
        defaultProps={{
          tree: defaultTree,
          assetsBaseUrl: '',
        }}
      />
      <Composition
        id="DesignTreeComposition"
        component={DesignTreeFrame}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          tree: defaultTree,
          assetsBaseUrl: '',
        }}
      />
    </>
  )
}
