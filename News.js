// JavaScript Document

var objCities = {};
var objSources = {};

window.onload = function() {
	UpdateDateCard();
	setInterval(function(){ShowTheTime();}, 10000);
	getFileFromServer("http://messystudio.com/Chrome/Headlines/Cities.json", function(sTxtCities) {
    if (sTxtCities === null) { // error
    }
    else {
			objCities = JSON.parse(sTxtCities);
			MakeCitySelector();
			LoadSettings();
			ShowMostRecent.nCount = 10;
			ShowMostRecent.sNowShowing = "Recent";
			getFileFromServer("http://messystudio.com/Chrome/Headlines/Feeds.json", function(sTxtSrcs) {
    		if (sTxtSrcs === null) { // error
				}
				else {
					objSources = JSON.parse(sTxtSrcs);
					objSources.News[0].URL = "http://weather.yahooapis.com/forecastrss?w=" + SaveSettings.City;
					FeedMe();
					RefreshHeadlines.TimerID = setInterval(function(){FeedMe();}, 60000*SaveSettings.RefreshRate);
				}
			});
    }
	});
};

function FeedIt(nEntry, sURL) {
	document.getElementById('NewsRow').style.backgroundColor = 'Pink';
    var feed = new google.feeds.Feed(sURL);
    feed.setNumEntries(10);
    feed.load(function(result) {
        if (!result.error) {
            objSources.News[nEntry].Entry = [];
            if (!objSources.News[nEntry].Name)
                objSources.News[nEntry].Name = result.feed.title;
            for (var i = 0; i < result.feed.entries.length; i++) {
                var entry = result.feed.entries[i];
								objSources.News[nEntry].Entry[i] = {};
                objSources.News[nEntry].Entry[i].Title = entry.title;
                objSources.News[nEntry].Entry[i].Link = entry.link;
                objSources.News[nEntry].Entry[i].Snippet = entry.contentSnippet;
                objSources.News[nEntry].Entry[i].Content = entry.content;
                objSources.News[nEntry].Entry[i].PubDate = new Date(entry.publishedDate).valueOf();
            }
					FeedIt.nFeedReturnCount++;
					if ("Weather" === ShowMostRecent.sNowShowing)
						ShowWeatherDetail();
					else if (FeedIt.nFeedReturnCount === objSources.News.length && "Recent" === ShowMostRecent.sNowShowing) {
						ShowMostRecent(ShowMostRecent.nCount, ShowMostRecent.sType);
						document.getElementById('NewsRow').style.backgroundColor = '#E0E0E0';
						// if ('vibrate' in navigator) navigator.vibrate(200);
					}
					if (0 === nEntry)
						ShowWeather();
        }
    });
}

function FeedMe() {
	FeedIt.nFeedReturnCount = 0;
    for (var i = 0; i < objSources.News.length; i++) {
        FeedIt(i, objSources.News[i].URL);
    }
    document.getElementById('RefreshTime').innerHTML = ' as of ' + new Date().toLocaleTimeString();
    UpdateDateCard();
}

function ShowWeather() {
	var nEnd = objSources.News[0].Entry[0].Content.search('Full Forecast');
	var sWeather = objSources.News[0].Entry[0].Content.substr(0, nEnd);
	var aWeather = sWeather.split('\n');
	aWeather[2] = aWeather[2].substr(0, aWeather[2].length - 6);
	var nHigh = aWeather[4].search('High');
	var sHigh = aWeather[4].substr(nHigh+6, 3).trim();
	var nLow = aWeather[4].search('Low');
	var sLow = aWeather[4].substr(nLow+4, 3).trim();
	document.getElementById('SidebarWeather').innerHTML = "<div style='margin-right: auto; margin-left: auto; max-width: 250px;'><div style='float: right;'><a href='javascript:ShowWeatherDetail()' title='"+objSources.News[0].Entry[0].Title+"'>" + aWeather[0] + "</a></div>" + aWeather[2]  + "&deg;<br><b>" + sHigh + "&deg;</b>&nbsp;&nbsp;" + sLow + "&deg; </div>";
	document.getElementById('SidebarWeather').style.display = 'block';
}

