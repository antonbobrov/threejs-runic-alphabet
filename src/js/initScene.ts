import { loadImage, times, vevet } from '@anton.bobrov/vevet-init';
import { WebglManager } from './webgl/Manager';
import { Items } from './Items';

const managerContainer = document.getElementById('scene') as HTMLElement;

const manager = new WebglManager(managerContainer, {
  cameraProps: { fov: 50, perspective: 800 },
  rendererProps: {
    dpr: vevet.viewport.lowerDesktopDpr,
    antialias: false,
  },
});

manager.play();

const imageSrcs = times((index) => `${index}.png`, 24); // 24
let loadCount = 0;

function handleLoaded() {
  loadCount += 1;

  manager.container.setAttribute(
    'data-is-loaded',
    `${loadCount / (imageSrcs.length + 1)}`,
  );
}

const loaders = imageSrcs.map((image) => loadImage(image));
loaders.forEach((loader) => {
  loader.then(() => handleLoaded()).catch(() => {});
});

Promise.all(loaders)
  .then((images) => {
    // eslint-disable-next-line no-new
    new Items({ manager, images });

    handleLoaded();
  })
  .catch(() => {});
