import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { height, profile, type VolcanoType } from '@/engine/volcano/shape'
import { MATERIAL } from '../draw'

const COLOUR: Record<VolcanoType, string> = { shield: MATERIAL.oceanCrust, strato: MATERIAL.ash, cinder: MATERIAL.ash, caldera: MATERIAL.debris }
/** How far below the top the summit floor sits, as a fraction of the height: a crater on the cones, a deep floor in the caldera. */
const FLOOR_DEPTH: Record<VolcanoType, number> = { shield: 0, strato: 0.05, cinder: 0.12, caldera: 0.45 }
const SEGMENTS = 64
const TURN_PER_FRAME = 0.004

interface Stage {
  scene: THREE.Scene
  root: THREE.Group
}

const disposeMesh = (o: THREE.Object3D) => {
  if (o instanceof THREE.Mesh) {
    o.geometry.dispose()
    const mat = o.material as THREE.Material | THREE.Material[]
    ;(Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose())
  }
}

/** The edifice as a lathe of the profile curve, flat-shaded, with a disc closing its top at the floor depth. */
const buildEdifice = (type: VolcanoType): THREE.Group => {
  const n = 48
  const radii = profile(type, n)
  const h = height(type)
  const points = radii.map((r, i) => new THREE.Vector2(r, (i / (n - 1)) * h))
  const material = new THREE.MeshStandardMaterial({ color: COLOUR[type], flatShading: true, roughness: 0.9, side: THREE.DoubleSide })
  const group = new THREE.Group()
  group.add(new THREE.Mesh(new THREE.LatheGeometry(points, SEGMENTS), material))
  // The floor: the lathe's radius at that height, read back off the same points.
  const floorY = h * (1 - FLOOR_DEPTH[type])
  const above = points.findIndex((p) => p.y >= floorY)
  const floorR = above <= 0 ? radii[radii.length - 1]! : radii[above - 1]!
  const floor = new THREE.Mesh(new THREE.CircleGeometry(floorR, SEGMENTS), material)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = floorY
  group.add(floor)
  return group
}

/** The volcano turntable. Everything Three.js lives in this file; the renderer mounts once and the edifice is rebuilt per type. */
export function VolcanoScene({ type }: { type: VolcanoType }) {
  const mount = useRef<HTMLDivElement>(null)
  const stage = useRef<Stage | null>(null)

  useEffect(() => {
    const el = mount.current
    if (!el) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 4 / 3, 0.1, 100)
    camera.position.set(2.5, 0.7, 2.8)
    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(5, 8, 10)
    scene.add(key)

    const root = new THREE.Group()
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.35, SEGMENTS), new THREE.MeshStandardMaterial({ color: MATERIAL.greensand, flatShading: true, roughness: 1 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.002
    root.add(ground)
    scene.add(root)
    stage.current = { scene, root }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.15, 0)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.maxPolarAngle = Math.PI / 2 - 0.04

    let frame = 0
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight || Math.round(w * 0.75)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()
    const tick = () => {
      if (document.documentElement.dataset.reducedMotion !== 'true') root.rotation.y += TURN_PER_FRAME
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      scene.traverse(disposeMesh)
      renderer.dispose()
      el.removeChild(renderer.domElement)
      stage.current = null
    }
  }, [])

  useEffect(() => {
    const s = stage.current
    if (!s) return
    const edifice = buildEdifice(type)
    s.root.add(edifice)
    return () => {
      s.root.remove(edifice)
      edifice.traverse(disposeMesh)
    }
  }, [type])

  return <div ref={mount} className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" />
}

export default VolcanoScene