function ShowWeatherDetail() {
	ShowMostRecent.sNowShowing = "Weather";
	ShowWeatherDetail.City = FindCityFromCode(document.getElementById('CityCode').value);
	var nEnd = objSources.News[0].Entry[0].Content.search('Full Forecast');
  var sWeather = objSources.News[0].Entry[0].Content.substr(0, nEnd);
  var sCard = "<div class='Card'>";
	if (ShowWeatherDetail.City)
    sCard += "<b>Weather - "+ShowWeatherDetail.City+"</b><br>";
	sCard += objSources.News[0].Entry[0].Title+"<br><br>";
  sCard += sWeather;
	sCard += "<br><a href='javascript:ShowMostRecent(10, ShowMostRecent.sType)'>Back to news (" + ShowMostRecent.sType + ")</a>";
  sCard += "</div>";
  document.getElementById('NewsRow').innerHTML = sCard;
  document.getElementById('MostRecent').innerHTML = "";
}

function FindCityFromCode(sCode) {
	for (var i = 0; i < objCities.Cities.length; i++) {
			if (objCities.Cities[i].Code === sCode)
			 return objCities.Cities[i].City;
	}
}

function RefreshHeadlines() {
	clearInterval(RefreshHeadlines.TimerID);
	FeedMe();
	RefreshHeadlines.TimerID = setInterval(function(){FeedMe();}, 60000*SaveSettings.RefreshRate);
}

function ShowSource(sName) {
	ShowMostRecent.sNowShowing = "Sources";
    var sText = '';
    sText += "<div id='" + i + "' class='Card'>";
    for (var i = 0; i < objSources.News.length; i++) {
        if (objSources.News[i].Name === sName) {
            sText += "<b>" + objSources.News[i].Name + "</b><br><br>";
            for (var j = 0; j < objSources.News[i].Entry.length; j++) {
                sText += "<a href='javascript:ShowMore(\"" + i + "_" + j + "\")' id='" + i + "^" + j + "'>+</a> <a href='" + objSources.News[i].Entry[j].Link + "' target='_blank' title='" + objSources.News[i].Entry[j].Snippet + "'>" + objSources.News[i].Entry[j].Title + '</a><br>';
                sText += "<span id='" + i + "_" + j + "' onclick='ShowMore(\"" + i + "_" + j + "\")' style='display: none; margin-left: 15px; margin-right: 15px;'><i>" + objSources.News[i].Entry[j].Snippet + "</i></span><br>";
            }
            sText += "</div>";
            document.getElementById('NewsRow').innerHTML = sText;
        }
    }
}

function ShowMostRecent(nEntries, sType) {
	ShowMostRecent.sNowShowing = "Recent";
  ShowMostRecent.sType = sType;
  ShowMostRecent.nCount = nEntries;
	var aDates = [];
  var nLastDate = 0;
  var nCounter = 0;
  for (var i = 0; i < objSources.News.length; i++) {
    if (-1 !== objSources.News[i].Type.search(sType)) {
       for (var j = 0; j < objSources.News[i].Entry.length; j++) {
         if (objSources.News[i].Entry[j].PubDate && objSources.News[i].Entry[j].PubDate < new Date().valueOf()) {
           aDates[nCounter++] = objSources.News[i].Entry[j].PubDate;
         }
       }
      }
    }
  aDates.sort();
  aDates.reverse();
  aDates = aDates.filter(function(elem, pos) {
    return aDates.indexOf(elem) == pos;
  });
  var sText = '';
  var nActualCount = 0;
    for (var k = 0; k < nEntries - 1; k++) {
        for (i = 0; i < objSources.News.length; i++) {
            for (var j = 0; j < objSources.News[i].Entry.length; j++) {
                if (aDates[k] === objSources.News[i].Entry[j].PubDate) {
                    if (-1 !== objSources.News[i].Type.search(sType)) {
                        sText += "<a href='javascript:ShowMore(\"" + i + "_" + j + "\")' id='" + i + "^" + j + "'>+</a> <a href='" + objSources.News[i].Entry[j].Link + "' target='_blank' title='" + objSources.News[i].Entry[j].Snippet + "'>" + objSources.News[i].Entry[j].Title + '</a> (<a href="javascript:ShowSource(\'' + objSources.News[i].Name + '\')">' + objSources.News[i].Name + '</a>)<br>';
                        sText += "<span id='" + i + "_" + j + "' onclick='ShowMore(\"" + i + "_" + j + "\")' style='display: none; margin-left: 20px; margin-right: 20px;'> </span><br>";
                        nActualCount++;
                    }
                }
            }
        }
    }
    var sCard = "<div class='Card'><a href='javascript:RefreshHeadlines()'><img src='/Chrome/Headlines/Images/RefreshI16.png' align='right'/></a>";
    sCard += "<b>" + nActualCount + " <a href='javascript:ShowMostRecent(10, ShowMostRecent.sType)'>Most Recent</a> - <a href='javascript:AdvanceNewsSection()'>" + sType + "</a></b><br><br>";
    sCard += sText;
    sCard += "</div>";
    document.getElementById('NewsRow').innerHTML = sCard;
    document.getElementById('MostRecent').innerHTML = "<a href='javascript:ShowHeadlineCards(\""+sType+"\")'>"+sType+" by source</a>";
	SaveSettings();
}

