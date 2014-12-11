var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%b-%y").parse;

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
    .x(function(d) { return x(d.timestamp); })
    .y(function(d) { return y(d.value); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//    d3.json("data.json", function(error, data) {
 
    var data = [];   
    var i = 0;
    var counter = 0;
    var sum = 0;
    var points = 15;//average over 15 minutes
    $.ajax({url: "/testdata",async:"false",success: function(response){
      $(response).each(function(index, value){
        //console.log(value);
        var myDate = new Date(value._id.q).getTime();
        var myVolume = value.avg;
        //console.log("mydate: " + myDate);
        //console.log("myVolume: " + myVolume);
        sum = sum + myVolume;
        if ((index % points) == 1){//Every other
          var tuple = {
            "timestamp" : myDate + (1000 * 60 * (new Date()).getTimezoneOffset()),
            "value" : sum / points 
          };
          
          data.push(tuple);
          sum = 0; 
        }
        //data.push(tuple);
        counter = counter + 1;
         
      });
      console.log(data);
      /*console.log(new Date(response[i]._id.q).getTime());
      console.log(response[i].avg);
      var myDate = new Date(response[i]._id.q).getTime();
      var myVolume = response[i].avg;
      data.push({"timestamp": myDate, "value": myVolume});
      console.log(data);*/
/*
      jsonData = response[0].noise.level;
      data.push(jsonData);
      console.log("data: " + data);
*/
  x.domain(d3.extent(data, function(d) { return d.timestamp; }));
  y.domain(d3.extent(data, function(d) { return d.value; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

      }
    });
 // data.forEach(function(d) {
    //d.date = +(d.date);
    //d.close = +d.close;
	//d.date = 10;
	//d.close = 100;
	//});
  //console.log("data: " + data);
