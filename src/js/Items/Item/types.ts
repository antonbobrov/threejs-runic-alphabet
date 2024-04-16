import { Object3D } from 'three';
import { WebglManager } from '../../webgl/Manager';

export type TProps = {
  manager: WebglManager;
  image: HTMLImageElement;
  parent: Object3D;
  index: number;
};
