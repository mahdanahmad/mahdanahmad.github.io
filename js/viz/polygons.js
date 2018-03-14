const leftPadd		= 2;
const rightPadd		= 1;
const baseWidth		= 13;
const baseRadius	= 2;

const textWidth		= 50;
const tooltipMarg	= 10;

const margin		= { top: 50, right: 0 + textWidth, bottom: 25, left: 25 + textWidth };

const option_left	= 55;
const option_wdt	= 50;

function createPolygonRatio() {
	d3.select(polyDest).selectAll("svg").remove();

	let canvasWidth		= $(polyDest).outerWidth(true);
	let canvasHeight	= $(polyDest).outerHeight(true);

	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let svg = d3.select(polyDest).append("svg")
		.attr("id", polyId)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	let data	= _.filter(polyData, (o) => (_.includes(selected, o.name)));

	d3.queue()
		.defer(createPolyScale, data, 'from', height)
		.defer(createPolyScale, data, 'to', height)
		.await((error, fromPos, toPos) => {
			// if (error) throw error;

			constructBase(fromPos, 'from', 0);
			constructBase(toPos, 'to', width);
			constructPoly(fromPos, toPos, width);
		});

	let viewWrapper	= svg.append('g')
		.attr('id', 'view-wrapper')
		.attr('transform', 'translate(' + (width - margin.right - 100) + ',' + (-20) + ')');

	viewWrapper.append('text')
		.text('Sort:');

	viewWrapper.append('rect')
		.attr('id', 'option-select')
		.attr('x', (_.indexOf(sortVal, sortBy) + 1) * option_left - (option_wdt / 2))
		.attr('y', -13.5)
		.attr('height', 20)
		.attr('width', option_wdt);

	viewWrapper.append('g')
		.attr('id', 'options-wrapper')
		.attr('transform', 'translate(' + option_left + ',0)')
		.selectAll('.view-option')
		.data(sortVal).enter().append('text')
			.attr('class', 'view-option cursor-pointer')
			.attr('text-anchor', 'middle')
			.attr('transform', (o, i) => ('translate(' + (i * option_wdt) + ',0)'))
			.text((o) => (_.capitalize(o)))
			.on('click', (o, i) => {
				if (o !== sortBy) {
					sortBy	= o;

					let transition	= d3.transition()
				        .duration(250)
				        .ease(d3.easeLinear);

					viewWrapper.select('rect#option-select').transition(transition)
						.attr('x', option_left + (i * option_wdt) - (option_wdt / 2));

					svg.selectAll('#from-wrapper, #to-wrapper, #polygons-wrapper').remove();

					d3.queue()
						.defer(createPolyScale, data, 'from', height)
						.defer(createPolyScale, data, 'to', height)
						.await((error, fromPos, toPos) => {
							// if (error) throw error;

							constructBase(fromPos, 'from', 0);
							constructBase(toPos, 'to', width);
							constructPoly(fromPos, toPos, width);
						});
				}
			});
}

function createPolyScale(data, column, height, callback) {
	let total	= _.sumBy(data, 'count');
	let grouped	= _.chain(data).groupBy(column);
	let summed	= grouped.mapValues((o) => (_.sumBy(o, 'count'))).value();
	let count	= grouped.mapValues((o) => (o.length)).value();
	let child	= grouped.value();

	constructPosition(summed, column, total, height, leftPadd, 0, (result) => {
		async.map(result, (o, eachCallback) => {
			let child_value	= _.chain(child[o.key]).keyBy(column == 'from' ? 'to' : 'from').mapValues('count').value();
			constructPosition(child_value, column, o.count, o.length, rightPadd, o.pos[0], (child_node) => {
				eachCallback(null, _.assign(o, { node: child_node.map((d) => ({
					dest: d.key,
					src: o.key,
					pos: d.pos,
					length: d.length,
					count: d.count }))
				}));
			});
		}, (err, results) => callback(err, results));
	});
}

function constructPosition(data, column, total, height, padding, ahead, callback) {
	let avail_height	= height - (padding * (_.size(data) - 1));

	let ordered			= _.chain(data).map((o, key) => ({
		key,
		count: o,
		length: o / total * avail_height
	})).orderBy('length', sortBy).value();

	let currentPos	= 0;
	callback(_.times(ordered.length, (o) => {
		let start	= currentPos;
		if (start) { start += padding; }
		currentPos	= start + ordered[o].length;

		return ({ key: ordered[o].key, count: ordered[o].count, length: ordered[o].length, pos: [ ahead + start, ahead + currentPos ] });
	}));
}

