  var margin = {top: 50, right: 50, bottom: 50, left: 50};

  var w = 1160 - margin.left - margin.right;
  var h = 360 - margin.top - margin.bottom;

  // Initialize all rects to zero
  var dataset = Array.apply(null, new Array(18)).map(Number.prototype.valueOf,0);

  var xScale = d3.scale.ordinal()
  .domain(d3.range(dataset.length))
  .rangeRoundBands([0, w], 0.05);

  var yScale = d3.scale.linear()
  .domain([0, d3.max(dataset)])
  .range([0, h]);

  // Create SVG element with padding
  var svgEqualizer = d3.select("body").append("svg")
                       .attr("width", w + margin.left + margin.right)
                       .attr("height", h + margin.top + margin.bottom)
                       .append("g")
                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var colorScale = d3.scale.linear()
  .domain([0, 18])
  .interpolate(d3.interpolateHcl)
  .range(['#ff0000', '#00ffee']);

  // Create bars
  svgEqualizer.selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  //.rotate(Math.PI)
  .attr("x", function(d, i) { return xScale(i); })
  .attr("y", function(d) { return h - yScale(d); })
  .attr("width", xScale.rangeBand())
  .attr("height", function(d) { return yScale(d); })
  .attr("fill", function(d, i) { return colorScale(i); });
  //.rotate(Math.PI);


  // Create axes
  var xBarScale = d3.scale.ordinal()
                  .domain(["bass", "trebble"])
                  .range([0, w]);

  var xAxis = d3.svg.axis()
                    .scale(xBarScale)
                    .orient("bottom")
                    .tickFormat(function(d) { return d; })

  svgEqualizer.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0, " + h + ")")
     .call(xAxis);

  // Add x-axis label
  svgEqualizer.append("text")
     .attr("class", "x-label")
     .attr("text-anchor", "middle")
     .attr("x", w / 2)
     .attr("y", h + 30)
     .text("frequency level (Hertz)");

  var conn = new WebSocket("ws://10.202.117.156:3000/1");

  conn.onopen = function (ev) {
    console.log("connected to websocket");
  };

  conn.onmessage = function (ev) {

    // pull frequency values through web socket
    var json = JSON.parse(ev.data);

    // check values for testing
    // console.log(json);
    var numValues = dataset.length;
    dataset = [];
    var maxValue = 100;
    for (var i = 0; i < numValues; i++) {
      var newNumber = json[i];
      dataset.push(newNumber);
    }
    line_height = d3.max([50, d3.max(dataset)]);
    yScale.domain([0, line_height]);

    // update all rects
    svgEqualizer.selectAll("rect")
    .data(dataset)
    .transition(100)
    .duration(200)
    .attr("y", function(d) { return h - yScale(d); })
    .attr("height", function(d) { return yScale(d); })
    .attr("fill", function(d, i) { return colorScale(i); });
  };
