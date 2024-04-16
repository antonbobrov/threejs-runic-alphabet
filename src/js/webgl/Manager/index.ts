import { Scene, Camera, Vector2 } from 'three';
import {
  AnimationFrame,
  Callbacks,
  IOnResize,
  onResize,
} from '@anton.bobrov/vevet-init';
import { DeepRequired } from 'ts-essentials';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { WebglCamera } from '../Camera';
import { WebglRenderer } from '../Renderer';
import { IWebglManagerCallbacksTypes, IWebglManagerProps } from './types';

export class WebglManager<TCamera extends Camera | undefined = undefined> {
  private _props: DeepRequired<IWebglManagerProps>;

  get props() {
    return this._props;
  }

  private _container: HTMLElement;

  get container() {
    return this._container;
  }

  private _canvas: HTMLCanvasElement;

  private _rendererInstance: WebglRenderer;

  private _composer: EffectComposer;

  get renderer() {
    return this._rendererInstance.renderer;
  }

  private _cameraInstance?: WebglCamera;

  get cameraInstance() {
    return this._cameraInstance;
  }

  private _camera: TCamera extends Camera ? TCamera : WebglCamera['camera'];

  get camera() {
    return this._camera;
  }

  private _scene: Scene;

  get scene() {
    return this._scene;
  }

  private _resizeCallback?: IOnResize;

  private _callbacks: Callbacks<IWebglManagerCallbacksTypes>;

  get callbacks() {
    return this._callbacks;
  }

  private _animationFrame: AnimationFrame;

  get animationFrame() {
    return this._animationFrame;
  }

  get easeMultiplier() {
    return this.animationFrame.easeMultiplier;
  }

  constructor(
    containerSelector: HTMLElement | string,
    initialProps: IWebglManagerProps,
    camera?: TCamera,
  ) {
    const container =
      typeof containerSelector === 'string'
        ? (document.querySelector(containerSelector) as HTMLElement)
        : containerSelector;

    if (container) {
      this._container = container;
    } else {
      throw new Error('No Container Element');
    }

    // create canvas
    this._canvas = document.createElement('canvas');
    container.appendChild(this._canvas);

    // set props
    const defaultProps: DeepRequired<IWebglManagerProps> = {
      cameraProps: {
        fov: undefined as any,
        perspective: 800,
        near: 1,
        far: 10000,
      },
      rendererProps: {} as any,
    };
    this._props = {
      cameraProps: { ...defaultProps.cameraProps, ...initialProps.cameraProps },
      rendererProps: {
        ...defaultProps.rendererProps,
        ...initialProps.rendererProps,
      },
    };

    const { rendererProps, cameraProps } = this.props;

    // create base elements
    this._rendererInstance = new WebglRenderer(
      container,
      this._canvas,
      rendererProps,
    );

    // create camera
    if (camera) {
      this._camera = camera as any;
    } else {
      this._cameraInstance = new WebglCamera(
        container,
        cameraProps.fov,
        cameraProps.perspective,
        cameraProps.near,
        cameraProps.far,
      );
      this._camera = this._cameraInstance.camera as any;
    }

    // create scene
    this._scene = new Scene();

    // COMPOSER

    const renderScene = new RenderPass(this._scene, this._camera);

    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      0.65,
      0.5,
      0.0,
    );

    const outputPass = new OutputPass();

    const composer = new EffectComposer(this.renderer);
    this._composer = composer;
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    // create viewport callbacks
    this._resizeCallback = onResize({
      element: container,
      hasBothEvents: true,
      onResize: () => this.resize(),
    });

    // create callbacks
    this._callbacks = new Callbacks();

    // resize for the first time
    this.resize();

    // create an animation frame
    this._animationFrame = new AnimationFrame();
    this._animationFrame.addCallback('frame', () => this.render());
  }

  public resize() {
    this.callbacks.tbt('beforeResize', undefined);

    this._rendererInstance.resize();
    this._cameraInstance?.resize();

    this._composer.setSize(
      this._rendererInstance.width,
      this._rendererInstance.height,
    );

    this.callbacks.tbt('resize', undefined);

    this.render();
  }

  public play() {
    this.animationFrame.play();
  }

  public pause() {
    this.animationFrame.pause();
  }

  get width() {
    return this._rendererInstance.width;
  }

  get height() {
    return this._rendererInstance.height;
  }

  get dpr() {
    return this._rendererInstance.dpr;
  }

  public render() {
    this.callbacks.tbt('render', undefined);

    if (this.width > 0 && this.height > 0) {
      this._composer.render();
    }

    this.callbacks.tbt('afterRender', undefined);
  }

  destroy() {
    this._canvas.remove();

    this._rendererInstance.destroy();

    this._animationFrame.destroy();
    this._resizeCallback?.remove();
    this._callbacks.destroy();
  }
}
