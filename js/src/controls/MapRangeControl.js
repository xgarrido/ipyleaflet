const L = require('../leaflet.js');
const control = require('./Control.js');

L.Control.MapRange = L.Control.extend({
	options: {
	        position: 'bottomleft',
	        prefix: 'Colormap',
                emptyString: 'Unavailable',
		ndig: 1,
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
		L.DomEvent.disableClickPropagation(this._container);
		map.on('recolor', this._onRecolor, this);
		this._container.innerHTML = this.options.emptyString;
		return this._container;
	},

	onRemove: function (map) {
		map.off('recolor', this._onRecolor)
	},

	_onRecolor: function (e) {
		// Find the first scalable layer
		var layer = null;
		e.target.eachLayer(function (l) {
			if(!layer && "options" in l && "colormap" in l.options)
				layer = l;
		});
		if(!layer) return;
		var cmap= layer.options.colormap;
		var ndig = this.options.ndig;
	        var [min,max] = L.ColorizableUtils.apply_scale(layer.options.min, layer.options.max, layer.options.scale, layer.options.skew);
		if(min == -max) {
			this._container.innerHTML = this.options.prefix + " " + cmap + " ± " +  max.toFixed(ndig);
		} else {
			this._container.innerHTML = this.options.prefix + " " + cmap + " " +  min.toFixed(ndig) + " : " + max.toFixed(ndig);
		}
	}

});

L.Map.mergeOptions({
	rangeControl: false
});

L.Map.addInitHook(function () {
	if (this.options.rangeControl) {
		this.rangeControl = new L.Control.MapRange();
		this.addControl(this.rangeControl);
	}
});

L.control.mapRange = function (options) {
	return new L.Control.MapRange(options);
};

export class LeafletMapRangeControlModel extends control.LeafletControlModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'LeafletMapRangeControlView',
      _model_name: 'LeafletMapRangeControlModel'
    };
  }
}

export class LeafletMapRangeControlView extends control.LeafletControlView {
  initialize(parameters) {
    super.initialize(parameters);
    this.map_view = this.options.map_view;
  }

  create_obj() {
      console.log("Create map range");
      this.obj = L.control.mapRange(this.get_options());
      window.map_range = this.obj;
  }
}
