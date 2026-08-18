import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const EYE_OFFSET = 10 // altura dos olhos acima do chão
const WALK_SPEED = 15 // metros por segundo
const LOOK_SENSITIVITY = 0.0035
const DRAG_THRESHOLD = 6 // px, abaixo disso é considerado "toque" (andar)

function groundHeightAt(x, z, modelObject, fallbackY, downRay) {
    if (modelObject) {
        downRay.set(new THREE.Vector3(x, fallbackY + 500, z), new THREE.Vector3(0, -1, 0))
        const hits = downRay.intersectObject(modelObject, true)
        if (hits.length) return hits[0].point.y
    }
    return fallbackY
}

// Controles estilo "Google Street View": arrastar olha ao redor,
// tocar/clicar no chão real do modelo caminha até o ponto.
export default function WalkControls({ active, bounds, modelRef }) {
    const { camera, gl } = useThree()
    const yaw = useRef(0)
    const pitch = useRef(0)
    const target = useRef(null)
    const pointer = useRef({ down: false, x: 0, y: 0, dragging: false })
    const raycaster = useRef(new THREE.Raycaster())
    const downRay = useRef(new THREE.Raycaster())

    const groundY = bounds?.groundY ?? 0
    const center = bounds?.center ?? new THREE.Vector3(0, 0, 0)
    const radius = bounds?.radius ?? 15

    // ao entrar no modo passeio, posiciona a câmera em pé no chão real do modelo
    useEffect(() => {
        if (!active) return
        const startX = center.x
        const startZ = center.z + radius * 0.8
        const startY = groundHeightAt(startX, startZ, modelRef?.current, groundY, downRay.current)
        camera.position.set(startX, startY + EYE_OFFSET, startZ)
        camera.lookAt(center.x, startY + EYE_OFFSET, center.z)
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
        yaw.current = euler.y
        pitch.current = euler.x
        target.current = null
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    useEffect(() => {
        if (!active) return
        const el = gl.domElement

        const getXY = (e) => {
            if (e.touches && e.touches.length) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY }
            }
            return { x: e.clientX, y: e.clientY }
        }

        const onDown = (e) => {
            const { x, y } = getXY(e)
            pointer.current = { down: true, x, y, dragging: false }
        }

        const onMove = (e) => {
            if (!pointer.current.down) return
            const { x, y } = getXY(e)
            const dx = x - pointer.current.x
            const dy = y - pointer.current.y

            if (!pointer.current.dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
                pointer.current.dragging = true
            }

            if (pointer.current.dragging) {
                yaw.current -= dx * LOOK_SENSITIVITY
                pitch.current -= dy * LOOK_SENSITIVITY
                pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current))
                pointer.current.x = x
                pointer.current.y = y
            }
        }

        const onUp = (e) => {
            if (pointer.current.down && !pointer.current.dragging) {
                const { x, y } = getXY(e.changedTouches ? e.changedTouches[0] : e)
                const rect = el.getBoundingClientRect()
                const ndc = new THREE.Vector2(
                    ((x - rect.left) / rect.width) * 2 - 1,
                    -((y - rect.top) / rect.height) * 2 + 1,
                )
                raycaster.current.setFromCamera(ndc, camera)

                let hitPoint = null
                if (modelRef?.current) {
                    const hits = raycaster.current.intersectObject(modelRef.current, true)
                    if (hits.length) hitPoint = hits[0].point.clone()
                }
                if (hitPoint) {
                    const dist = Math.hypot(hitPoint.x - center.x, hitPoint.z - center.z)
                    if (dist > radius * 1.2) {
                        hitPoint.x = center.x + ((hitPoint.x - center.x) / dist) * radius * 1.2
                        hitPoint.z = center.z + ((hitPoint.z - center.z) / dist) * radius * 1.2
                    }
                    target.current = hitPoint
                }
            }
            pointer.current.down = false
            pointer.current.dragging = false
        }

        el.addEventListener('pointerdown', onDown)
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerup', onUp)
        el.addEventListener('pointerleave', onUp)

        return () => {
            el.removeEventListener('pointerdown', onDown)
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerup', onUp)
            el.removeEventListener('pointerleave', onUp)
        }
    }, [active, camera, gl, modelRef, center.x, center.z, radius])

    useFrame((_, delta) => {
        if (!active) return

        camera.quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ'))

        if (target.current) {
            const pos = camera.position
            const dx = target.current.x - pos.x
            const dz = target.current.z - pos.z
            const dist = Math.hypot(dx, dz)
            if (dist < 0.1) {
                target.current = null
            } else {
                const step = Math.min(dist, WALK_SPEED * delta)
                pos.x += (dx / dist) * step
                pos.z += (dz / dist) * step
            }
        }

        // acompanha a altura real do terreno/piso do modelo a cada frame
        const groundHere = groundHeightAt(camera.position.x, camera.position.z, modelRef?.current, groundY, downRay.current)
        camera.position.y = groundHere + EYE_OFFSET
    })

    return null
}
