function initTask1() {
	let mapboxToken	= "pk.eyJ1IjoibWFoZGFuYWhtYWQiLCJhIjoiY2plcXEzNnI4NjF2NDJ3bG5vMHNheGprcyJ9.v_pUqz_UOAywvbN_eCu22Q";
	let map			= L.map('map-wrapper').setView([-4, 120], 5);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxToken, {
		id: 'mapbox.light',
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 9,
		minZoom: 4.5,
	}).addTo(map);

	map.setMaxBounds(L.latLngBounds(L.latLng(12, 89), L.latLng(-13, 146.3)));

	let popup = new L.Popup({ autoPan: false });

	d3.queue()
		.defer(getDisaster)
		.defer(getVulnerable)
		.defer(getArea)
		.defer(getTopojson)
		.await((err, disaster, vulnerable, area, toporaw) => {
			let geoJson	= topojson.feature(toporaw, toporaw.objects.layer1);

			let palette	= { default: '#FFFFFF', disaster: '#006494', vulnerable: '#06A77D', area: '#E2C044' };
			let packed	= { disaster, vulnerable, area };

			let colours	= _.mapValues(packed, (o, key) => (d3.scaleLinear().domain([o.min, o.max]).interpolate(d3.interpolateHcl).range([d3.rgb(palette.default), d3.rgb(palette[key])])));
			let layers	= _.mapValues(packed, (o, key) => {
				let mappedVal	= _.chain(o).get('data', []).map((d) => ([ d.city_id, parseInt(d.value) ])).fromPairs().value();

				return L.geoJson(geoJson, { style: (feature) => ({
					weight: 2,
					opacity: 0.1,
					color: 'white',
					fillOpacity: 0.6,
					fillColor: (mappedVal[feature.properties.id_kabkota] ? colours[key](mappedVal[feature.properties.id_kabkota]) : palette.default)
				}), onEachFeature });
			});

			layers.disaster.addTo(map);
			L.control.layers({}, _.chain(packed).map((o, key) => ([o.name, layers[key]])).fromPairs().value()).addTo(map);
		});

	function onEachFeature(feature, layer) {
        layer.on({ mousemove, mouseout, click });
    }

	let closeTooltip;
	function mousemove(e) {
		let layer = e.target;
		popup.setLatLng(e.latlng);
		popup.setContent('<h4>' + layer.feature.properties.nm_kabkota.toTitleCase() + '</h4>');


		if (!popup._map) popup.openOn(map);
		window.clearTimeout(closeTooltip);
	}

	function mouseout(e) {
		closeTooltip = window.setTimeout(() => { map.closePopup(); }, 100);
	}

	function click(e) { map.fitBounds(e.target.getBounds()); }
}
