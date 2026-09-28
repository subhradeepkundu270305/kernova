import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../themes'

export const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { reduceEffects, editorTheme } = useSettingsStore()

  useEffect(() => {
    if (reduceEffects || !containerRef.current) return

    const container = containerRef.current
    let width = container.clientWidth
    let height = container.clientHeight

    const currentTheme = THEMES[editorTheme] || THEMES.midnight

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 80

    // WebGL Renderer with performance optimizations
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    container.appendChild(renderer.domElement)

    // Particle Cloud Geometry
    const particleCount = 200
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const colorPrimary = new THREE.Color(currentTheme.primary)
    const colorSecondary = new THREE.Color(currentTheme.secondary)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80

      const mixedColor = colorPrimary.clone().lerp(colorSecondary, Math.random())
      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Material
    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Wireframe geometric polyhedron core
    const coreGeo = new THREE.IcosahedronGeometry(22, 1)
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(currentTheme.primary),
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    scene.add(coreMesh)

    // Mouse parallax
    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.02
      mouseY = (e.clientY - height / 2) * 0.02
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop (throttles when window is hidden)
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const delta = clock.getDelta()
      particles.rotation.y += delta * 0.05
      particles.rotation.x += delta * 0.02

      coreMesh.rotation.x += delta * 0.08
      coreMesh.rotation.y += delta * 0.12

      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }

    animate()

    // Resize handler
    const handleResize = () => {
      if (!container) return
      width = container.clientWidth
      height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [reduceEffects, editorTheme])

  if (reduceEffects) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-70"
    />
  )
}
