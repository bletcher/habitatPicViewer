# this file is run every Sunday using crontab with this command:
# edit the file by poing into putty and running 'crontab -e'
# 0 0 * * 0 cd /home/ben/webApps/habitatPicViewer/ && Rscript sawmill/R/getEnvData.R > /home/ben/webApps/habitatPicViewer-getEnvData.log 2>&1

library(httr)
library(dplyr)
library(zoo)

#############################
# Temperature and precip

# function from Jordan Read
nldas2_primary_forcing_rods <- function(lon, lat, start=as.POSIXct('1979-01-02', tz='UTC'), stop=as.POSIXct('2017-01-01', tz='UTC')){
  
  if(length(lon) != 1 || length(lat) != 1){
    stop('Lat and Lon must both be length of 1')
  }
  
  if(start < as.POSIXct('1979-01-02', tz='UTC') || start > as.POSIXct(Sys.Date())){
    stop('Start date must be between 1979-01-02 and now')
  }
  
  if(stop < as.POSIXct('1979-01-02', tz='UTC') || stop > as.POSIXct(Sys.Date())){
    stop('Stop date must be between 1979-01-02 and now')
  }
  
  pf_vars = c('APCPsfc', 'DLWRFsfc', 'DSWRFsfc', 'PEVAPsfc', 'SPFH2m', 'TMP2m', 'UGRD10m', 'VGRD10m')
  
  
  url_pattern = paste0('https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/timeseries.cgi?',
                       'variable=NLDAS:NLDAS_FORA0125_H.002:%s&location=GEOM:POINT(%g,%%20%g)&startDate=%s&endDate=%s&type=asc2')
  
  
  dl_parse = function(var){
    durl = sprintf(url_pattern, var, lon, lat, format(start, '%Y-%m-%dT%H'), format(stop, '%Y-%m-%dT%H'))
    r = RETRY('GET', durl)
    d = read.table(text=content(r, 'text'), skip=40, header=TRUE, fill=TRUE)
    names(d) = c('datetime', 'hour', var)
    d$datetime = as.POSIXct(strptime(paste0(d$datetime, 'T', d$hour), '%Y-%m-%dT%H', tz='UTC'))
    d$hour = NULL
    return(d)
  }
  
  d_list = lapply(pf_vars, dl_parse)
  
  pf_data = Reduce(function(...){merge(..., by='datetime')}, d_list)
  return(pf_data)
}

###########################################
# get temp and precip data form nldas

startDate = '2016-12-18'
  
allTandPData <- nldas2_primary_forcing_rods(-72.53, 42.54, as.POSIXct(startDate, tz = 'UTC'), as.POSIXct(Sys.Date() - 5, tz = 'UTC')) # get error if use < '-5'
  
TandPData <- allTandPData %>%
  mutate( dates = as.Date(datetime) ) %>%
  filter(APCPsfc < 1000) %>%
  group_by(dates) %>%
  summarize( meanT = mean(TMP2m - 273.15), 
             meanP = mean(APCPsfc) 
             #maxDateTime = max(datetime)
             )

#####################
# Get flow data

library(waterData)

# gage = '01174565'; // swift river - issues with backwater
gage = '01169900' # // south river, conway

flowData <- importDVs(gage, code = "00060", stat = "00003", sdate = startDate)
flowData <- rename(flowData, flow = val )

#####################
# merge data

dMin <- min(c(flowData$dates,TandPData$dates))
dMax <- max(c(flowData$dates,TandPData$dates))

daySeq <- data.frame(dates = seq(dMin, dMax, by = 'days'))

envData <- daySeq %>% left_join( flowData ) %>% left_join( TandPData )

envData$datePlus1 <- envData$dates + 1
########################################
# interpolate missing flow data
# there are a few days with missing data

envData$flowApprox <- ifelse(is.na(envData$flow),1,0)
envData$flow = na.approx(envData$flow)
#envData[ is.na(envData) ] <- "null" # for javascript
#####################
# save data

save(envData, file = "sawmill/R/envData.RData")
write.csv(envData, file = "sawmill/data/envData.csv")
