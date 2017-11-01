var featureWest, featureStanley;

var app = {
  state:  {
    selectedWatershed: 'west',
    selectedYear: $("#selectedYearDD").val(),
    selectedSeason: $("#selectedSeasonDD").val(),
    selectedSection: 1,
    selectedRiver: "WB",
    showRef: false
  }
};

var yposArray = [];

var riverNames = {
  'West Brook': 'WB',
  'WB Mitchell': 'OS',
  'WB Jimmy': 'OL',
  'WB Obear': 'IS',
  'east': 'east',
  'west': 'west',
  'mainstem': 'mainstem',
  'tidal': 'tidal',
};



///////////////////////////////
// update dropdown functions

$("#selectedYearDD").on("change", function () {
  app.state.selectedYear = $("#selectedYearDD").val();
  
  if(app.state.selectedYear == 'ref') { $("#selectedSeasonDD").val(2) } 
  
  gridDataBySample();
  renderImages("#gridBySample");
  console.log("#selectedYearDD change",app.state.selectedYear);
});

$("#selectedSeasonDD").on("change", function () {
  app.state.selectedSeason = $("#selectedSeasonDD").val();
  gridDataBySample();
  renderImages("#gridBySample");
  console.log("#selectedSeasonDD change",app.state.selectedSeason);
});

$("#selectedWatershedDD").on("change", function () {
  app.state.selectedWatershed = $("#selectedWatershedDD").val();
  gridDataBySample();
  gridDataBySection();
  renderImages("#gridBySample");
  renderImages("#gridBySection");
  console.log("#selectedWatershedDD change",app.state.selectedWatershed);
});

$(".btn-group > button.btn").on("click", function(){
    app.state.selectedSection = +this.innerHTML;
    gridDataBySection();
    renderImages("#gridBySection");
    console.log("#selectedSection change",app.state.selectedSection);
});

$("#selectedRiverDD").on("change", function () {
  app.state.selectedRiver = $("#selectedRiverDD").val();
  gridDataBySection();
  renderImages("#gridBySection");
  console.log("#selectedRiverDD change",app.state.selectedRiver);
});


function imgError(image) {
    image.onerror = "";
    image.src = "/img/noImage.gif";
    console.log('in error');
    return true;
}

/////////////////////////////////
// Make maps

