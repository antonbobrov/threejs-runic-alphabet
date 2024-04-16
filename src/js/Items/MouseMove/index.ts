import { lerp, scoped, vevet } from '@anton.bobrov/vevet-init';
import { IAddEventListener, addEventListener } from 'vevet-dom';

export class MouseMove {
  private _listener: IAddEventListener;

  private _target = { x: 0, y: 0 };

  private _current = { x: 0, y: 0 };

  get x() {
    return this._current.x;
  }

  get y() {
    return this._current.y;
  }

  constructor() {
    this._listener = addEventListener(window, 'mousemove', (event) =>
      this._handleMouseMove(event),
    );
  }

  private _handleMouseMove(event: MouseEvent) {
    const x = scoped(event.clientX, [
      vevet.viewport.width / 2,
      vevet.viewport.width,
    ]);

    const y = scoped(event.clientY, [
      vevet.viewport.height / 2,
      vevet.viewport.height,
    ]);

    this._target = { x, y };
  }

  public render(ease: number) {
    this._current.x = lerp(this._current.x, this._target.x, ease);
    this._current.y = lerp(this._current.y, this._target.y, ease);
  }

  public destroy() {
    this._listener.remove();
  }
}
