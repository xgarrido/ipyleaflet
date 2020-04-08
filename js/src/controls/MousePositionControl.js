// Sigurd's modified version of this control. Behaves normally for normal layers,
// but for colorizable layers also prints value at mouse position

const L = require('../leaflet.js');
const control = require('./Control.js');

function format_coord(x) { return x.toFixed(5); }

L.Control.MousePosition = L.Control.extend({
	options: {
		position: 'bottomleft',
		separator: ' : ',
		emptyString: 'Unavailable',
		lngFirst: false,
		numDigits: 5,
		valDigits: 1,
		lngFormatter: format_coord,
		latFormatter: format_coord,
		valFormatter: undefined,
		prefix: ""
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
		L.DomEvent.disableClickPropagation(this._container);
		map.on('mousemove', this._onMouseMove, this);
		this._container.innerHTML = this.options.emptyString;
		return this._container;
	},

	onRemove: function (map) {
		map.off('mousemove', this._onMouseMove)
	},

	_onMouseMove: function (e) {
		var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
		var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
		var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
		var prefixAndValue = this.options.prefix + ' ' + value;
		// Add map value if available
		var layer = null;
		e.target.eachLayer(function (l) {
			if (!layer && "options" in l && "colormap" in l.options)
				layer = l;
		});
		if (false && layer) {
			var val = layer.getValueAtLayerPoint(e.layerPoint);
			prefixAndValue += this.options.separator + (this.options.valFormatter ? this.options.valFormatter(val) : L.Util.formatNum(val, this.options.valDigits));
		}
		this._container.innerHTML = prefixAndValue;
	}

});

L.Map.mergeOptions({
	positionControl: false
});

L.Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new L.Control.MousePosition();
		this.addControl(this.positionControl);
	}
});

L.control.mousePosition = function (options) {
	return new L.Control.MousePosition(options);
};

export class LeafletMousePositionControlModel extends control.LeafletControlModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'LeafletMousePositionControlView',
      _model_name: 'LeafletMousePositionControlModel'
    };
  }
}

export class LeafletMousePositionControlView extends control.LeafletControlView {
  initialize(parameters) {
    super.initialize(parameters);
    this.map_view = this.options.map_view;
  }

  create_obj() {
      console.log("Create mouse position");
      this.obj = L.control.mousePosition(this.get_options());
  }
}
