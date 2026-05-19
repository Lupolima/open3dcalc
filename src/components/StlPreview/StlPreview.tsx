import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center } from '@react-three/drei'
import { useMemo } from 'react'
import { BufferGeometry } from 'three'

interface StlPreviewProps {
  geometry: BufferGeometry | null
}

function Model({ geometry }: { geometry: BufferGeometry }) {
  const geo = useMemo(() => geometry.clone(), [geometry])
  return (
    <Center>
      <mesh geometry={geo} scale={0.01}>
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.3}
          roughness={0.6}
          wireframe={false}
        />
      </mesh>
      <mesh geometry={geo} scale={0.01}>
        <meshBasicMaterial color="#a78bfa" wireframe opacity={0.15} transparent />
      </mesh>
    </Center>
  )
}

export function StlPreview({ geometry }: StlPreviewProps) {
  if (!geometry) {
    return (
      <div className="glass rounded-xl h-48 flex items-center justify-center">
        <p className="text-sm text-gray-400">Nenhum modelo carregado</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl h-48 overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <Model geometry={geometry} />
        <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} />
      </Canvas>
    </div>
  )
}
