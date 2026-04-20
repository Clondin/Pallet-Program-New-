"use client";

export function SceneLighting() {
  return (
    <>
      <ambientLight color="#faf5ee" intensity={0.5} />
      <directionalLight
        castShadow
        color="#fff8f0"
        intensity={1.2}
        position={[40, 80, 50]}
        shadow-bias={-0.001}
        shadow-camera-bottom={-10}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-near={10}
        shadow-camera-right={60}
        shadow-camera-top={80}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <directionalLight color="#e8f0ff" intensity={0.4} position={[-30, 50, -30]} />
      <directionalLight color="#ffffff" intensity={0.25} position={[0, 30, -60]} />
      <hemisphereLight args={["#c8daf0", "#d4c4a8", 0.3]} />
    </>
  );
}
