import { useCallback, useRef, useState, Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import Plaza from './Plaza'
import WalkControls from './WalkControls'

// posiciona a câmera com base no tamanho real do modelo carregado, uma única vez
function FitCamera({ bounds }) {
    const { camera } = useThree()
    const fitted = useRef(false)
    if (bounds && !fitted.current) {
        const { center, radius } = bounds
        camera.position.set(center.x + radius * 0.9, center.y + radius * 0.9, center.z + radius * 1.3)
        camera.lookAt(center.x, center.y, center.z)
        camera.updateProjectionMatrix()
        fitted.current = true
    }
    return null
}

export default function ProjectViewer() {
    const [mode, setMode] = useState('orbit') // 'orbit' | 'walk'
    const [bounds, setBounds] = useState(null)
    const modelRef = useRef(null)

    const handleLoaded = useCallback((object3D) => {
        modelRef.current = object3D
        const box = new THREE.Box3().setFromObject(object3D)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box.getSize(size)
        box.getCenter(center)
        const radius = Math.max(size.x, size.z) / 2 || 15
        setBounds({ center, radius, groundY: box.min.y })
    }, [])

    const target = bounds ? [bounds.center.x, bounds.center.y, bounds.center.z] : [0, 0, 0]
    const radius = bounds?.radius ?? 15

    return (
        <div className="viewer">
            <header className="viewer-header">
                <h1>Praça Central — Projeto 3D</h1>
                <p>Engenharia &amp; Construções · visualização prévia da obra</p>
            </header>

            <div className="mode-switch" role="group" aria-label="Modo de visualização">
                <button
                    type="button"
                    className={mode === 'orbit' ? 'active' : ''}
                    onClick={() => setMode('orbit')}
                >
                    🔄 Visão 360°
                </button>
                <button
                    type="button"
                    className={mode === 'walk' ? 'active' : ''}
                    onClick={() => setMode('walk')}
                >
                    🚶 Passear no modelo
                </button>
            </div>

            <p className="hint">
                {mode === 'orbit'
                    ? 'Arraste para girar, use o scroll (ou pinça) para dar zoom.'
                    : 'Arraste para olhar ao redor. Toque no chão para caminhar até o ponto.'}
            </p>

            <Canvas shadows camera={{ position: [0, 14, 22], fov: 55 }}>
                <color attach="background" args={['#bfe3f8']} />
                <ambientLight intensity={0.6} />
                <directionalLight
                    position={[10, 15, 8]}
                    intensity={1.4}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />
                <Environment preset="park" />

                <Suspense fallback={<Html center>Carregando modelo 3D…</Html>}>
                    <Plaza onLoaded={handleLoaded} />
                </Suspense>

                <FitCamera bounds={bounds} />

                {mode === 'orbit' && (
                    <OrbitControls
                        makeDefault
                        target={target}
                        enablePan={false}
                        minDistance={radius * 0.2}
                        maxDistance={radius * 4}
                        maxPolarAngle={Math.PI / 2.1}
                    />
                )}
                <WalkControls active={mode === 'walk'} bounds={bounds} modelRef={modelRef} />
            </Canvas>
        </div>
    )
}
