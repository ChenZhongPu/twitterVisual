function updateThemeRiver(souceFile){

    var dateFormat = d3.time.format("%Y-%m-%d")

    var twitterMargin = {top: 0, right: 30, bottom: 30, left: 30},
        twitterWidth = 650 - twitterMargin.left - twitterMargin.right,
        twitterHeight = 340 - twitterMargin.top - twitterMargin.bottom;

    var twitterX = d3.time.scale().range([0, twitterWidth])
    var twitterY = d3.time.scale().range([twitterHeight, 0])

    var twitterColors = new Array('#F37B1D', '#5eb95e', '#3bb4f2', '#dd514c');

    var twitterXAxis = d3.svg.axis()
                           .scale(twitterX)
                           .orient("bottom")
                           .ticks(d3.time.days);

    var stack = d3.layout.stack()
        .offset("zero")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

    var twitterArea = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return twitterX(d.date); })
        .y0(function(d) { return twitterY(d.y0); })
        .y1(function(d) { return twitterY(d.y0 + d.y); });

    var riverSvg = d3.select("#twitterRiverSVG").append("svg")
        .attr("width", twitterWidth + twitterMargin.left + twitterMargin.right)
        .attr("height", twitterHeight + twitterMargin.top + twitterMargin.bottom)
        .attr("id", "riversvg")
      .append("g")
      .attr("id", "riverg")
        .attr("transform", "translate(" + twitterMargin.left + "," + twitterMargin.top + ")");

   d3.json(souceFile, function(error, data) {
     if(error) throw error;

     data.forEach(function(d) {
       d.date = dateFormat.parse(d.date);
       d.value = +d.value;
     });

     var layers = stack(nest.entries(data));

     twitterX.domain(d3.extent(data, function(d) { return d.date; }));
     twitterY.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

     riverSvg.selectAll(".layer").data(layers)
       .enter().append("path")
         .attr("class", "layer")
         .attr('id', function(d, i) {return "layer" + i})
         .attr("d", function(d) { return twitterArea(d.values); })
         .style("fill", function(d, i) { return twitterColors[i]; });

     riverSvg.append("g")
         .attr("class", "x axis")
         .attr("id", "riverAxis")
         .attr("transform", "translate(0," + twitterHeight + ")")
         .call(twitterXAxis);
   });
}






updateThemeRiver("/assets/data/twitter.json");


var twitterSampleWords = []

$(document).ready(function(){

   $("#freshRiver").click(function(){
      var startD = $("#startDateInput").val();
      var endD = $("#endDateInput").val();
      $.post("/refresh",
       {
        start: startD,
        end: endD
       },
       function(data, status){
       $("#riversvg").remove();
       $("#twitterList").empty();
       updateThemeRiver("/assets/data/t2.json");

       twitterSampleWords = []

       data.twitterSample.forEach(function(d){
         twitterSampleWords = twitterSampleWords.concat(d.split(" "))
         $("#twitterList").append('<li class="am-g"><a href="" class="am-list-item-hd ">[content]</a></li>'.replace("[content]", d))
       })
       $("#allCount").html(data.twitterCount)

      });
   });

   $(document).click(function(e){
       var p = {x: e.clientX, y: e.clientY};
       var element = document.elementFromPoint(p.x, p.y);
       if(element.id.indexOf("layer") >= 0){

         d3.select(".wordcloud").remove()
         var fill = d3.scale.category20();

         d3.layout.cloud().size([300, 300])
                         .words(twitterSampleWords.map(function(d) {
                           return {text: d, size: 10 + (Math.random() * 10) * 2};
                         }))
                         .rotate(function() { return ~~(Math.random() * 2) * 90; })
                         .font("Impact")
                         .fontSize(function(d) { return d.size; })
                         .on("end", draw)
                         .start();

         function draw(words) {
                       d3.select("#word-div").append("svg")
                           .attr("width", 300)
                           .attr("height", 200)
                           .attr("class", "wordcloud")
                         .append("g")
                           .attr("transform", "translate(100, 100)")
                         .selectAll("text")
                           .data(words)
                         .enter().append("text")
                           .style("font-size", function(d) { return d.size + "px"; })
                           .style("font-family", "Impact")
                           .style("fill", function(d, i) { return fill(i); })
                           .attr("text-anchor", "middle")
                           .attr("transform", function(d) {
                             return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                           })
                           .text(function(d) { return d.text; });
                     }

       }
   });

});
