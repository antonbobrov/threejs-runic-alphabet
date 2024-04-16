import { ProgressPreloader } from '@anton.bobrov/vevet-init';
import { TProps } from './types';

export class Preloader {
  private _instance: ProgressPreloader;

  private get container() {
    return this._props.container;
  }

  private _percent: HTMLElement;

  private _wheel: HTMLElement;

  constructor(private _props: TProps) {
    this._instance = new ProgressPreloader({
      container: this.container,
      hideAnimation: 1200,
      lerp: 0.01,
    });

    this._percent = this.container.querySelector('.js-preloader-percent')!;

    this._wheel = this.container.querySelector('.js-preloader-wheel')!;

    this._instance.addCallback('progress', ({ progress }) =>
      this._renderProgress(progress),
    );
  }

  private _renderProgress(progress: number) {
    // render percent

    let percent = Math.floor(progress * 100);
    percent = Math.min(Math.floor(percent / 5) * 5, 99);

    const percentString = `${percent}`.padStart(2, '0');
    this._percent.innerHTML = `${percentString}%`;
    this._percent.style.opacity = '1';
    this._percent.style.filter = `blur(${5 * progress}px)`;

    // render wheel
    const wheelScale = 1 + progress * 1;

    this._wheel.style.transform = `scale(${wheelScale})`;
    this._wheel.style.opacity = '1';
    this._wheel.style.filter = `blur(${5 + 15 * progress}px) brightness(1.5)`;
  }

  public destroy() {
    this._instance.destroy();
  }
}
