const palette	= ['#d17076', '#eb6090', '#f3a6be', '#98e2e1', '#17a5a3', '#fac999', '#e6790d', '#b24201', '#eac8b5', '#f3f0e2', '#c1ccd4', '#fbe5ad', '#e2c408', '#fdb360', '#af9b95', '#a4bfd9', '#5b92cb', '#787fa0', '#8e9fbb', '#ebf0f7'];

const sideDest	= '#side-bar';
const sideId	= 'side-viz';

const polyDest	= '#mein-bar';
const polyId	= 'polygons-viz';

let allLine		= [];
let selected	= [];
let polyData	= [];

const sortVal	= ['desc', 'asc'];
let sortBy		= _.head(sortVal);
