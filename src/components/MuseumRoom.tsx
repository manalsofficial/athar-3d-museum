import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";
import { exhibits } from "../data/demo";
import type { Exhibit } from "../types";

const framePositions: Array<{ position: [number, number, number]; rotation: [number, number, number] }> = [
  { position: [-5.86, 2.7, -2.2], rotation: [0, Math.PI / 2, 0] },
  { position: [-5.86, 2.7, 0], rotation: [0, Math.PI / 2, 0] },
  { position: [-5.86, 2.7, 2.2], rotation: [0, Math.PI / 2, 0] },
  { position: [-1.7, 2.7, 5.86], rotation: [0, Math.PI, 0] },
  { position: [1.7, 2.7, 5.86], rotation: [0, Math.PI, 0] },
  { position: [5.86, 2.7, 2.2], rotation: [0, -Math.PI / 2, 0] },
  { position: [5.86, 2.7, 0], rotation: [0, -Math.PI / 2, 0] },
  { position: [5.86, 2.7, -2.2], rotation: [0, -Math.PI / 2, 0] },
];

// The exhibit views are deliberately pulled farther back so the artwork feels like
// part of a museum room rather than filling the entire screen.
const cameraTargets = [
  { position: [-1.45, 2.9, -2.2], target: [-5.86, 2.7, -2.2] },
  { position: [-1.45, 2.9, 0], target: [-5.86, 2.7, 0] },
  { position: [-1.45, 2.9, 2.2], target: [-5.86, 2.7, 2.2] },
  { position: [-1.7, 2.9, 1.15], target: [-1.7, 2.7, 5.86] },
  { position: [1.7, 2.9, 1.15], target: [1.7, 2.7, 5.86] },
  { position: [1.45, 2.9, 2.2], target: [5.86, 2.7, 2.2] },
  { position: [1.45, 2.9, 0], target: [5.86, 2.7, 0] },
  { position: [1.45, 2.9, -2.2], target: [5.86, 2.7, -2.2] },
] as const;

const roomCamera = {
  // Camera is INSIDE the museum, near the entrance.
  position: [0, 2.8, -4.15] as [number, number, number],

  // Look toward the center of the room so the vase remains visible.
  target: [0, 2.25, 0.9] as [number, number, number],
};

function Artwork({ image }: { image: string }) {
  const texture = useLoader(THREE.TextureLoader, image);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh position={[0, 0, 0.065]}>
      <planeGeometry args={[1.58, 2.18]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Frame({ exhibit, position, rotation, selected, onClick, interactive }: {
  exhibit: Exhibit;
  position: [number, number, number];
  rotation: [number, number, number];
  selected: boolean;
  onClick: () => void;
  interactive: boolean;
}) {
  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(event) => {
        if (!interactive) return;
        event.stopPropagation();
        onClick();
      }}
    >
      <mesh>
        <boxGeometry args={[1.82, 2.47, 0.08]} />
        <meshStandardMaterial
          color={selected ? "#d5b66f" : "#a9824b"}
          metalness={0.45}
          roughness={0.3}
          emissive={selected ? "#3c2d16" : "#000000"}
          emissiveIntensity={selected ? 0.8 : 0}
        />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[1.68, 2.32, 0.035]} />
        <meshStandardMaterial color="#15120f" roughness={0.85} />
      </mesh>
      <Artwork image={exhibit.image} />
    </group>
  );
}

function TexturedRoom() {
  const floor = useLoader(THREE.TextureLoader, "/textures/floor.jpg");
  const wall = useLoader(THREE.TextureLoader, "/textures/wall.jpg");
  const ceiling = useLoader(THREE.TextureLoader, "/textures/ceiling.jpg");

  useMemo(() => {
    for (const texture of [floor, wall, ceiling]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    floor.repeat.set(4, 4);
    wall.repeat.set(4, 2);
    ceiling.repeat.set(4, 4);
  }, [floor, wall, ceiling]);

  return (
    <>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[12, 0.1, 12]} />
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3, -6]}>
        <boxGeometry args={[12, 6, 0.12]} />
        <meshStandardMaterial map={wall} roughness={0.92} />
      </mesh>
      <mesh position={[0, 3, 6]}>
        <boxGeometry args={[12, 6, 0.12]} />
        <meshStandardMaterial map={wall} roughness={0.92} />
      </mesh>
      <mesh position={[-6, 3, 0]}>
        <boxGeometry args={[0.12, 6, 12]} />
        <meshStandardMaterial map={wall} roughness={0.92} />
      </mesh>
      <mesh position={[6, 3, 0]}>
        <boxGeometry args={[0.12, 6, 12]} />
        <meshStandardMaterial map={wall} roughness={0.92} />
      </mesh>
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[12, 0.12, 12]} />
        <meshStandardMaterial map={ceiling} roughness={1} />
      </mesh>
    </>
  );
}

