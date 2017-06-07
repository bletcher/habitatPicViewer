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
  var  out = [new Date(s.substring(5,6) + "-" + s.substring(7,8) + "-" + s.substring(0,4)).toDateString()];
  out.push(   new Date(s.substring(5,6) + "-" + s.substring(7,8) + "-" + s.substring(0,4)) );
  return out;
}  

function typeFlow(d){
  d.agency = d.agency_cd;
  d.site = d.site_no;
  d.date = Date.parse(d.datetime);
  d.flow = +d.flow;
  
  return d;
}

///////
//  
// http://www.lovelldsouza.com/webdev/flickr-to-website/


function getImgs(setID,setName) {
  var URL = "https://api.flickr.com/services/rest/" + 
    "?method=flickr.photosets.getPhotos" +  
    "&api_key=b17072d6e8c8f93662be1635ac49f557" +  
    "&photoset_id=" + setID +  // The set ID.
    "&user_id=155284079@N03" +
    "&privacy_filter=1" +  // 1 signifies all public photos.
    "&format=json&nojsoncallback=1"
    ;  

  console.log(URL);

  $.getJSON(URL, function(data){
    $.each(data.photoset.photo, function(i, item){
      var img_src = "http://farm" + item.farm + ".static.flickr.com/" + item.server + "/" + item.id + "_" + item.secret + "_m.jpg";
      var img_thumb = $("<img/>").attr("src", img_src).css("margin", "1px").css("width", "7.5%")
      $(img_thumb).appendTo("#flickr-images" + setName);

      if (setName == "_sawmill"){ 
        $('<div class="carousel-item"><img class="d-block img-fluid" src="' + img_src + '"><div class="carousel-caption d-none d-md-block"><h3>' + strToDate(item.title)[0] + ' </h3></div></div>').appendTo('.carousel-inner');
        
        $('<li data-target="#carousel_Sawmill" data-slide-to="'+ i +'"></li>').appendTo('.carousel-indicators');

      }

      //console.log(i,img_src, item)
      
      img_thumb
        .on("mouseover", function(d) {

        console.log("this", this, 'd', d, 'img', d.target.x, d.target.y)
        
        tooltip.html('<h3>' + item.title + '</h3><br><img class="object-fit-contain" src= ' + this.src + ' onerror="imgError(this);"/' + '>')
         // .style("right", "80px")// (d3.event.pageX + 15) + "px")
         // .style("top",  "200px")// (d3.event.pageY - 15) + "px")
  
          .style("left", d3.select('.col-xs-12').node().offsetWidth / 4 + 'px')     
          .style("top",  d.target.y + 0 + "px")
          .transition()
          .duration(100)
          .style("opacity", 1)
          
        })
        
        .on("mouseout", function (d) {
        d3.select(this)
      //    .transition()
      //    .duration(500)
      //    .style("width", "7.5%")
      
        tooltip.transition()
          .duration(250)
          .style("opacity", 0);
      
        })  
    
    });
    
    $('.carousel-item').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
  
  });
}
