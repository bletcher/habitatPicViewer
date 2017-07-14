// clear cache
// window.location.reload(true) 

var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var tooltipGoals = d3.select("body").append("div")
  .attr("class", "tooltipGoals")
  .style("opacity", 0);

function imgError(image) {
    image.onerror = "";
    image.src = "/img/noImage.gif";
    console.log('in error');
    return true;
}

function strToDate(s) {
  var d = new Date(s);
  var dd = Date.parse( new Date(d.getFullYear(),d.getMonth(),d.getDate()) );
  return dd;
}  

function strToDate2(s) {
  var d = new Date(s);
  var dd = d.getFullYear();
  return dd;
}

function dateToStr(s) {
  var d = new Date(s);
  var dd = d.toDateString();
  return dd;
}  

////////
$('#carousel_sawmill').on('slide.bs.carousel', function (e) {
  var slideFrom = $(this).find('.active').index();
  var slideTo = $(e.relatedTarget).index();
  console.log(slideFrom+' => '+slideTo);
  
  //console.log(e)
  
  state.caption = $(e.relatedTarget).find('.carousel-caption').text();
  state.currentDate = strToDate(state.caption);
  //console.log("dates",state.caption,state.caption.slice(0,10),state.currentDate, new Date(state.currentDate).toDateString())
  
  transCircle(state.env.filter(function(d){return d.date == state.currentDate}));
  //console.log("filter",state.flowIn.filter(function(d){return d.date == state.currentDate}))

  transCircle2(state.env.filter(function(d){return d.date == state.currentDate}));
  //console.log("filter3",state.TandPIn.filter(function(d){return d.date == state.currentDate}))

});

$("#carouselButtons :input").change(function() {
    if(this.id == 'stop') $('.carousel').carousel('pause');
    if(this.id == 'go')   $('.carousel').carousel('cycle');
});


$("#prcpButtons :input").change(function() {
    if(this.id == 'yes') { d3.select("#prcpLine").style("opacity", 1); d3.select("#prcpAxis").style("opacity", 1); }
    if(this.id == 'no')  { d3.select("#prcpLine").style("opacity", 0); d3.select("#prcpAxis").style("opacity", 0); }
});

$("#tempButtons :input").change(function() {
    if(this.id == 'yes') makeTempGraph();
    if(this.id == 'no') $("#tempGraph").empty();
});

d3.select("#goals")
  .on("mouseover", function(d) {
     tooltipGoals.html(projectGoals)
        .style("left", "100px") 
        .style("top", "100px")
        .transition()
        .duration(100)
        .style("opacity", 1);
      
        $(this).css('color', 'darkgrey'); 
  })
        
  .on("mouseout", function (d) {

    $(this).css('color', 'white'); 
    
    tooltipGoals.transition()
      .duration(250)
      .style("opacity", 0);

  });  


///////
// http://www.lovelldsouza.com/webdev/flickr-to-website/

var slideIndex = [];

function findDate(dd) {
  return dd >= state.clickDate;
}
      
function getImgs(setID,setName) {
  
  var URL = "https://api.flickr.com/services/rest/" + 
    "?method=flickr.photosets.getPhotos" +  
    "&api_key=b17072d6e8c8f93662be1635ac49f557" +  
    "&photoset_id=" + setID +  // The set ID.
    "&user_id=155284079@N03" +
//    "&privacy_filter=1" +  // 1 signifies all public photos.
    "&extras=date_taken" +
    "&format=json&nojsoncallback=1" 
    ;  

  $.getJSON(URL, function(data){
    $.each(data.photoset.photo, function(i, item){
      var img_src = "http://farm" + item.farm + ".static.flickr.com/" + item.server + "/" + item.id + "_" + item.secret + "_" + state.selectedResolution + ".jpg";
      var img_thumb = $("<img/>").attr("src", img_src).css("margin", "1px").css("width", state['setNameInfo'][setName]['imgWidth']);
      $(img_thumb).appendTo("#flickr-images_" + setName);

      // add images to carousel
      if (setName == "sawmill"){ 

        $('<div class="carousel-item"><img class="d-block img-fluid" src="' + img_src + '"><div class="carousel-caption d-none d-md-block"><h3>' + item.datetaken + ' </h3></div></div>').appendTo('.carousel-inner');
        
        $('<li data-target="#carousel_sawmill" data-slide-to="'+ i +'"></li>').appendTo('.carousel-indicators');

        // create array dates with pictures
        slideIndex[i] = strToDate(item.datetaken);

      }
      
      var tt = 480; //d3.select('.tooltip').node().offsetWidth;
      var xOffset, yOffset;

      img_thumb
        .on("mouseover", function(d) {
          
         var w = d3.select('#flickr-images_sawmill').node().offsetWidth;
         
         if(d.target.x > w/2) { xOffset = w/4 + 'px' } else { xOffset = w - tt + 50 + 'px' }
    	   yOffset = d.target.y + "px";

        tooltip.html('<h3>' + item.datetaken + " // " + item.title + '</h3><br><img class="object-fit-contain" src= ' + this.src + ' onerror="imgError(this);"/' + '>')

          .style("left", xOffset) 
          .style("top",  yOffset)
          .transition()
          .duration(100)
          .style("opacity", 1);
          
        })
        
        .on("mouseout", function (d) {
          d3.select(this);
  
          tooltip.transition()
            .duration(250)
            .style("opacity", 0);
      
        });  
    
    });
    
    $('.carousel-item').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
    
    $('.carousel').carousel('pause');
  });
}


