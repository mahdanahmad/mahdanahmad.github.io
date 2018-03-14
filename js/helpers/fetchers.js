// const baseURL	= 'http://139.59.230.55/frontend/api/maps/';
const baseURL	= '/public/data/'

function getDisaster(callback) { $.getJSON( baseURL + 'disaster.json', (data) => { callback(null, data); } ); }
function getVulnerable(callback) { $.getJSON( baseURL + 'vulnerable.json', (data) => { callback(null, data); } ); }
function getArea(callback) { $.getJSON( baseURL + 'area.json', (data) => { callback(null, data); } ); }

function getOdpair(callback) { $.getJSON( baseURL + 'odpair.json', (data) => { callback(data); } ); }

function getTopojson(callback) { $.getJSON( 'https://raw.githubusercontent.com/pemiluAPI/pemilu-data/master/dapil/shapefiles/admin_kabupaten/geojson/KABUKOTA_ADMINISTRATIVE_AREA-SIMPLIFIED.topojson', (data) => { callback(null, data); } ); }