function ShowHeadlineCards(sType) {
	ShowMostRecent.sNowShowing = "Sources";
    var sText = '';
    document.getElementById('NewsRow').innerHTML = "<div class='Card'>Loading...</div>";
    for (var i = 0; i < objSources.News.length; i++) {
        if (-1 !== objSources.News[i].Type.search(sType)) {
            sText += "<div id='" + i + "' class='Card'>";
            sText += "<b>" + objSources.News[i].Name + "</b><br><br>";
            for (var j = 0; j < objSources.News[i].Entry.length; j++) {
                sText += "<a href='javascript:ShowMore(\"" + i + "_" + j + "\")' id='" + i + "^" + j + "'>+</a> <a href='" + objSources.News[i].Entry[j].Link + "' target='_blank' title='" + objSources.News[i].Entry[j].Snippet + "'>" + objSources.News[i].Entry[j].Title + '</a><br>';
                sText += "<span id='" + i + "_" + j + "' onclick='ShowMore(\"" + i + "_" + j + "\")' style='display: none; margin-left: 20px; margin-right: 20px;'><i>" + objSources.News[i].Entry[j].Snippet + "</i></span><br>";
            }
            sText += "</div>";
        }
        document.getElementById('NewsRow').innerHTML = sText;
    }
    document.getElementById('MostRecent').innerHTML = "";
}

function ShowMore(sID) {
	var sPlusID = sID.replace('_', '^');
	if (document.getElementById(sID).style.display === 'none') {
		var aID = sID.split('_');
		var sImgLink = GetImageLink(objSources.News[aID[0]].Entry[aID[1]].Content);
		var sImage = "";
		if (sImgLink) sImage = "<a href='"+sImgLink+"' target='_blank'><img src='"+sImgLink+"' style='max-height: 100px; max-width: 200px;' align='right'></a>";
		document.getElementById(sID).innerHTML = sImage + objSources.News[aID[0]].Entry[aID[1]].Content.replace(/(<([^>]+)>)/ig,"");
		document.getElementById(sPlusID).innerHTML = '-';
    document.getElementById(sID).style.display = 'block';
	}
	else {
		document.getElementById(sPlusID).innerHTML = '+';
    document.getElementById(sID).style.display = 'none';
	}
}

function GetImageLink(sContent) {
	var nImgPos = sContent.search("<img");
	if (!nImgPos) return null;
	var sImgContent = sContent.substr(nImgPos);
	var nSrcPos = sImgContent.search("src=");
	if (!nSrcPos) return null;
	var sSrcContent = sImgContent.substr(nSrcPos);
	var nOpenQuotePos = sSrcContent.indexOf('"');
	var nCloseQuotePos = sSrcContent.indexOf('"', nOpenQuotePos+1);
	var sImgLink = sSrcContent.substr(nOpenQuotePos+1, nCloseQuotePos-nOpenQuotePos-1);
	return sImgLink;
}

// Persistent Settings

function ShowSettings() {
	if (document.getElementById('Settings').style.display === 'none') {
		document.getElementById('Settings').style.display = 'block';
	}
	else {
		document.getElementById('Settings').style.display = 'none';
	}
}

