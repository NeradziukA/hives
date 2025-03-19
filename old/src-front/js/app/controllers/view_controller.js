export default class ViewController {
  constructor(viewObject, commObject, mapObject, locationObject) {
    let thiz = this;
    this.view = viewObject;
    this.comm = commObject;
    this.location = locationObject;
    this.map = mapObject;

    this.location.addListener(thiz.view);
    this.map.addListener('UNIT_CONNECTED', thiz.view);
    this.map.addListener('UNIT_MOVED', thiz.view);
    this.map.addListener('UNIT_DISCONNECTED', thiz.view);
    this.map.addListener('FACILITY_ADD', thiz.view);
  }
}

