(function() {
  var n = 243,
  duration = 750,
  now = new Date(Date.now() - duration),
  count = 0,
  data = d3.range(n).map(function() { return 0; });

  var margin = {top: 6, right: 0, bottom: 20, left: 40},
  width = 1260 - margin.right,
  height = 420 - margin.top - margin.bottom;

  var x = d3.time.scale()
  .domain([now - (n - 2) * duration, now - duration])
  .range([0, width]);

  var y = d3.scale.linear()
  .domain([0, 30])
  .range([height, 0]);

  var line = d3.svg.line()
  .interpolate("basis")
  .x(function(d, i) { return x(now - (n - 1 - i) * duration); })
  .y(function(d, i) { return y(d); });

  var svg = d3.select("body").append("p").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  //make the number larger to move it further to the right
  .style("margin-left", (-margin.left + 50) + "px")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("defs").append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);


  svg.append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis().scale(y).orient("left"));

  var axis = svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + y(0) + ")")
  .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));

  var path = svg.append("g")
  .attr("clip-path", "url(#clip)")
  .append("path")
  .datum(data)
  .attr("class", "line");

  var transition = d3.select({}).transition()
  .duration(750)
  .ease("linear");

  (function tick() {
    transition = transition.each(function() {

      // update the domains
      now = new Date();
      x.domain([now - (n - 2) * duration, now - duration]);
      y.domain([0, d3.max(data)]);

      // push the accumulated count onto the back, and reset the count
      // push a new data point onto the back
      $.ajax({url: "/livevisualdata",async:"false",success: function(response){
        jsonData = response[0].noise.level;
        data.push(jsonData);
        console.log("data: " + data);
      }
      });

      count = 0;

      // redraw the line
      svg.select(".line")
      .attr("d", line)
      .attr("transform", null);

      // slide the x-axis left
      axis.call(x.axis);

      // slide the line left
      path.transition()
      .attr("transform", "translate(" + x(now - (n - 1) * duration) + ")");

      // pop the old data point off the front
      data.shift();

    }).transition().each("start", tick);
  })();

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -10)
    .attr("x", -7)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Noise Level")
})()