function makeMaps(){
  // read in data
  d3.queue()
    .defer(d3.csv, 'data/coordsForD3JS.csv')
    .await(function (error, coords) {
      if (error) {
        alert('Error occurred while loading the data.');
        throw error;
      }
  
    app.locations = coords;
    console.log(app)
  
    app.locations.forEach(function (d) {
      d.lat = +d.lat;
      d.lon = +d.lon;
      d.river = riverNames[d.riverFull];
      d.LatLng = new L.LatLng(d.lat, d.lon)
    });
    
  // map for West ///
    var selectedWatershedMouse = 'west';
    
    var latLonCenter = [42.434, -72.669],
        zoom = 15
        
    var locationsWest = app.locations.filter(function(d){return d.watershed == selectedWatershedMouse})
  
    var mapWest = L.map('map' + selectedWatershedMouse).setView(latLonCenter, zoom);
  
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapWest);
    
    mapWest._initPathRoot();
    
    
    var year = app.state.selectedYear, season = app.state.selectedSeason;
    var locationsMap,featureWest;
    
    var svg = d3.select("#map" + selectedWatershedMouse).select("svg"),
        g = svg.append("g");
    
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    
    
      var riverColors = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(['WB', 'OS', 'OL', 'IS']);
    
      featureWest = g.selectAll("circle")
        .data(locationsWest)
        .enter().append("circle")
        .style("stroke", function(d) { return d3.rgb(riverColors(d.river)).darker(1); })
        .style("fill", function(d) { return riverColors(d.river); })
        .style("opacity", 0.6)
        .attr("r", 4)
        .on("mouseover", function(d) {
          d3.select(this)
            .attr("r", 8)
            .style("stroke", "red")
            .style("fill", "lightgrey");
          
          var fileName;
          if(app.state.selectedYear == 'ref') {
            fileName = "img/west/ref/" + d.river + "Ref_2017_2_" + d.section + ".JPG";
          }
          else{
            fileName = "img/west/" + 
              app.state.selectedYear + "/" +
              app.state.selectedYear + "_" + app.state.selectedSeason + "/" + 
              d.river + "_" + app.state.selectedYear + "_" + app.state.selectedSeason + "/" +
              d.river + "_" + app.state.selectedYear + "_" + app.state.selectedSeason + "_" + d.section + ".JPG";
          }

          tooltip.html('<h3>River = ' + d.riverFull + 
                       ", Section = " + d.section + 
                       '</h3><br><img class="object-fit-contain" src= ' +
                          fileName + 
                       ' onerror="imgError(this);"/' +  
                       '>')
                          
             .style("right", "80px")// (d3.event.pageX + 15) + "px")
             .style("top",  "200px")// (d3.event.pageY - 15) + "px")
             .transition()
             .duration(100)
             .style("opacity", 1);
        })
        .on("mouseout", function (d) {
          d3.select(this)
            .attr("r", 4)
            .style("stroke", function(d) { return d3.rgb(riverColors(d.river)).darker(1); })
            .style("fill", function(d) { return riverColors(d.river); });
    
           tooltip.transition()
             .duration(250)
             .style("opacity", 0);
        });
        
    mapWest.on("viewreset", onViewResetWest)
    onViewResetWest();
    
    function onViewResetWest() {
      featureWest.attr("transform", function(d) {
        return "translate(" + mapWest.latLngToLayerPoint(d.LatLng).x + "," +
                              mapWest.latLngToLayerPoint(d.LatLng).y + ")";
      });
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // repeat for Stanley, inefficient, but fast ////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var selectedWatershedMouse = 'stanley';
    latLonCenter = [44.303, -68.242]
    zoom = 14
        
    var locationsStanley = app.locations.filter(function(d){return d.watershed == selectedWatershedMouse})
  
    var mapStanley = L.map('map' + selectedWatershedMouse).setView(latLonCenter, zoom);
  
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapStanley);
    
    mapStanley._initPathRoot();
    
    
    //var year = 2009, season = 1;
    var locationsMap,featureStanley;
    
    var svg = d3.select("#map" + selectedWatershedMouse).select("svg"),
        g = svg.append("g");
    
      var riverColors = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(['WB', 'OS', 'OL', 'IS']);
    
      featureStanley = g.selectAll("circle")
        .data(locationsStanley)
        .enter().append("circle")
        .style("stroke", function(d) { return d3.rgb(riverColors(d.river)).darker(1); })
        .style("fill", function(d) { return riverColors(d.river); })
        .style("opacity", 0.6)
        .attr("r", 4)
        .on("mouseover", function(d) {
          d3.select(this)
            .attr("r", 8)
            .style("stroke", "red")
            .style("fill", "lightgrey");
  
          var fileName = "img/stanley/"+ d.river + "_" + app.state.selectedYear + "_" + app.state.selectedSeason + "_" + d.section + ".JPG";
          
          tooltip.html('<h3>River = ' + d.riverFull + ", Section = " + d.section + '</h3><br><img class="object-fit-contain" src= ' + 
                                                                                                                             fileName + 
                                                                                                                             ' onerror="imgError(this);"/' +  
                                                                                                                             '>')
             .style("right", "80px")// (d3.event.pageX + 15) + "px")
             .style("top",  "200px")// (d3.event.pageY - 15) + "px")
             .transition()
             .duration(100)
             .style("opacity", 1);
        })
        .on("mouseout", function (d) {
          d3.select(this)
            .attr("r", 4)
            .style("stroke", function(d) { return d3.rgb(riverColors(d.river)).darker(1); })
            .style("fill", function(d) { return riverColors(d.river); });
    
           tooltip.transition()
             .duration(250)
             .style("opacity", 0);
        });
        
    mapStanley.on("viewreset", onViewResetStanley)
    onViewResetStanley();
    
    function onViewResetStanley() {
      featureStanley.attr("transform", function(d) {
        return "translate(" + mapStanley.latLngToLayerPoint(d.LatLng).x + "," +
                              mapStanley.latLngToLayerPoint(d.LatLng).y + ")";
      });
    }  
    
  });
};

///////////////////////////////////
// Make grids and fill with images

var tooltipGrid = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


