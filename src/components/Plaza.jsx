import { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

const modelPath = `${import.meta.env.BASE_URL}models/praca.glb`

// onLoaded recebe o Object3D raiz, usado para ajustar câmera e para o raycast do modo "passear"
export default function Plaza({ onLoaded }) {
    const { scene } = useGLTF(modelPath)
    const ref = useRef()

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        onLoaded?.(ref.current)
    }, [scene, onLoaded])

    return (
        <group ref={ref}>
            <primitive object={scene} />
        </group>
    )
}

useGLTF.preload(modelPath)