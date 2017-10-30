// clear cache
// window.location.reload(true) 


var state = {
 fileName: undefined,  
 caption: undefined,        
 currentDate: undefined,
 flowIn: undefined,
 TandPIn: undefined,
 selectedResolution: "z", //medium
 setNameInfo: {
   sawmill: {
     imgWidth: "7.5%"
   },
   consArea: {
     imgWidth: "10%"
   }
 },
 transitionDur: 2000,
 clickDate: []
};

var gageData;

var svg;
var g, x, y;

var svg2;
var g2, x2, y2;

var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
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

function dateToStr(s) {
  var d = new Date(s);
  var dd = d.toDateString();
  return dd;
}  


function typeFlow(d){
  d.agency = d.agency_cd;
  d.site = d.site_no;
  d.date = strToDate(d.datetime);//Date.parse(d.datetime);
  d.flow = +d.flow;
  
  return d;
}

function typeTandP(d){
  d.date = strToDate(d.date);//Date.parse(d.date);
  d.temp = +d.meanT;
  d.prec = +d.meanP;
  
  return d;
}

$('#carousel_sawmill').on('slide.bs.carousel', function (e) {
  var slideFrom = $(this).find('.active').index();
  var slideTo = $(e.relatedTarget).index();
  console.log(slideFrom+' => '+slideTo);
  
  //console.log(e)
  
  state.caption = $(e.relatedTarget).find('.carousel-caption').text();
  state.currentDate = strToDate(state.caption);
  //console.log("dates",state.caption,state.caption.slice(0,10),state.currentDate, new Date(state.currentDate).toDateString())
  
  transCircle(state.flowIn.filter(function(d){return d.date == state.currentDate}));
  //console.log("filter",state.flowIn.filter(function(d){return d.date == state.currentDate}))

  transCircle2(state.TandPIn.filter(function(d){return d.date == state.currentDate}));
  //console.log("filter3",state.TandPIn.filter(function(d){return d.date == state.currentDate}))

});

$('.carousel').carousel({ interval: state.transitionDur });

$("#selectedResolutionDD").on("change", function () {
  state.selectedResolution = $("#selectedResolutionDD").val();
  
  $('.carousel').carousel('pause');
  $(".carousel-indicators").empty();
  $(".carousel-inner").empty();
  $("#flickr-images_sawmill").empty();
  getImgs("72157681488505313","sawmill");
  $('.carousel').carousel('cycle');

  $("#flickr-images_consArea").empty();
  getImgs("72157681560511503","consArea");
  
  console.log("#selectedResolutionDD change", state.selectedResolution);
});

$("#carouselButtons :input").change(function() {
    if(this.id == 'stop') $('.carousel').carousel('pause');
    if(this.id == 'go')   $('.carousel').carousel('cycle');
});