function ShowNewsTypes() {
	if (document.getElementById('NewsTypes').style.display === 'none') {
		document.getElementById('NewsTypes').style.display = 'block';
	}
	else {
		document.getElementById('NewsTypes').style.display = 'none';
		document.getElementById('Settings').style.display = 'none';
	}
	SaveSettings.NewsTypeShowing = document.getElementById('NewsTypes').style.display;
	SaveSettings();
}

function RefreshRateChange() {
	SaveSettings.RefreshRate = document.getElementById('RefreshRate').value;
	clearInterval(RefreshHeadlines.TimerID);
	RefreshHeadlines.TimerID = setInterval(function(){FeedMe();}, 60000*SaveSettings.RefreshRate);
	SaveSettings();
}

function CityCodeChange() {
	SaveSettings.City = document.getElementById('CityCode').value;
	document.getElementById('CityWOEID').value = SaveSettings.City;
	objSources.News[0].URL = "http://weather.yahooapis.com/forecastrss?w=" + SaveSettings.City;
	FeedIt(0, objSources.News[0].URL);
	document.getElementById('NewsRow').style.backgroundColor = '#E0E0E0';
	SaveSettings();
}

function CityWOEIDUpdate() {
	document.getElementById('CityCode').value = document.getElementById('CityWOEID').value;
	SaveSettings.City = document.getElementById('CityWOEID').value;
	objSources.News[0].URL = "http://weather.yahooapis.com/forecastrss?w=" + SaveSettings.City;
	FeedIt(0, objSources.News[0].URL);
	document.getElementById('NewsRow').style.backgroundColor = '#E0E0E0';
	SaveSettings();
}

function AdvanceNewsSection() {
	var aSections = Array("All", "Top Headlines", "Tech", "Android", "Chrome", "Business", "Science", "News Magazines", "Sports", "NBA", "MLB", "Life", "Entertainment");
	if (!AdvanceNewsSection.nSec)
		AdvanceNewsSection.nSec = 1;
	else if (AdvanceNewsSection.nSec === aSections.length)
		AdvanceNewsSection.nSec = 0;
	AdvanceNewsSection.nSec++;
	ShowMostRecent(100, aSections[AdvanceNewsSection.nSec-1]);
}

function SaveSettings() {
	var objSettings = {};
	objSettings.RefreshRate = SaveSettings.RefreshRate;
	objSettings.City = SaveSettings.City;
	objSettings.NewsTypeShowing = SaveSettings.NewsTypeShowing;
	objSettings.sType = ShowMostRecent.sType;
	var sSettings = JSON.stringify(objSettings);
	setCookie('Settings', sSettings, 900);
}

function LoadSettings() {
	var sSettings = getCookie('Settings');
	if (sSettings) {
	  var objSettings = JSON.parse(sSettings);
	  SaveSettings.RefreshRate = objSettings.RefreshRate;
	  SaveSettings.City = objSettings.City;
		SaveSettings.NewsTypeShowing = objSettings.NewsTypeShowing;
		ShowMostRecent.sType = objSettings.sType;
	}
	else {
		SaveSettings.RefreshRate = 10;
		SaveSettings.City = '2363796';
		SaveSettings.NewsTypeShowing = 'none';
		ShowMostRecent.sType = 'All';
	}
	document.getElementById('RefreshRate').value = SaveSettings.RefreshRate;
	document.getElementById('CityCode').value = SaveSettings.City;
	document.getElementById('CityWOEID').value = SaveSettings.City;
	document.getElementById('NewsTypes').style.display = SaveSettings.NewsTypeShowing;
}

function setCookie(c_name, value, exdays) {
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays===null) ? '' : '; expires='+exdate.toUTCString());
  document.cookie=c_name + '=' + c_value;
}

function getCookie(c_name) {
  var i,x,y,ARRcookies = document.cookie.split(';');
  for (i=0;i<ARRcookies.length;i++)
  {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf('='));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf('=')+1);
    x=x.replace(/^\s+|\s+$/g,'');
    if (x===c_name)
			return unescape(y);
  }
}

