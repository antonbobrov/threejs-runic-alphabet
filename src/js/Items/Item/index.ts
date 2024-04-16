import {
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Texture,
} from 'three';
import { TProps } from './types';

import simplexNoise from './shaders/simplexNoise.glsl';
import rotationShader from './shaders/rotation.glsl';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

export class Item {
  private _geometry: PlaneGeometry | SphereGeometry;

  private _texture: Texture;

  private _material: ShaderMaterial;

  private _mesh: Mesh | Points;

  private _progress = { in: 0, out: 0 };

  get progress() {
    return this._progress;
  }

  set progress(value) {
    this._progress = value;

    this._material.uniforms.u_inProgress.value = value.in;
    this._material.uniforms.u_outProgress.value = value.out;

    this._mesh.visible = value.in > 0 && value.out < 1;
  }

  constructor(private _props: TProps) {
    const { image, parent } = _props;

    this._geometry = new PlaneGeometry(550, 550, 150, 150);

    const helpers = simplexNoise + rotationShader;

    // create texture
    this._texture = new Texture(image);
    this._texture.needsUpdate = true;

    // create shader material
    this._material = new ShaderMaterial({
      vertexShader: helpers + vertexShader,
      fragmentShader: helpers + fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_map: { value: this._texture },
        u_inProgress: { value: 1 },
        u_outProgress: { value: 0 },
        u_rotationRadius: { value: 5.0 },
        u_PointSize: { value: 20.0 },
      },
      depthWrite: false,
      transparent: true,
    });

    // create mesh
    this._mesh = new Points(this._geometry, this._material);
    this._mesh.visible = false;
    parent.add(this._mesh);
  }

  /** Render scene */
  public render() {
    this._material.uniforms.u_time.value += 1;

    const inRotation = (1 - this._progress.in) * Math.PI * 0.5;
    const outRotation = this._progress.out * Math.PI * -2;

    this._mesh.rotation.y = inRotation + outRotation;
  }

  /** Destroy the scene */
  public destroy() {
    this._props.parent.remove(this._mesh);
    this._geometry.dispose();
    this._material.dispose();
    this._texture.dispose();
  }
}
