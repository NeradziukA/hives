import mapHeader from './map-header.html';
import mapFooter from './map-footer.html';
import Radar from "./radar";
import Zoom from "./zoom";
import MapModel from "../../models/map";
import ViewModel from '../../models/view.js';
import Location from '../../services/location.js';
import Comm from '../../services/comm.js';
import MapController from "../../controllers/map_controller";
import ViewController from "../../controllers/view_controller";

export default class Map {
  constructor(app, onSceneClose) {

    const map = new MapModel();
    const comm = new Comm();
    const view = new ViewModel(app.stage, map);
    const location = new Location();
    const radar = new Radar(app.stage);
    const zoom = new Zoom(app.stage);
    const mapController = new MapController(map, comm, location);
    const viewController = new ViewController(view, comm, map, location);
    zoom.addListener(view);
    zoom.addListener(radar);

    this.show = () => {
      this.formHeader = document.createElement('form');
      this.formHeader.id = 'map-header';
      this.formHeader.innerHTML = mapHeader;
      [...this.formHeader.querySelectorAll('.screen-selector')].map(e => {
        e.onclick = (ev) => {
          ev.preventDefault();
          onSceneClose(e.dataset.scene_name);
        };
      });

      this.formFooter = document.createElement('form');
      this.formFooter.id = 'map-footer';
      this.formFooter.innerHTML = mapFooter;
      this.formFooter.querySelector('.menu-button').onclick = (ev) => {
        ev.preventDefault();
        console.log(this.formFooter.querySelector('#message').value);
      };

      document.querySelector('body').appendChild(this.formHeader);
      document.querySelector('body').appendChild(this.formFooter);
      app.stage.visible = true;
    };

    this.hide = () => {
      if (this.formHeader) this.formHeader.remove();
      if (this.formFooter) this.formFooter.remove();
      app.stage.visible = false;
    };
    return this;
  };
}
