

/*
  function typeFlow(d){
    d.agency = d.agency_cd;
    d.site = d.site_no;
    d.date = strToDate(d.datetime.slice(0,10));//Date.parse(d.datetime);
    d.flow = +d.flow;
    
    return d;
  }

function typeTandP(d){
  d.date2 = strToDate(d.date.slice(0,10));//Date.parse(d.date);
  d.date = strToDate(d.date);//Date.parse(d.date);
  d.temp = +d.meanT;
  d.prec = +d.meanP;
  
  return d;
}


function getExtentForDates(aa,bb){
  //  call as: getExtentForDates("TandPIn","flowIn")
  var a = state[aa].map(function(d) {return d.date;});
  var b = state[bb].map(function(d) {return d.date;});
  return d3.extent(a.concat(b));
}

// left_joins flow and TandP data to an array of all possible dates from both data sets  
function mergeEnvData(){
  var range = getExtentForDates("TandPIn","flowIn");
  
  var dates = getDates(new Date(range[0]), new Date(range[1]));
  var datesWData = {
    dateStr: [],
    date: [],
    flow: [],
    temp: [],
    prec: []
  };
  
  dates.forEach( function(d,i) {
    console.log(i,d,strToDate(d), 
                state.TandPIn.filter(function(dd){return dd.date == strToDate(d)}));
    
    datesWData.dateStr[i] = d;
    datesWData.date[i] = strToDate(d);
    
    var f = state.flowIn.filter(function(dd){return dd.date == strToDate(d)});
    if( f.length > 0 ) datesWData.flow[i] = f[0].flow; else datesWData.flow[i] = null;
    
    var tp = state.TandPIn.filter(function(dd){return dd.date == strToDate(d)});
    if( tp.length > 0 ){ 
      datesWData.temp[i] = tp[0].temp; 
      datesWData.prec[i] = tp[0].prec; 
    }
    else {
      datesWData.temp[i] = null;
      datesWData.prec[i] = null;
    }  
    
  });
  return datesWData;
  
}



// create array of dates
// call as getDates(new Date("2017/01/01"), new Date("2017/07/01"))
Date.prototype.addDays = function (days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}

function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(currentDate);
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}
*/
  
  
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