function constructBase(data, prefix, xPos) {
	let svg	= d3.select( polyDest + ' > svg#' + polyId + ' > g' );

	let wrapper	= svg.append('g')
		.attr('id', prefix + '-wrapper')
		.selectAll(prefix + '-group')
		.data(data).enter()
		.append('g')
			.attr('id', (o) => ('base-' + _.kebabCase(o.key)))
			.attr('class', prefix + '-group cursor-pointer');

	wrapper.append('rect')
		.attr('x', (xPos == 0) ? xPos : (xPos - baseWidth))
		.attr('y', (o) => (o.pos[0] || 0))
		.attr('rx', baseRadius)
		.attr('ry', baseRadius)
		.attr('width', baseWidth)
		.attr('height', (o) => (o.length))
		.attr('fill', (o) => (palette[parseInt(o.key.replace('from ', '').replace('to ', '')) - 1]));

	let textMargin	= 10;
	wrapper.append('text')
		.attr('text-anchor', (xPos == 0 ? 'end' : 'start'))
		.attr('x', (xPos == 0 ? (xPos - textMargin) : (xPos + textMargin)))
		.attr('y', (o) => ((o.pos[0] + (o.length / 2)) + 4 || 0))
		.text((o) => (o.length > 15 ? o.key.replace('from', 'Line').replace('to', 'Line') : ''));

	wrapper.append('rect')
		.attr('x', (xPos == 0) ? (xPos - textWidth) : (xPos - baseWidth))
		.attr('y', (o) => (o.pos[0] || 0))
		.attr('width', baseWidth + textWidth)
		.attr('height', (o) => (o.length))
		.style('fill', 'transparent');

	wrapper
		.on('click', (o) => { setPolyActive(o.key); })
		.on('mouseover', (o) => {
			let position	= {
				top: margin.top + o.pos[0] + (o.length / 2) - 14,
				left: (xPos == 0 ? margin.left + baseWidth + tooltipMarg : 'unset'),
				right: (xPos !== 0 ? margin.right + baseWidth + tooltipMarg : 'unset'),
			};

			$( '#detil-tooltips > #detil-name' ).text(o.key.replace('from', 'Line').replace('to', 'Line'));
			$( '#detil-tooltips > #detil-count' ).text(nFormatter(o.count));

			$( '#detil-tooltips' ).removeClass('hidden').addClass((xPos == 0) ? 'left' : 'right').css(position);
		})
		.on('mouseout', (o) => { $( '#detil-tooltips' ).addClass('hidden').removeClass('left right'); });
}

function constructPoly(left, right, width) {
	let svg		= d3.select( polyDest + ' > svg#' + polyId + ' > g' );
	// let width	= d3.select('svg#' + polyId).node().getBBox().width;

	let dest	= _.chain(right).flatMap('node').keyBy((o) => (o.src + ' - ' + o.dest)).mapValues('pos').value();
	let data	= _.chain(left).flatMap('node').map((o) => ({
		color: palette[parseInt(o.src.replace('from ', '').replace('to ', '')) - 1],
		class: [o.src, o.dest].map((o) => (_.kebabCase(o))).join(' '),
		count: o.count,
		length: o.length,
		points: _.concat(o.pos.map((d) => ([baseWidth, d])), o.pos.map((d) => ([width / 2, d])), (dest[o.dest + ' - ' + o.src] || []).map((d) => ([width - baseWidth, d])))
	})).value();

	svg.append('g')
		.attr('id', 'polygons-wrapper')
		.selectAll('polygons')
		.data(data).enter()
		.append('polygon')
			.attr('class', (o) => ('polygons hidden ' + o.class))
			.attr('points', (o) => (constructPolyPoint(o.points)))
			.attr('fill', (o) => (o.color));

	setPolyActive(_.head(left).key);
}

function constructPolyPoint(points) { return [points[0], points[2], points[4], points[5], points[3], points[1]].map((o) => o.join(',')).join(' '); }

function setPolyActive(id) {
	let svg		= d3.select( polyDest + ' > svg#' + polyId + ' > g' );

	svg.selectAll('polygon.' + _.kebabCase(id)).classed('hidden', false);
	svg.selectAll('polygon:not(.' + _.kebabCase(id) + '):not(.hidden)').classed('hidden', true);
}
