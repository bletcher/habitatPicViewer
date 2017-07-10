function setToNull(d) { return d == 'NA' ? null : +d; }

function typeEnvData(d){
  //d.date2 = strToDate(d.dates.slice(0,10));//Date.parse(d.date);
  d.date = strToDate(d.datePlus1);//date in the R file is shifted by 1 day (midnight)
  d.temp = setToNull(d.meanT);  
  d.prcp = setToNull(d.meanP);
  d.flow = setToNull(d.flow);
  d.flowApprox = setToNull(d.flowApprox);
  d.meanTemp = setToNull(d.meanAvgTemp);
  
  return d;
}


d3.queue()
  .defer(d3.csv, "/sawmill/data/envData.csv", typeEnvData)
  .await(analyze);

function analyze(error, env) {
  if(error) { console.log(error); }

  console.log("env", env);
  state.env = env;
}