//https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739
function gridDataBySample() {
  if(app.state.selectedYear == 'ref') return;
  
	var data = [];
	var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
	var ypos = 1;
	var width = 80;
	var height = 80;
	var numRows = 7;
	var numCols = 15;
	
	var imageRowMap = [
	  "WB",
	  "WB",
	  "WB",
	  "WB",
	  "OL",
	  "OS",
	  "IS"
	];
	
	var riverMult = [ 0,1,2,3,0,0,0 ];
	
	var include = [
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	  [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	];
	
	// iterate for rows	
	for (var row = 0; row < numRows; row++) {
		data.push( new Array() );
		
		// iterate for cells/columns inside rows
		for (var column = 0; column < numCols; column++) {
		  var columnPlus1 = (column + 1) + riverMult[row] * numCols;

			if (include[row][column] == 1){
  			data[row].push({
  				x: xpos,
  				y: ypos,
  				width: width,
  				height: height,
  				imageName: "img/" + app.state.selectedWatershed + "/"+ 
  				                    app.state.selectedYear + "/" + 
  				                    app.state.selectedYear + "_" + app.state.selectedSeason + "/" + 
  				                    imageRowMap[row] + "_" + app.state.selectedYear + "_" + app.state.selectedSeason + "/" +
  				                    imageRowMap[row] + "_" + app.state.selectedYear + "_" + app.state.selectedSeason + "_" + columnPlus1 + ".JPG"
  				                    
  				                   // /home/ben/webApps/habitatPicViewer/img/west/2006/2006_3/WB_2006_3
  			})
			}
			else{
  			data[row].push({
  				x: xpos,
  				y: ypos,
  				width: width,
  				height: height
  			})
			}
			
			// increment the x position. I.e. move it over by 50 (width variable)
			xpos += width;
		}
		// reset the x position after a row is complete
		xpos = 1;
		// increment the y position for the next row. Move it down 50 (height variable)
		ypos += height;	
	}
	return data;
}

function gridDataBySection() {
  if(app.state.selectedYear == 'ref') return;
  
	var data = [];
	var xposInit = 100; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
	var xpos = xposInit;
	var ypos = 50;
	var width = 100;
	var height = 100;
	var numRows = 16;
	var numCols = 4;
	var yearInc = 2002-1;
	
	// placeholder for now
	var include = [
	  [1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],
	  [1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],
	  [1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],
	  [1,1,1,1],[1,1,1,1],[1,1,1,1]
	];
	
	var imageYearMap = [
	  [2002,2002,2002,2002],
	  [2003,2003,2003,2003],[2004,2004,2004,2004],[2005,2005,2005,2005],
	  [2006,2006,2006,2006],[2007,2007,2007,2007],[2008,2008,2008,2008],
	  [2009,2009,2009,2009],[2010,2010,2010,2010],[2011,2011,2011,2011],
	  [2012,2012,2012,2012],[2013,2013,2013,2013],[2014,2014,2014,2014],
	  [2015,2015,2015,2015],[2016,2016,2016,2016],[2017,2017,2017,2017]
	];
	
	var imageSeasonMap = [
	  [1,2,3,4],
	  [1,2,3,4],[1,2,3,4],[1,2,3,4],
	  [1,2,3,4],[1,2,3,4],[1,2,3,4],
	  [1,2,3,4],[1,2,3,4],[1,2,3,4],
	  [1,2,3,4],[1,2,3,4],[1,2,3,4],
	  [1,2,3,4],[1,2,3,4],[1,2,3,4]
	];
	
	// iterate for rows	
	yposArray = [];
	for (var row = 0; row < numRows; row++) {
		data.push( new Array() );
		
		// iterate for cells/columns inside rows
		for (var column = 0; column < numCols; column++) {
		  
			if (include[row][column] == 1){
  			data[row].push({
  				x: xpos,
  				y: ypos,
  				width: width,
  				height: height,
//  				imageName: "img/" + app.state.selectedWatershed + "/" + imageYearMap[row][column] + "_" + imageSeasonMap[row][column] + "/" + app.state.selectedRiver + "_" + imageYearMap[row][column] + "_" + imageSeasonMap[row][column] + "_" + app.state.selectedSection + ".jpg"
  				
  				imageName: "img/" + app.state.selectedWatershed + "/" + 
  				                    imageYearMap[row][column] + "/" + 
  				                    imageYearMap[row][column] + "_" + imageSeasonMap[row][column] + "/" + 
  				                    app.state.selectedRiver + "_" + imageYearMap[row][column] + "_" + imageSeasonMap[row][column] + "/" +
  				                    app.state.selectedRiver + "_" + imageYearMap[row][column] + "_" + imageSeasonMap[row][column] + "_" + app.state.selectedSection + ".JPG"

  			})
      }
			else{
  			data[row].push({
  				x: xpos,
  				y: ypos,
  				width: width,
  				height: height
  			})
			}
			
			// increment the x position. I.e. move it over by 50 (width variable)
			xpos += width;
		}
		// reset the x position after a row is complete
		xpos = xposInit;
		// increment the y position for the next row. Move it down 50 (height variable)
		ypos += height;	
		yearInc += 1;
	
		yposArray.push({
		  x: 20,
		  y: ypos - 40,
		  value: yearInc
		});
		
	}
	console.log("data",data,yposArray)
	return data;
}

/////////////////////////////////
// Render images in the grid


function renderImages(byID){
  if(app.state.selectedYear == 'ref') return;

  d3.select(byID).html(null);
  
  if(byID == "#gridBySample")  { var gridDat = gridDataBySample();  var hpx = "710px"; var wpx = "1440px" }	
  if(byID == "#gridBySection") { var gridDat = gridDataBySection(); var wpx = "510px"; var hpx = "1750px"}
  
  var grid = d3.select(byID)
  	.append("svg")
  	.attr("width",wpx)
  	.attr("height",hpx);
  	
  var row = grid.selectAll(".row")
  	.data(gridDat)
  	.enter().append("g")
  	.attr("class", "row");
  	
  var column = row.selectAll(".square")
  	.data(function(d) { return d; })
  	.enter().append("rect")
  	.attr("class","square")
  	.attr("x", function(d) { return d.x; })
  	.attr("y", function(d) { return d.y; })
  	.attr("width", function(d) { return d.width; })
  	.attr("height", function(d) { return d.height; })
  	.style("fill", "#fff")
  	.style("stroke", "#222")
  	.on('click', function(d) {
  
      });
  
    var w = d3.select('.col-xs-12').node().offsetWidth;
    var tt = d3.select('.tooltip').node().offsetWidth;
    var xOffset, yOffset;
  
    var image = row.selectAll(".image")
    	.data(function(d) { return d; });
    	
      image.enter().append("image")
    	.attr("xlink:href", function(d) { return d.imageName; } )
    	.attr("x", function(d) { return d.x; })
    	.attr("y", function(d) { return d.y; })
    	.attr("width", function(d) { return d.width; })
    	.attr("height", function(d) { return d.height; })
    	
    	 .on("mouseover", function(d) {

    	   if(d.x > w/2) { xOffset = w/4 + 'px' } else { xOffset = w - tt + 50 + 'px' }
    	   if(byID == "#gridBySample") { yOffset = d.y + 720 + "px" } else { yOffset = d.y + 1640 + "px" }

         tooltipGrid.html('<h3>' + d.imageName + '</h3><br><img class="object-fit-contain" src= ' + d.imageName + ' onerror="imgError(this);"/' +  '>')
          .style("left", xOffset)   
          .style("top",  yOffset)
          .transition()
          .duration(100)
          .style("opacity", 1);
    	  })
    	  
        .on("mouseout", function (d) {
          tooltipGrid.transition()
             .duration(250)
             .style("opacity", 0);  
  
        });
   
   // season labels /////////////
        
   var xpos=100; var ypos=50;var width=100; // need to make these dynamic
   
   var seasonLabels = [
     { "x": xpos+width/5,           "y": 30, "value": "Spring" },
     { "x": xpos+width/5.5+width*1, "y": 30, "value": "Summer" },
     { "x": xpos+width/5+width*2,   "y": 30, "value": "Autumn" },
     { "x": xpos+width/5+width*3,   "y": 30, "value": "Winter" } ];
	
//		console.log( yposArray,seasonLabels)
	var labels = seasonLabels.concat(yposArray);
//	console.log( yposArray,labels)
  var text = d3.select("#gridBySection > svg").selectAll("text")
               .data(labels)
               .enter()
               .append("text");

  var textLabels = text
                     .attr("x", function(d) { return d.x; })
                     .attr("y", function(d) { return d.y; })
                     .text( function (d) { return d.value; })
                     .attr("font-family", "sans-serif")
                     .attr("font-size", "20px")
                     .attr("fill", "darkgrey");
   
}	




