

var state = {
  fileName: undefined,  
  caption: undefined,        
  currentDate: undefined,
  flowIn: undefined,
  TandPIn: undefined,
  env: undefined,
  selectedResolution: "z", //medium
  setNameInfo: {
    sawmill: {
      imgWidth: "7.5%"
    },
    consArea: {
      imgWidth: "10%"
    }
  },
  transitionDur: 4000,
  clickDate: []
};

//var gageData;

var svg;
var g, x, y;

var svg2;
var g2, x2, y2;

var projectGoals = "<u>Understanding natural variability</u>: The world around us is different every day, but how different? This project shows daily images and graphs for a small stream in western MA and lets you use the images, graphs or, ideally, the combination to get a feel for how much the stream changes over time. <br><br><u>Linking graphs to images</u>: Graphs can be easier to understand and interpret when they are linked to images. We hope that this project helps people get a better feeling for what graphs mean and how to use them.<br><br><u>Stream flow estimation</u>: Extreme flows, floods and droughts, are likely to get more common. Even in small streams, floods and droughts have dramatic ecological and societal impacts, but we are not too good at predicting flow in small streams. This is because most USGS gages that measure stream flow are in big rivers and it is hard to translate big river flows to small streams. <br> This project is a proof of concept test to explore if we can use images of a small stream to estimate flow. Once we have enough data (year-round images and stream flow estimates from a nearby gage), we will use ‘machine learning’ approaches to train the computer to extract flow estimates from the images.";