function transCircle(dat){
  
     var circle = g.selectAll("circle")
      .data(dat);
      
     circle.exit().remove();
     
     circle
      .enter()
      .append("circle")
      .attr("r", 5) 
      .attr("fill", "white")
      .attr("stroke", "darkgrey");
     
     circle 
      .transition()
      .duration(600)
      
      .attr("cx",function(d){
          return x(d.date);
      })
      .attr("cy",function(d){
          return y(d.flow);
      });

}


////////////////////////////////////////
// make the flow graph with transitions for the date dot. 
// Graph is clickable to get picture for clicked date. Goes to next date.

function makeFlowGraph(){

    // Make the graph
  svg = d3.select("#flowGraph"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var parseTime = d3.timeParse("%d-%b-%y");
  
  x = d3.scaleTime()
      .rangeRound([0, width]);
  
  y = d3.scaleLinear()
      .rangeRound([height, 0]);
      
  y2 = d3.scaleLinear()
      .rangeRound([height, height/1.66]);
      
  var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.flow); });
      
  var lineB = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y2(d.prcp);}); 
      
  var lineColor = d3.scaleOrdinal()
      .domain([0, 1])
      .range(["grey", "white"]);
      
  // Define the div for the tooltip
  var divTTGraph = d3.select("svg").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
    
  var bisectDate = d3.bisector(function(d) { return d.date; }).left;
  
    x.domain(d3.extent(state.env, function(d) { return d.date; }));
    y.domain(d3.extent(state.env, function(d) { return d.flow; }));
    y2.domain(d3.extent(state.env, function(d) { return d.prcp; }));
    
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axisGrey")
        .call( d3.axisBottom(x));

    g.append("g")
        .attr("class", "axisGrey")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "lightgrey")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Flow (cfs)");
    
    var widthMinus = width - 3;

    g.append("g")
        .attr("class", "axisBlue")
        .call(d3.axisRight(y2))
        .attr("transform", "translate(" + widthMinus + ",0)")
        .attr("id", "prcpAxis")
      .append("text")
        .attr("fill", "lightblue")
        .attr("transform", "rotate(-90)")
        .attr("y", -15)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Precipition (inches)");
  
    g.append("path")
        .datum(state.env)
        .attr("fill", "none")
        .attr("stroke", function(d) { return lineColor(d.flowApprox); }) //"grey")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
        
      g.append("path")
        .datum(state.env)
        .attr("class", "line")
        .attr("id", "prcpLine")
        .attr("fill", "none")
        .attr("stroke", "lightblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", lineB);    
      
/*   var picDates = g.selectAll("g") 
                     .data(slideIndex);
   
   picDates.enter().append("rect")
        .attr("x", function(d) { return x(d); })
        .attr("y", y(d3.min(state.env, function (d) { return d.flow; }) + 10))
        .attr("width", 2)
        .attr("height", 5)
        .attr("stroke", "grey");
*/

// add ability to click on graph and return date to get the slide # to slide to 
// https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3

    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("click", mouseClick);

    function mouseClick() {
      // find the closest date
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(state.env, x0, 1),
          d0 = state.env[i - 1],
          d1 = state.env[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      var clickData = state.env.filter(function(dd){return dd.date == d.date});
      state.clickDate = clickData[0].date;
      
      console.log(dateToStr(d.date), clickData[0].date, slideIndex.findIndex(findDate));
      // finds the index (slide #) for the next date for which we have a picture
      $('.carousel').carousel(slideIndex.findIndex(findDate));
    }
}

////////////////////////////////////////
// make the temperature and Precip graph with transitions for the date dot. 
// Graph is clickable to get picture for clicked date. Goes to next date.

function transCircle2(dat){
  
     var circle = g2.selectAll("circle")
      .data(dat);
      
     circle.exit().remove();
     
     circle
      .enter()
      .append("circle")
      .attr("r", 5) 
      .attr("fill", "white")
      .attr("stroke", "darkgrey");
     
     circle 
      .transition()
      .duration(600)
      
      .attr("cx",function(d){
          return x2(d.date);
      })
      .attr("cy",function(d){
          return y2(d.temp);
      });

}

