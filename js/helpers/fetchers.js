const baseURL	= 'http://139.59.230.55/frontend/api/maps/';

function getDisaster(callback) { $.getJSON( baseURL + 'disaster', (data) => { callback(data); } ); }
function getVulnerable(callback) { $.getJSON( baseURL + 'vulnerable', (data) => { callback(data); } ); }
function getArea(callback) { $.getJSON( baseURL + 'area', (data) => { callback(data); } ); }

function getOdpair(callback) { $.getJSON( baseURL + 'odpair', (data) => { callback(data); } ); }

function getTopojson(callback) { $.getJSON( 'https://raw.githubusercontent.com/pemiluAPI/pemilu-data/master/dapil/shapefiles/admin_kabupaten/geojson/KABUKOTA_ADMINISTRATIVE_AREA-SIMPLIFIED.topojson', (data) => { callback(data); } ); }