function CameraController({ selectedIndex, exploring }: { selectedIndex: number; exploring: boolean }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(...roomCamera.position));
  const targetLookAt = useRef(new THREE.Vector3(...roomCamera.target));
  const lookAt = useRef(new THREE.Vector3(...roomCamera.target));

  useFrame(() => {
    const destination = exploring ? cameraTargets[selectedIndex] || cameraTargets[0] : roomCamera;
    targetPosition.current.set(...destination.position);
    targetLookAt.current.set(...destination.target);

    camera.position.lerp(targetPosition.current, exploring ? 0.045 : 0.035);
    lookAt.current.lerp(targetLookAt.current, 0.055);
    camera.lookAt(lookAt.current);
  });

  return null;
}

function Vase() {
  const { scene } = useGLTF("/models/vase.glb");
  return (
    <Float speed={0.7} rotationIntensity={0.05} floatIntensity={0.02}>
      <primitive object={scene.clone()} position={[0, 0.3, 0]} scale={1.05} />
    </Float>
  );
}

export function MuseumRoom({
  selectedIndex,
  exploring,
  onSelectedIndexChange,
  onSelect,
}: {
  selectedIndex: number;
  exploring: boolean;
  onSelectedIndexChange: (index: number) => void;
  onSelect: (exhibit: Exhibit, index: number) => void;
}) {
  const museumExhibits = exhibits as Exhibit[];

  useEffect(() => {
    if (!exploring) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onSelectedIndexChange(Math.min(museumExhibits.length - 1, selectedIndex + 1));
      if (event.key === "ArrowRight") onSelectedIndexChange(Math.max(0, selectedIndex - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exploring, museumExhibits.length, onSelectedIndexChange, selectedIndex]);

  return (
    <div className="museum-canvas">
      <Canvas
  camera={{
    position: roomCamera.position,
    fov: 60
  }}
  dpr={[1, 2]}
  shadows
>
        <color attach="background" args={["#100e0c"]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight intensity={0.35} color="#fff0d0" groundColor="#17130f" />
        <TexturedRoom />

        <pointLight position={[-4, 4.8, 1]} intensity={18} distance={10} color="#d7b274" />
        <pointLight position={[4, 4.8, 1]} intensity={18} distance={10} color="#d7b274" />
        <pointLight position={[0, 4.5, 4]} intensity={16} distance={9} color="#fff0d0" />
        <pointLight position={[0, 3.8, -3]} intensity={10} distance={9} color="#cda86d" />
        <Environment preset="city" environmentIntensity={0.16} />

        {museumExhibits.map((exhibit, index) => {
          const frame = framePositions[index];
          return (
            <Frame
              key={exhibit.id}
              exhibit={exhibit}
              position={frame.position}
              rotation={frame.rotation}
              selected={exploring && selectedIndex === index}
              interactive={exploring}
              onClick={() => {
                onSelectedIndexChange(index);
                onSelect(exhibit, index);
              }}
            />
          );
        })}

        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.78, 0.92, 0.36, 48]} />
          <meshStandardMaterial color="#3b3025" roughness={0.65} />
        </mesh>
        <Vase />
        <CameraController selectedIndex={selectedIndex} exploring={exploring} />
      </Canvas>

      {exploring && (
        <div className="museum-controls" aria-label="Museum exhibit navigation">
          <button
            type="button"
            className="museum-arrow"
            disabled={selectedIndex === museumExhibits.length - 1}
            onClick={() => onSelectedIndexChange(Math.min(museumExhibits.length - 1, selectedIndex + 1))}
            aria-label="Move left"
          ><ChevronLeft size={22} /></button>
          <span>{selectedIndex + 1} / {museumExhibits.length}</span>
          <button
            type="button"
            className="museum-arrow"
            disabled={selectedIndex === 0}
            onClick={() => onSelectedIndexChange(Math.max(0, selectedIndex - 1))}
            aria-label="Move right"
          ><ChevronRight size={22} /></button>
        </div>
      )}
    </div>
  );
}

useGLTF.preload("/models/vase.glb");