function makeTempGraph(){

    // Make the graph
  svg2 = d3.select("#tempGraph"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g2 = svg2.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%d-%b-%y");
  
  x2 = d3.scaleTime()
      .rangeRound([0, width]);
  
  y2 = d3.scaleLinear()
      .rangeRound([height, 0]);
   
  yF = d3.scaleLinear()
      .rangeRound([height, 0]);
  
  var line2a = d3.line()
    .x(function(d) { return x2(d.date); })
    .y(function(d) { return y2(d.temp); });
  
  var line2b = d3.line()
    .x(function(d) { return x2(d.date); })
    .y(function(d) { return y2(d.meanTemp); });
      
  var bisectDate = d3.bisector(function(d) { return d.date; }).left;
  
  
    x2.domain(d3.extent(state.env, function(d) { return d.date; }));
    y2.domain(d3.extent(state.env, function(d) { return d.temp; }));
    yF.domain(d3.extent(state.env, function(d) { return d.temp*9/5+32; }));
  
    g2.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axisGrey")
        .call(d3.axisBottom(x2));
  
    g2.append("g")
        .attr("class", "axisGrey")
        .call(d3.axisLeft(y2))
      .append("text")
        .attr("fill", "lightgrey")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Air temperature (C)");
      
     var widthMinus = width - 3;    
     g2.append("g")
        .attr("class", "axisGrey")
        .call(d3.axisRight(yF))
        .attr("transform", "translate(" + widthMinus + ",0)")
      .append("text")
        .attr("fill", "grey")
        .attr("transform", "rotate(-90)")
        .attr("y", -15)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Air temperature (F)");
        
    g2.append("line")         
      .style("stroke", "grey") 
      .attr("x1", x(d3.min(state.env, function(d) { return d.date; })))    
      .attr("y1", y2(0))     
      .attr("x2", x(d3.max(state.env, function(d) { return d.date; })))  
      .attr("y2", y2(0))
      .attr("stroke-width", 0.5);   
  
    g2.append("path")
      .datum(state.env)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "darkgrey")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2.0)
        .attr("d", line2b);

    g2.append("path")
      .datum(state.env)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line2a);
     
// add ability to click on graph and return date to get the slide # to slide to 
// https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3

    svg2.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("click", mouseClick2);

    function mouseClick2() {
      // find the closest date
      var x0 = x2.invert(d3.mouse(this)[0]),
          i = bisectDate(state.env, x0, 1),
          d0 = state.env[i - 1],
          d1 = state.env[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      var clickData2 = state.env.filter(function(dd){return dd.date == d.date});
      state.clickDate = clickData2[0].date;
      
      console.log(dateToStr(d.date), clickData2[0].date, slideIndex.findIndex(findDate));
      // finds the index (slide #) for the next date for which we have a picture
      $('.carousel').carousel(slideIndex.findIndex(findDate));
    }

}


function startTour () {
  console.log("in startTour");
  $('.carousel').carousel('pause'); 
  
  var intro = introJs();
  intro.setOptions({
    showStepNumbers: false,
    steps: [
      {
        intro: '<p class="text-center" style="font-size:20px">Welcome to the<br><strong>Daily Picture Viewer</strong><br>demo for images from the Sawmill river in Montague, MA</p><br><p class="text-center">Click Next to begin the tour of this dashboard, or Skip to quit the tour and get right to exploring the data.</p>'
      },
      {
        element: '#carousel_sawmill',
        intro: '<p>The images cycle through time in this carousel. Mouse over the image to pause cycling and hit the forward or back arrows to move the slides one at a time</p>'
      },
      {
        element: '.carousel-indicators',
        intro: '<p>Each dash is an indicator for an image. Click on a dash to jump to the image.</p>'
      },
 /*     {
        element: '#imageRes',
        intro: '<p>Change the image resolution from medium to high. Medium is the default.</p>'
      },   */     
      {
        element: '#carouselButtons',
        intro: '<p>Stop or resume cycling of the images in the carousel.</p>'
      },
      {
        element: '#graph1',
        intro: '<p>This panel shows stream flow over time from a nearby USGS stream gage (South River, Conway, MA). Precipitation is estimated for the stream location. The dot on the graph shows the flow for the date of the current picture. Clicking on the graph will jump the image in the carousel to clicked date. You can use this to show an image for a chosen flow or preciptiation on the graph.</p>'
      },
      {
        element: '#graph2',
        intro: '<p>This graph works just like the graph above. The smoother line is the long-term average daily temperature from 1979 until now. Compare the more jagged line to the smooth line to see if this year is warmer or colder than average.</p>'
      },
      {
        element: '#gridHeader',
        intro: '<p>This section shows a grid of the same images that are in the carousel. Mouse over an image to see a larger view.</p>'
      }
    ]
  });
  intro.start();
}

// Start the carousel when exit the intro
introJs.fn.onexit(function() { console.log("Exited intro"); $('.carousel').carousel('cycle');  });
introJs.fn.oncomplete(function() { console.log("Completed intro"); $('.carousel').carousel('cycle');  });

