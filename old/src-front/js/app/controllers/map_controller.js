export default class MapController {
  constructor(mapObject, commObject, locationObject) {
    let thiz = this;
    this.map = mapObject;
    this.comm = commObject;
    this.location = locationObject;

    this.comm.addListener('UNIT_CONNECTED', this.map);
    this.comm.addListener('UNIT_MOVED', this.map);
    this.comm.addListener('UNIT_DISCONNECTED', this.map);
    this.comm.addListener('UNIT_DISCONNECTED', this.map);
    this.comm.addListener('INIT_UNITS', this.map);
    this.location.addListener(this.map);
    this.location.addListener(this.comm);
  }
}