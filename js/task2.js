function initTask2() {
	getOdpair((data) => {
		allLine		= _.chain(data).map('from').uniq().sortBy((o) => (parseInt(o.replace('Line ', '')))).value();
		selected	= _.clone(allLine);

		polyData	= _.chain(data).cloneDeep().map((o) => (_.assign(o, { name: o.from }, _.chain(['from', 'to']).map((d) => ([d, _.get(o, d, '').replace('Line', d)])).fromPairs().value()))).value();

		createSide(_.chain(data).groupBy('from').mapValues((o, key) => (_.sumBy(o, 'count'))).value());
		createPolygonRatio();
	});
}