// Can't get the carousel speed to chagne with buttons
/*
$("#speedButtons :input").change(function() {
    if(this.id == 'slow') {
      console.log("slow")
    
      $('.carousel').carousel('pause');
      $(".carousel-indicators").empty();
      $(".carousel-inner").empty();
      $("#flickr-images_sawmill").empty();
      getImgs("72157681488505313","sawmill");
      $('.carousel').carousel({ interval: 6000 });
      $('.carousel').carousel('cycle');
    }
    if(this.id == 'med'){
      console.log("med")
    
      $('.carousel').carousel('pause');
      $(".carousel-indicators").empty();
      $(".carousel-inner").empty();
      $("#flickr-images_sawmill").empty();
      getImgs("72157681488505313","sawmill");
      $('.carousel').carousel({ interval: 4000 });
      $('.carousel').carousel('cycle');
    }
    if(this.id == 'fast') {
      console.log("fast")
    
      $('.carousel').empty();
      $(".carousel-indicators").empty();
      $(".carousel-inner").empty();
      $("#flickr-images_sawmill").empty();
      $('.carousel').carousel({ interval: 2000 });
      getImgs("72157681488505313","sawmill");
      $('.carousel').carousel('cycle');
    }
});

 
  
  $(function () {
    $('.carousel').carousel({
        interval:500,
        pause: "false"
    });
    $('#slow').click(function () {
      c = $('.carousel')
      opt = c.data()['bs.carousel'].options
      opt.interval= 10000;
      c.data({options: opt})
      console.log("fast")
    });
    $('#fast').click(function () {
      c = $('.carousel')
      opt = c.data()['bs.carousel'].options
      opt.interval= 1000;
      c.data({options: opt})
            console.log("slow")
    });
  });

*/ 
///////
//  
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
//console.log('testIn')
//  console.log(URL,setID,setName);

  $.getJSON(URL, function(data){
    $.each(data.photoset.photo, function(i, item){
      var img_src = "http://farm" + item.farm + ".static.flickr.com/" + item.server + "/" + item.id + "_" + item.secret + "_" + state.selectedResolution + ".jpg";
      var img_thumb = $("<img/>").attr("src", img_src).css("margin", "1px").css("width", state['setNameInfo'][setName]['imgWidth']);
      $(img_thumb).appendTo("#flickr-images_" + setName);

      // add images to carousel
      if (setName == "sawmill"){ 

        $('<div class="carousel-item"><img class="d-block img-fluid" src="' + img_src + '"><div class="carousel-caption d-none d-md-block"><h3>' + item.datetaken + ' </h3></div></div>').appendTo('.carousel-inner');
        
        $('<li data-target="#carousel_sawmill" data-slide-to="'+ i +'"></li>').appendTo('.carousel-indicators');

        // add slide # to gageData
        slideIndex[i] = strToDate(item.datetaken);

      }

      img_thumb
        .on("mouseover", function(d) {

        //console.log("this", this, 'd', d, 'img', d.target.x, d.target.y, d.target.y);
        
        tooltip.html('<h3>' + item.datetaken + " // " + item.title + '</h3><br><img class="object-fit-contain" src= ' + this.src + ' onerror="imgError(this);"/' + '>')

          .style("left", d3.select('.col-xs-12').node().offsetWidth / 4 + 'px')     
          .style("top",  d.target.y + 0 + "px")
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
  
  var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.flow); });
      
      // Define the div for the tooltip
  var divTTGraph = d3.select("svg").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
    
  var bisectDate = d3.bisector(function(d) { return d.date; }).left;
  
  
  // get data for graph
  
  var timeQueryRange = '&startDT=2016-12-18' //&endDT=2017-06-28'
	//var timeQuery = '&period=P7D'
	//var gage = '01174565'; // swift river - issues with backwater
	var gage = '01169900'; // south river, conway

	$.getJSON('https://staging.waterservices.usgs.gov/nwis/dv/?format=json&sites=' + 
	           gage + timeQueryRange, function(data) {
		console.log('graphdata: ',data)
		gageData = data.value.timeSeries[0].values[0].value
		
		$.each(gageData, function(i,d){ 
		  var dd = new Date( d.dateTime );
		  d.date = strToDate(dd);
		  d.flow = +d.value;
		})
		
		state.flowIn = gageData;
    console.log(state);
 
    x.domain(d3.extent(state.flowIn, function(d) { return d.date; }));
    y.domain(d3.extent(state.flowIn, function(d) { return d.flow; }));
  
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .attr("stroke", "grey")
      .select(".domain")
        .remove();
  
    g.append("g")
        .call(d3.axisLeft(y))
        .attr("stroke", "grey")
      .append("text")
        .attr("fill", "lightgrey")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("stroke", "grey")
        .text("Flow (cfs)");
  
    g.append("path")
        .datum(state.flowIn)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
      
   var picDates = g.selectAll("g") 
                     .data(slideIndex);
   
   picDates.enter().append("rect")
        .attr("x", function(d) { return x(d); })
        .attr("y", y(d3.min(state.flowIn, function (d) { return d.flow; }) + 10))
        .attr("width", 2)
        .attr("height", 5)
        .attr("stroke", "grey");

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
          i = bisectDate(state.flowIn, x0, 1),
          d0 = state.flowIn[i - 1],
          d1 = state.flowIn[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      var clickData = gageData.filter(function(dd){return dd.date == d.date});
      state.clickDate = clickData[0].date;
      
      console.log(dateToStr(d.date), clickData[0].date, slideIndex.findIndex(findDate));
      // finds the index (slide #) for the next date for which we have a picture
      $('.carousel').carousel(slideIndex.findIndex(findDate));
    }
 
 });


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


function makeTandPGraph(){

    // Make the graph
  svg2 = d3.select("#TandPGraph"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g2 = svg2.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%d-%b-%y");
  
  x2 = d3.scaleTime()
      .rangeRound([0, width]);
  
  y2 = d3.scaleLinear()
      .rangeRound([height, 0]);
  
  var line2a = d3.line()
      .x(function(d) { return x2(d.date); })
      .y(function(d) { return y2(d.meanT); });
      
  var line2b = d3.line()
      .x(function(d) { return x2(d.date); })
      .y(function(d) { return y2(d.meanP); });
      
    
  var bisectDate = d3.bisector(function(d) { return d.date; }).left;
  
  
  // get data for graph
  
 d3.csv("/data/dailyMeanTandP.csv", typeTandP, function(TandPData) {
   
		state.TandPIn = TandPData;
    console.log("in TandP",state);
 
    x2.domain(d3.extent(state.TandPIn, function(d) { return d.date; }));
    y2.domain(d3.extent(state.TandPIn, function(d) { return d.temp; }));
  
    g2.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x2))
        .attr("stroke", "grey")
      .select(".domain")
        .remove();
  
    g2.append("g")
        .call(d3.axisLeft(y2))
        .attr("stroke", "grey")
      .append("text")
        .attr("fill", "lightgrey")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("stroke", "grey")
        .text("Temperature (C)");
  
    g2.append("path")
        .datum(state.TandPIn)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line2a);
/*
    g2.append("path")
        .datum(state.TandPIn)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line2b);
*/     
 //  var picDates = g2.selectAll("g") 
 //                    .data(slideIndex);
 /*  
   picDates.enter().append("rect")
        .attr("x", function(d) { return x2(d); })
        .attr("y", y(d3.min(state.TandPIn, function (d) { return d.temp; }) + 10))
        .attr("width", 2)
        .attr("height", 5)
        .attr("stroke", "grey");
*/
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
          i = bisectDate(state.TandPIn, x0, 1),
          d0 = state.TandPIn[i - 1],
          d1 = state.TandPIn[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      var clickData2 = TandPData.filter(function(dd){return dd.date == d.date});
      state.clickDate = clickData2[0].date;
      
      console.log(dateToStr(d.date), clickData2[0].date, slideIndex.findIndex(findDate));
      // finds the index (slide #) for the next date for which we have a picture
      $('.carousel').carousel(slideIndex.findIndex(findDate));
    }

 });


}
