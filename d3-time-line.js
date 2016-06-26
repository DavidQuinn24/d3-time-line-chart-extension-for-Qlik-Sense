define(["jquery", "./js/d3.min", "./js/senseD3utils", "./js/senseUtils"],
	function($) {
		'use strict';

		//Use requirejs toUrl to get the URL.
		//Load external CSS instead of inlining to work in desktop/server/mashups
		$("<link/>", {
			rel: "stylesheet",
			type: "text/css",
			href: require.toUrl( "extensions/d3-time-line/d3-time-line.css")
		}).appendTo("head");

//		var lastUsedChart = -1;
		return {
			initialProperties: {
				version: 1.0,
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [{
						qWidth: 2,
						qHeight: 1500
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					dimensions: {
						uses: "dimensions",
						min: 1,
						max: 1
					},
					measures: {
						uses: "measures",
						min: 1,
						max: 1
					},
					sorting: {
						uses: "sorting"
					},
					settings: {
						uses: "settings",
						items: {
							dateFormatDropDown: {
								type: "string",
								component: "dropdown",
								label: "Date/Time Format",
								ref: "dateformat",
								options: [ // Note: d3 doesn't support Quarters
									{label:"YYYY-MM-DD hh:mm:ss", value:"%Y-%m-%d %H:%M:%S"},
									{label:"DD/MM/YYYY hh:mm:ss", value:"%d/%m/%Y %H:%M:%S"},
									{label:"DD-MM-YYYY hh:mm", value:"%d-%m-%Y %H:%M"},
									{label:"DD/MM/YYYY hh:mm", value:"%d/%m/%Y %H:%M"},
									{label:"DD/MM/YYYY", value:"%d/%m/%Y"},
									{label:"DD-MM-YYYY", value:"%d-%m-%Y"},
									{label:"YYYY-MMM", value:"%Y-%b"},
									{label:"MM/YYYY", value:"%m/%Y"},
									{label:"YYYY", value:"%Y"}],
								defaultValue: "%d/%m/%Y"
							},
							lineStyleDropDown: {
								type: "string",
								component: "dropdown",
								label: "Line Style",
								ref: "lineStyle",
								options: [
									{label:"Linear",value:"linear"},
									{label:"Spline",value:"basis"},
									{label:"Steps Before",value:"step-before"},
									{label:"Steps After",value:"step-after"},
									{label:"Tight Spline",value:"bundle"},
									{label:"Cubic Monotone",value:"monotone"},
									{label:"Cardinal",value:"cardinal-open"}],
								defaultValue: "linear"
							},
							showDataPoints: { 
								type: "boolean",
								component: "switch",
								label: "Show Data Points",
								ref: "showDataPoints",
								options: [{	value: false,	label: "No"}, {	value: true,	label: "Yes"}],
								defaultValue: false
							},
							showFill: { 
								type: "boolean",
								component: "switch",
								label: "Fill Area",
								ref: "showFill",
								options: [{	value: false,	label: "No"}, {	value: true,	label: "Yes"}],
								defaultValue: false
							}

						}
					}
				}
			},
			snapshot: {
				canTakeSnapshot: false
			},
			paint: function($element, layout) {
				var self = this;

				senseUtils.extendLayout(layout, self);
				var dim_count = layout.qHyperCube.qDimensionInfo.length;
				var measure_count = layout.qHyperCube.qMeasureInfo.length;

				$element.html("");
				viz($element, layout, self);

			},
			resize:function($el,layout){
				this.paint($el,layout);
			}
		};

	});


// Helper functions
function getLabelWidth(axis, svg, biggestValue) {
	// Create a temporary yAxis to get the width needed for labels and add to the margin
	svg.append("g")
		.attr("class", "y axis temp")
		.attr("transform", "translate(0," + 0 + ")")
		.call(axis)
		.append("text")
		.attr("class", "axis-label")
        .style("font-weight", "bold")
		.style("fill","#444")
		.text(biggestValue);

	// Get the temp axis max label width
	var label_width = d3.max(svg.selectAll(".y.axis.temp text")[0], function(d) {
		return d.clientWidth + 10;
	});

	// Remove the temp axis
	svg.selectAll(".y.axis.temp").remove();

	return label_width;
}

var viz = function($element,layout,_this) {

	var id = senseUtils.setupContainer($element,layout,"d3vl_line"),
		ext_width = $element.width(),
		ext_height = $element.height();
		
//var formatDate = d3.time.format("%d-%b-%y");
var parseDate = d3.time.format(layout.dateformat).parse;

	var data = layout.qHyperCube.qDataPages[0].qMatrix.map(function(d) {
		return {
			"x":d[0].qText,
			"y":d[1].qNum
		}
	});

	var margin = {top: 25, right: 20, bottom: 25, left: 50},
	    width = ext_width - margin.left - margin.right,
	    height = ext_height - margin.top - margin.bottom;


	var x = d3.time.scale()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var line = d3.svg.line()
		.interpolate(layout.lineStyle)
		.x(function(d) { return x(parseDate(d.x)); })
		.y(function(d) { return y(d.y); });

	var poly = d3.svg.area()
		.interpolate(layout.lineStyle)
		.x(function(d) { return x(parseDate(d.x)); })
		.y0(height)
		.y1(function(d) { return y(d.y); });	

	x.domain(d3.extent(data, function(d) { return parseDate(d.x); }));
 	y.domain(d3.extent(data, function(d) { return d.y; }));	
	
	var svg = d3.select("#" + id).append("svg")
	    .attr("width", ext_width )
	    .attr("height", ext_height )
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var label_width = getLabelWidth(yAxis,svg, d3.max(data, function (d) { return d.y })); 	

	if (parseDate(data[0].x) == null) {
//		console.info("Error converting Date/Time");
		svg.append("text")
			.attr("class", "error")
			.text("Error converting Date/Time. Check Format")
			.attr("text-anchor", "middle")
			.style("fill","#444")
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")")
	}
	else {	
		// Update the margins, plot width, and x scale range based on the label size
		margin.left = margin.left + label_width;
		width = ext_width - margin.left - margin.right;

		if(layout.showFill) {
			svg.append("path")
			.style("fill", "lightsteelblue")
			.attr("stroke-width", 0)
			.attr("class", "area")
			.attr("d", poly(data));
		}
			
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("class", "axis-label")
			.attr('transform', 'translate(0, -17)')
			.attr('text-anchor','start')
			.attr("dy", ".71em")
			.style("font-weight", "bold")
			.style("fill","#444")
			.text(senseUtils.getMeasureLabel(1,layout));
				
		if (data.length>1) { // lines don't work with less than 2 points
			svg.append("path")
				.attr("stroke", "blue")
				.attr("stroke-width", 2)
				.attr("class", "line")
				.attr("d", line(data));
		} 
		else {
			svg.selectAll(".dot")
			  .data(data)
			  .enter().append("circle")
			  .attr("class", "dot")
			  .attr("r", 2)
			  .attr("cx", function(d) { return x(parseDate(d.x)); })
			  .attr("cy", function(d) { return y(d.y); })
			  .style("fill", "blue")		  ;
		}
		if (layout.showDataPoints) {
			svg.selectAll(".dot")
			  .data(data)
			  .enter().append("circle")
			  .attr("class", "dot")
			  .attr("r", 2)
			  .attr("cx", function(d) { return x(parseDate(d.x)); })
			  .attr("cy", function(d) { return y(d.y); })
			  .style("fill", "steelblue")		  ;
		}
	}
}
		
function type(d) {
  d.date = formatDate.parse(d.date);
  d.close = +d.close;
  return d;
}