function UpdateDateCard() {
	var d = new Date();
	var nDay = d.getDay();
	var sD = DayNumToText(nDay);
  var n = d.getMonth();
	var sBG = '#f1f1f1';
  var sM = MonthNumToText(n);
	if (0 === nDay || 6 === nDay) sBG = '#E6E6FA';
	else sBG = '#F6F0BA';
	var sDisplay = "<div style='float: right; width: 32px;'><a href='javascript:ShowNewsTypes()'><img src='/Chrome/Headlines/Images/NewsI32.png' style=''/></a></div>";
	sDisplay += "<div style='background-color: " + sBG + "; width: 100%; margin-top: 10px; border-radius: 5px;'>";
	sDisplay += "<div style='font-size: 410%; float: left; margin-top: 11px; padding-right: 5px; color: #A1A1A1;'>" + d.getDate() + " </div>";
	sDisplay += "<div style='margin-top: -10px; text-align: left;'><div style='font-size: 150%;'>" + sD + "</div><div style='font-size: 75%; margin-top: -7px;'> " + sM + " " + d.getFullYear()+ "</div>";
	sDisplay += "<div id='TheTime' style='font-size: 75%; margin-top: -11px;'></div></div>";
	sDisplay += "</div>";
	document.getElementById('DateCard').innerHTML = sDisplay;
	ShowTheTime();
	// document.getElementById('DateCard').innerHTML = "<a href='javascript:ShowMostRecent(10, ShowMostRecent.sType)'>" + sD + ", " + sM + " " + d.getDate() + ", " + d.getFullYear() + "</a>";
}

function ShowTheTime() {
	var d = new Date();
	var h = d.getHours();
	var m = (h>11) ? 'PM' : 'AM';
	if (h>12)
		h = h - 12;
	else if (h===0) // midnight
		h = 12;
	document.getElementById('TheTime').innerHTML = NumToText(h, 'H') + " " + NumToText(d.getMinutes(), 'M') + " " + m;
}


function DayNumToText(nNum) {
	if (nNum > 6) nNum = 0;
  var DayText = new Array ("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
  return DayText[nNum];
}

function MonthNumToText(nNum) {
	if (nNum > 11) nNum = 0;
  var MonthText = new Array ("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
  return MonthText[nNum];
}

function NumToText(nNum, sHM) {
  var aNumText = new Array ("Oh", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", 
														"Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", 
														"Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty", "Thirty", "Forty",
													 "Fifty");
  if (nNum > 0 && nNum < 21 && sHM === 'H') return aNumText[nNum];
	else if (nNum === 0 && sHM === 'M') return "";
	else if (nNum < 10 && sHM === 'M') return aNumText[0] + ' ' + aNumText[nNum];
	else if (nNum < 21 && sHM === 'M') return aNumText[nNum];
	else if (nNum === 30) return aNumText[21];
	else if (nNum === 40) return aNumText[22];
	else if (nNum === 50) return aNumText[23];
	else if (nNum > 20 && nNum < 30) return aNumText[20] + "-" + aNumText[nNum-20];
	else if (nNum > 30 && nNum < 40) return aNumText[21] + "-" + aNumText[nNum-30];
	else if (nNum > 40 && nNum < 50) return aNumText[22] + "-" + aNumText[nNum-40];
	else if (nNum > 50 && nNum < 60) return aNumText[23] + "-" + aNumText[nNum-50];
	else return "";
}

function MakeCitySelector() {
 var sCitySelector = "City: <select id='CityCode' onChange='CityCodeChange()'>";
 for (var i = 0; i < objCities.Cities.length; i++) {
  sCitySelector += "<option value='" + objCities.Cities[i].Code + "'>" + objCities.Cities[i].City + "</option>";
 }
 sCitySelector += "</select>";
 document.getElementById('CitySelector').innerHTML = sCitySelector;
}

function getFileFromServer(url, doneCallback) {
	var xhr;
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = handleStateChange;
	xhr.open("GET", url, true);
	xhr.send();

	function handleStateChange() {
		if (xhr.readyState === 4) {
			doneCallback(xhr.status == 200 ? xhr.responseText : null);
		}
	}
}

/*
getFileFromServer("/home8/mulholl3/public_html/silentpholdings/Cities.js, function(text) {
    if (text === null) {
        // An error occurred
    }
    else {
        // `text` is the file text
    }
}); */

// Not using
/*
function IsBrowserMobile() {
	if( /Android|AppleWebKit|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
		return false;
	else
		return true;
}

// Changes XML to JSON
function xmlToJson(xml) {
    // Create the return object
    var obj = {};
    if (xml.nodeType == 1) { // element
        // do attributes 
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }
    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}
*/
