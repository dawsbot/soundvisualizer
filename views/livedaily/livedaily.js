var xdata = null;
(function() {

/*
var queue = [];
queue.push(0);
*/

var delay    = 0,   // diff between rpi and computer
    xdelay   = 300, // extra delay
    translen = 200,
    duration = 1*60*1000, // milliseconds
    now = new Date(Date.now() - delay),
    data = d3.range();

xdata = data;

// Read mongo data
function addMongoToData() {
	var mdata = <%- JSON.stringify(data) %>;
	var dm    = d3.max(mdata,function(d){return new Date(d.t)});
	var ddiff = dm - Date.now() - 250;
	data = mdata.map(function(d){return {l:d.l, t: new Date(new Date(d.t) - ddiff)}});
	console.log(d3.max(mdata,function(d){return new Date(d.t)}));
	console.log(new Date());
}


// Websocket
var conn = new WebSocket("ws://10.202.117.156:3000/2");
conn.onpen = function(ev){
  console.log("connected");
} 
var cnt = 0;
conn.onmessage = function(ev) {
   var json = JSON.parse(ev.data);
   var ts = new Date(json.date);
   data.push({t: ts, l:json.level});
   if (delay === 0) {
		delay = (new Date() - ts);
//		addMongoToData();
		console.log('asdasd');
	}
   delay = (delay-xdelay) * 0.9 + 0.1 * (new Date() - ts) + xdelay;
   console.log(delay-xdelay);
}

// Margin
var margin = {top: 6, right: 0, bottom: 20, left: 40},
    width = 1260 - margin.right,
    height = 420 - margin.top - margin.bottom;

// Scales
var x = d3.time.scale()
    .domain([now-duration-delay, now-delay])
    .range([0, width]);
var y = d3.scale.linear()
    .domain([0, 30])
    .range([height, 0]);

// Line
var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.t); })
    .y(function(d) { return y(d.l); });

// SVG stuff
var svg = d3.select("body").append("p").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", -margin.left + "px")
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
    .duration(translen)
    .ease("linear");

// Ticker
(function tick() {
  transition = transition.each(function() {
	console.log('tick');
    // update the domains
    now = new Date();

	// Domains
	//var yd_old = y.domain();
    var yd_new = [0, d3.max(data,function(d){return d.l})];
    x.domain([now-duration-delay, now-delay]);
    y.domain(yd_new);

    // redraw the line
    svg.select(".line")
        .attr("d", line)
        .attr("transform", null);

    // slide the x-axis left
    axis.call(x.axis);

    // slide the line left
	var tx = -x(now - duration - delay + translen);
	//var sy = yd_new[1]/yd_old[1];
    path.transition()
        .attr("transform", "translate(" + tx + ")");
    //    .attr("transform-origin", "0% 0%")
    //    .attr("transform", "translate(" + tx + ") scale(1," + sy+")");

    // Pop the old data point off the front
	var mintime = new Date(now - duration - delay);
    var c = data.reduce(function(pv,cv){return pv + (cv.t < mintime)}, 0);
    data.splice(0,c);
	console.log('removed ' + c + ',  len=' + data.length);

  }).transition().each("start", tick);
})();

})()
