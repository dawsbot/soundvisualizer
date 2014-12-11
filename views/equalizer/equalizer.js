var w = 600;
var h = 250;
var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
  11, 12, 15, 20, 18, 17, 16, 18 ];

  var xScale = d3.scale.ordinal()
  .domain(d3.range(dataset.length))
  .rangeRoundBands([0, w], 0.05);

  var yScale = d3.scale.linear()
  .domain([0, d3.max(dataset)])
  .range([0, h]);

  //Create SVG element
  var svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h + 20);

  var colorScale = d3.scale.linear()
  .domain([0, 18])
  .interpolate(d3.interpolateHcl)
  .range(['#ff0000', '#00ffee']);

  // Create bars
  svg.selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("x", function(d, i) { return xScale(i); })
  .attr("y", function(d) { return h; })
  .attr("width", xScale.rangeBand())
  .attr("height", function(d) { return yScale(d); })
  .attr("fill", function(d, i) { return colorScale(i); });

  // Create axes
  var now = new Date(Date.now() - duration),
      duration = 750,
      n = 243;

  var x = d3.time.scale()
            .domain([now - (n - 2) * duration, now - duration])
            .range([0, w]);
  var y = d3.scale.linear()
            .domain([0, 30])
            .range([h, 0]);

  svg.append("g")
     .attr("class", "y axis")
     .call(d3.svg.axis().scale(y).orient("left"));

  var axis = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + y(0) + ")")
                .call(x.axis = d3.svg.axis().scale(x).orient("bottom"))

  // // Add x-axis labels
  // svg.append("text")
  //    .attr("class", "x label")
  //    .attr("text-anchor", "end")
  //    .attr("x", 50)
  //    .attr("y", h + 15)
  //    .text("frequency");

  // Add y-axis labels
  svg.append("text")
     .attr("class", "y label")
     .attr("text-anchor", "end")
     .attr("y", 6)
     .attr("dy", ".75em")
     .attr("transform", "rotate(-90)")
     .text("noise level");

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
    svg.selectAll("rect")
    .data(dataset)
    .transition(100)
    .duration(200)
    .attr("y", function(d) { return h - yScale(d); })
    .attr("height", function(d) { return yScale(d); })
    .attr("fill", function(d, i) { return colorScale(i); });
  };
