import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

@Component({
  selector: 'app-logo-scene',
  templateUrl: './logo-scene.component.html',
  styleUrls: ['./logo-scene.component.css']
})
export class LogoSceneComponent implements OnInit {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private logoMesh!: THREE.Group;
  private starField!: THREE.Points;  // Declare starField
  private starVelocities!: Float32Array;  // Declare starVelocities
  private light!: THREE.PointLight;  // Point light to follow the cursor
  private mouse = new THREE.Vector2(0, 0); // Mouse position

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.initThreeJs();
  
      // Listen to window resize and adjust renderer size
      window.addEventListener('resize', () => {
        this.onWindowResize();
      });
    } else {
      console.log('Not running in a browser environment, skipping Three.js initialization.');
    }
  }

  onWindowResize() {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  
    this.renderer.setSize(width, height);
  }

  initThreeJs() {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(-0.65, -0.30, 1.74); // Camera positioned 2 units away
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));  // Focus on the origin or the logo's position

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;

     // Add dynamic light following the cursor
     this.light = new THREE.PointLight(0xffffff, 2, 100); // Dynamic light
     this.light.position.set(1, 1, 1); // Initially place it in front of the model
     this.scene.add(this.light);

     // Key Light (strong directional light acting like a sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 20);  // Intense light for strong illumination
    directionalLight.position.set(1, 1, 1);  // Adjust position
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

     // Add event listener to log camera position in console when it moves
    this.controls.addEventListener('change', () => this.updateCameraPosition());

    const spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.position.set(0, 5, 0);  // Place above your model
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    // Use the RGBELoader to load an HDR environment map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    // Use the EXRLoader to load an EXR environment map
    const exrLoader = new EXRLoader();
    exrLoader.load('/assets/envMap/milky.exr', (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      this.scene.environment = envMap;  // Set the environment map for reflections
      this.scene.background = envMap;   // Optionally set it as the background
      texture.dispose();
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,    // Reflective metal, light color
      metalness: 1,       // Fully metallic to mimic mercury
      roughness: 0.2,    // Very low roughness for a smooth surface
      envMapIntensity: 1.5, // Increase reflection intensity to highlight environment
    });

    // Load the GLTF file
    const loader = new GLTFLoader();
    loader.load('/assets/models/liminal_3d.glb', (gltf) => {
      this.logoMesh = gltf.scene;

      // Apply the material
      this.logoMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = chromeMaterial;
        }
      });

      this.logoMesh.position.set(0, 0, 0);
      this.logoMesh.rotation.x = Math.PI / 2;
      this.logoMesh.scale.set(1.5, 1.5, 1.5);

      this.scene.add(this.logoMesh);

      spotLight.target = this.logoMesh;  // Target the logo mesh
    });

    

    // Add stars to the scene
    this.addStars();

    // Start rendering loop
    this.animate();
  }

  updateCameraPosition() {
    console.log(`Camera Position - X: ${this.camera.position.x.toFixed(2)}, Y: ${this.camera.position.y.toFixed(2)}, Z: ${this.camera.position.z.toFixed(2)}`);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    // Normalize mouse position (-1 to 1)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  addStars() {
    const starCount = 5000; // Number of stars
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3); // Each star has x, y, z
  
    // Store velocity for each star
    this.starVelocities = new Float32Array(starCount * 3);
  
    for (let i = 0; i < starCount * 3; i++) {
      // Random positions for stars
      positions[i] = (Math.random() - 0.5) * 2000;
  
      // Random velocity for each star
      this.starVelocities[i] = (Math.random() - 0.5) * 0.05; // Small movement per frame
    }
  
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5, // Size of the stars
      sizeAttenuation: true, // Makes the stars smaller as they get further away
    });
  
    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
  
    // Update stars' positions for movement
    this.updateStars();
  
    // Other animation code like rotating your 3D model...
    if (this.logoMesh) {
      const tiltAmount = 0.05; // How much the logo tilts
      this.logoMesh.rotation.x = Math.PI / 2 + this.mouse.y * tiltAmount; // Tilt up/down
      this.logoMesh.rotation.y = this.mouse.x * tiltAmount; // Tilt left/right
    }
  
    // Move the light source based on cursor movement
    this.light.position.set(this.mouse.x * 10, this.mouse.y * 10, 1); // Move light with mouse

    this.renderer.render(this.scene, this.camera);
    this.controls.update();
  }
  
  updateStars() {
    const positions = this.starField.geometry.attributes['position'].array;
    const velocities = this.starVelocities;
  
    for (let i = 0; i < positions.length; i++) {
      // Update the position based on velocity
      positions[i] += velocities[i];
  
      // Optional: Wrap stars back to center if they drift too far (for infinite movement)
      if (positions[i] > 1000) positions[i] = -1000;
      if (positions[i] < -1000) positions[i] = 1000;
    }
  
    // Mark the positions as needing an update
    // Mark the positions as needing an update
    this.starField.geometry.attributes['position'].needsUpdate = true;
  }
}
