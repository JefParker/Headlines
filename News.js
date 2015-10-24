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
	document.getElementById('StatusCard').style.display = 'block';
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
					var sPercent=Math.round((FeedIt.nFeedReturnCount*100)/objSources.News.length);
					document.getElementById("InnerBar").style.width = sPercent + '%';
					document.getElementById('StatusCount').innerHTML = 'Loading ' + sPercent + '%';
					if ("Weather" === ShowMostRecent.sNowShowing)
						ShowWeatherDetail();
					else if (FeedIt.nFeedReturnCount === objSources.News.length && "Recent" === ShowMostRecent.sNowShowing) {
						ShowMostRecent(ShowMostRecent.nCount, ShowMostRecent.sType);
						document.getElementById('NewsRow').style.backgroundColor = '#E0E0E0';
						document.getElementById('StatusCard').style.display = 'none';
						document.getElementById("InnerBar").style.width = '0%';
						document.getElementById('StatusCount').innerHTML = 'Loading 0%';
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
	var sTVColumn = "<div style='float: left;'><a href='javascript:ClickCBSNews()' title='CBS News'><img src='/Chrome/Headlines/Images/TV15.png' align='right'></a>";
	sTVColumn += "<a href='javascript:ClickBloomberg()' title='Bloomberg News'><img src='/Chrome/Headlines/Images/TV15.png' align='right'></a>";
	sTVColumn += "</div>";
	document.getElementById('SidebarWeather').innerHTML = "<div style='margin-right: auto; margin-left: auto; max-width: 250px;'><div style='float: right;'><a href='javascript:ShowWeatherDetail()' title='"+objSources.News[0].Entry[0].Title+"'>" + aWeather[0] + "</a></div>" + aWeather[2]  + "&deg;<br><b>" + sHigh + "&deg;</b>&nbsp;&nbsp;" + sLow + "&deg; "+sTVColumn+"</div>";
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
						sText += "<br><a href='javascript:ShowMostRecent(10, ShowMostRecent.sType)'>Back to news (" + ShowMostRecent.sType + ")</a>";
            sText += "</div>";
            document.getElementById('NewsRow').innerHTML = sText;
        }
    }
}

function ShowMostRecent(nEntries, sType) {
	ShowMostRecent.sNowShowing = "Recent";
  ShowMostRecent.sType = sType;
	//nEntries = (10 === nEntries) ? 100 : 10;
  ShowMostRecent.nCount = nEntries;
	var aDates = [];
  var nLastDate = 0;
  var nCounter = 0;
	var aMatches = [];
	for (var i = 0; i < objSources.News.length; i++) {
		if (-1 !== objSources.News[i].Type.search(sType)) {
			for (var j = 0; j < objSources.News[i].Entry.length; j++) {
				if (-1 !== objSources.News[i].Type.search(sType) && objSources.News[i].Entry[j].PubDate && objSources.News[i].Entry[j].PubDate < new Date().valueOf()) {
						objSources.News[i].Entry[j].i = i;
						objSources.News[i].Entry[j].j = j;
						aMatches[nCounter] = objSources.News[i].Entry[j];
						aDates[nCounter++] = objSources.News[i].Entry[j].PubDate;
				}
			}
		}
	}
	aMatches.sort(sort_most_recent);
  aDates.sort();
	var aSortedDates = aDates;
  /*aDates.reverse();
  aDates = aDates.filter(function(elem, pos) {
    return aDates.indexOf(elem) == pos;
  }); */
  var sText = '';
  var nActualCount = 0;
	
	var nOutput = nCounter < nEntries ? nCounter : nEntries;
	
	for (var n=0; n < nOutput; n++) {
		var sColor = (objSources.News[aMatches[n].i].Color) ? objSources.News[aMatches[n].i].Color : "#555555";
		sText += "<a href='javascript:ShowMore(\"" + aMatches[n].i + "_" + aMatches[n].j + "\")' id='" + aMatches[n].i + "^" + aMatches[n].j + "'>+</a> ";
		sText += "<a href='" + aMatches[n].Link + "' target='_blank' ";
		sText += "style='color: " + sColor + ";' title='" + aMatches[n].Snippet + "'>" + aMatches[n].Title + '</a> (<a href="javascript:ShowSource(\'' + objSources.News[aMatches[n].i].Name + '\')">' + objSources.News[aMatches[n].i].Name + '</a>)<br>';
		sText += "<span id='" + aMatches[n].i + "_" + aMatches[n].j + "' onclick='ShowMore(\"" + aMatches[n].i + "_" + aMatches[n].j + "\")' style='display: none; margin-left: 20px; margin-right: 20px;'> </span><br>";
		nActualCount++;
	}
    /*for (var k = 0; k < nEntries - 1; k++) {
        for (i = 0; i < objSources.News.length; i++) {
            for (var j = 0; j < objSources.News[i].Entry.length; j++) {
                if (aDates[k] === objSources.News[i].Entry[j].PubDate) {
                    if (-1 !== objSources.News[i].Type.search(sType)) {
											var sColor = (objSources.News[i].Color) ? objSources.News[i].Color : "#555555";
                        sText += "<a href='javascript:ShowMore(\"" + i + "_" + j + "\")' id='" + i + "^" + j + "'>+</a> ";
												sText += "<a href='" + objSources.News[i].Entry[j].Link + "' target='_blank' ";
												sText += "style='color: " + sColor + ";' title='" + objSources.News[i].Entry[j].Snippet + "'>" + objSources.News[i].Entry[j].Title + '</a> (<a href="javascript:ShowSource(\'' + objSources.News[i].Name + '\')">' + objSources.News[i].Name + '</a>)<br>';
                        sText += "<span id='" + i + "_" + j + "' onclick='ShowMore(\"" + i + "_" + j + "\")' style='display: none; margin-left: 20px; margin-right: 20px;'> </span><br>";
                        nActualCount++;
                    }
                }
            }
        }
    }*/
    var sCard = "<div class='Card'><a href='javascript:RefreshHeadlines()'><img src='/Chrome/Headlines/Images/RefreshI16.png' align='right'/></a>";
    sCard += "<b><a href='javascript:ShowMostRecent(10, ShowMostRecent.sType)'>" + nActualCount + "</a> <a href='javascript:ShowMostRecent(100, ShowMostRecent.sType)'>Most Recent</a> - <a href='javascript:AdvanceNewsSection()'>" + sType + "</a></b><br><br>";
    sCard += sText;
    sCard += "</div>";
    document.getElementById('NewsRow').innerHTML = sCard;
    document.getElementById('MostRecent').innerHTML = "<a href='javascript:ShowHeadlineCards(\""+sType+"\")'>"+sType+" by source</a>";
	SaveSettings();
	SearchForNewBreakingNews(aSortedDates);
}

var sort_most_recent = function (a, b) {
	return b.PubDate-a.PubDate;
};

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

// Breaking News Notifications
function ShowBreakingNews() {
	if (document.getElementById('BreakingNewsNotifications').checked) {
		SaveSettings.bShowBreakingNotif = true;
		BreakingNewsNotificationNow ('Headlines', 'Breaking news will now appear here');
		document.getElementById('BreakingAudioCheckbox').style.display = 'block';
	}
	else {
		document.getElementById('BreakingAudioCheckbox').style.display = 'none';
		document.getElementById('BreakingNewsAudio').checked = false;
		SaveSettings.bShowBreakingNotif = false;
	}
	SaveSettings();
}

function SetBreakingNewsAudio () {
	if (document.getElementById('BreakingNewsAudio').checked) {
		SaveSettings.bBreakingAudio = true;
		LoadSettings.Boop.play();
	}
	else
		SaveSettings.bBreakingAudio = false;
	SaveSettings();
}

function BreakingNewsNotificationNow (sTitle, sBody) {
	if(! ('Notification' in window) ){
		// alert('Web Notification is not supported');
		return;
	}
	Notification.requestPermission(function(permission){
		var notification = new Notification(sTitle, {body:sBody, icon:'/Chrome/Headlines/Images/NewsI96.png', dir:'auto'});
		setTimeout(function(){
		notification.close();
		},9000);
	});
}

function SearchForNewBreakingNews(aSortedDates) {
	if (!SaveSettings.bShowBreakingNotif)
		return;
	if (!BreakingNewsNotificationNow.LastDate)
		BreakingNewsNotificationNow.LastDate = 1;
	for (var k = 0; k < aSortedDates.length; k++) {
		for (var i = 0; i < objSources.News.length; i++) {
			for (var j = 0; j < objSources.News[i].Entry.length; j++) {
				if (aSortedDates[k] === objSources.News[i].Entry[j].PubDate) {
					if ('red' === objSources.News[i].Color && objSources.News[i].Entry[j].PubDate > BreakingNewsNotificationNow.LastShown) {
						BreakingNewsNotificationNow (objSources.News[i].Name, objSources.News[i].Entry[j].Snippet);
						if (BreakingNewsNotificationNow.LastDate < objSources.News[i].Entry[j].PubDate)
							BreakingNewsNotificationNow.LastDate = objSources.News[i].Entry[j].PubDate;
						if (SaveSettings.bBreakingAudio)
							LoadSettings.Boop.play();
					}
				}
			}
		}
	}
	BreakingNewsNotificationNow.LastShown = BreakingNewsNotificationNow.LastDate;
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
	var aSections = Array("All", "Top Headlines", "Tech", "Linux", "Mobile", "Chrome", "Business", "Science", "News Magazines", "Sports", "NBA", "MLB", "Life", "Entertainment");
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
	objSettings.ShowBreakingNotif = (SaveSettings.bShowBreakingNotif) ? 'true' : 'false';
	objSettings.BreakingAudio = (SaveSettings.bBreakingAudio) ? 'true' : 'false';
	objSettings.CBSNewsX = ClickCBSNews.x;
	objSettings.screenX = window.screenX;
	objSettings.outerHeight = window.outerHeight;
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
		SaveSettings.bShowBreakingNotif = ('true' === objSettings.ShowBreakingNotif) ? true : false;
		SaveSettings.bBreakingAudio = ('true' === objSettings.BreakingAudio) ? true : false;
		ClickCBSNews.x = objSettings.CBSNewsX;
		SaveSettings.screenX = objSettings.screenX;
		SaveSettings.outerHeight = objSettings.outerHeight;
		ClickCBSNews.x = SaveSettings.screenX - 430;
		if (ClickCBSNews.x < 0)
			ClickCBSNews.x = SaveSettings.screenX + 340;
		ClickBloomberg.x = SaveSettings.screenX - 660;
		if (ClickBloomberg.x < 0)
			ClickBloomberg.x = SaveSettings.screenX + 340;
	}
	else {
		SaveSettings.RefreshRate = 10;
		SaveSettings.City = '2363796';
		SaveSettings.NewsTypeShowing = 'none';
		ShowMostRecent.sType = 'All';
		SaveSettings.bShowBreakingNotif = true;
		SaveSettings.bBreakingAudio = true;
		SaveSettings.screenX = screen.width - 320;
		SaveSettings.outerHeight = screen.height - 50;
		ClickCBSNews.x = 400;
		ClickBloomberg.x = 400;
	}
	window.moveTo(SaveSettings.screenX, 40);
	window.resizeTo(320, SaveSettings.outerHeight);
	document.getElementById('RefreshRate').value = SaveSettings.RefreshRate;
	document.getElementById('CityCode').value = SaveSettings.City;
	document.getElementById('CityWOEID').value = SaveSettings.City;
	document.getElementById('NewsTypes').style.display = SaveSettings.NewsTypeShowing;
	document.getElementById('BreakingNewsNotifications').checked = SaveSettings.bShowBreakingNotif;
	document.getElementById('BreakingNewsAudio').checked = SaveSettings.bBreakingAudio;
	if (SaveSettings.bShowBreakingNotif)
		document.getElementById('BreakingAudioCheckbox').style.display = 'block';
	BreakingNewsNotificationNow.LastShown = 0;
	LoadSettings.Boop = new Audio('http://messystudio.com/Chrome/Headlines/Audio/Boop.mp3');
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
	var sDisplay = "<div style='float: right; width: 32px;'><a href='javascript:ShowNewsTypes()'><img src='/Chrome/Headlines/Images/NewsI32.png' style=''/></a><a href='javascript:ClickSearch()'><img src='/Chrome/Headlines/Images/Search.png' style='width: 18px;'/></a></div>";
	sDisplay += "<div style='background-color: " + sBG + "; width: 100%; margin-top: 10px; border-radius: 5px;'>";
	sDisplay += "<div style='font-size: 410%; float: left; margin-top: 11px; padding-right: 5px; color: #A1A1A1;' OnClick='ClickSearch()'>" + d.getDate() + " </div>";
	sDisplay += "<div style='margin-top: -10px; text-align: left;'><div style='font-size: 150%;' OnClick='ClickSearch()'>" + sD + "</div><div style='font-size: 75%; margin-top: -7px;'> " + sM + " " + d.getFullYear()+ "</div>";
	sDisplay += "<div id='TheTime' style='font-size: 75%; margin-top: -11px;'></div></div>";
	sDisplay += "</div>";
	document.getElementById('DateCard').innerHTML = sDisplay;
	ShowTheTime();
}

function ClickCBSNews() {
	if (!ClickCBSNews.bShowing) {
		if (ClickBloomberg.bShowing) {
			ClickBloomberg.Bloomberg.close();
			ClickBloomberg.bShowing = false;
		}
		ClickCBSNews.CBSNews = window.open ('http://cbsn.cbsnews.com/compact/', 'CBS News', config='height=269, width=420, top=40, left=' + ClickCBSNews.x + ', toolbar=no, menubar=no, scrollbars=no, resizable=no, directories=no, status=no');
		ClickCBSNews.bShowing = true;
	}
	else {
		// ClickCBSNews.x = ClickCBSNews.CBSNews.screenX;
		ClickCBSNews.CBSNews.close();
		ClickCBSNews.bShowing = false;
		SaveSettings();
	}
}

function ClickBloomberg() {
	if (!ClickBloomberg.bShowing) {
		if (ClickCBSNews.bShowing) {
			ClickCBSNews.CBSNews.close();
			ClickCBSNews.bShowing = false;
		}
		ClickBloomberg.Bloomberg = window.open ('http://www.bloomberg.com/tv/popout/us/3.812999999616295/', 'Bloomberg News', config='height=394, width=638, top=40, left=' + ClickBloomberg.x + ', toolbar=no, menubar=no, scrollbars=no, resizable=no, directories=no, status=no');
		ClickBloomberg.bShowing = true;
	}
	else {
		ClickBloomberg.Bloomberg.close();
		ClickBloomberg.bShowing = false;
	}
}

function ClickSearch() {
	var sCard = "<div style='text-align: center;'>";
	sCard += "<input type='text' id='SearchText' placeholder='Search text'><br>";
	sCard += "<input type='button' value='Search' id='SearchNow'> <input type='button' value='Cancel' id='SearchCancel'>";
	sCard += "</div>";
	document.getElementById('SearchCard').innerHTML = sCard;
	document.getElementById("SearchNow").addEventListener("click", SearchNews);
	document.getElementById("SearchCancel").addEventListener("click", CloseSearch);
	document.getElementById('SearchCard').style.display = 'block';
}

function SearchNews() {
	var sSearchFor = document.getElementById('SearchText').value.trim().toLowerCase();
	var sSearchForUL = document.getElementById('SearchText').value.trim();
	var sText = '';
	var nActualCount = 0;
	var aMatches = [];

	for (var i = 0; i < objSources.News.length; i++) {
		for (var j = 0; j < objSources.News[i].Entry.length; j++) {
			if (-1 !== objSources.News[i].Entry[j].Snippet.toLowerCase().search(sSearchFor) || -1 !== objSources.News[i].Entry[j].Title.toLowerCase().search(sSearchFor) || -1 !== objSources.News[i].Name.toLowerCase().search(sSearchFor)) {
				objSources.News[i].Entry[j].i = i;
				objSources.News[i].Entry[j].j = j;
				aMatches[nActualCount] = objSources.News[i].Entry[j];
				nActualCount++;
			}
		}
	}
	aMatches.sort(sort_search_matches);
	for (var k=0; k<aMatches.length; k++) {
		var sColor2 = (objSources.News[aMatches[k].i].Color) ? objSources.News[aMatches[k].i].Color : "#555555";
		sText += "<a href='javascript:ShowMore(\"" + aMatches[k].i + "_" + aMatches[k].j + "\")' id='" + aMatches[k].i + "^" + aMatches[k].j + "'>+</a> ";
		sText += "<a href='" + aMatches[k].Link + "' target='_blank' ";
		sText += "style='color: " + sColor2 + ";' title='" + aMatches[k].Snippet + "'>" + aMatches[k].Title + '</a> (<a href="javascript:ShowSource(\'' + objSources.News[aMatches[k].i].Name + '\')">' + objSources.News[aMatches[k].i].Name + '</a>)<br>';
		sText += "<span id='" + aMatches[k].i + "_" + aMatches[k].j + "' onclick='ShowMore(\"" + aMatches[k].i + "_" + aMatches[k].j + "\")' style='display: none; margin-left: 20px; margin-right: 20px;'> </span><br>";
	}

	var sCard = "<div class='Card'><a href='javascript:RefreshHeadlines()'><img src='/Chrome/Headlines/Images/RefreshI16.png' align='right'/></a>";
	sCard += "<b><a href='javascript:ShowMostRecent(10, ShowMostRecent.sType)'>" + nActualCount + "</a> <a href='javascript:ShowMostRecent(100, ShowMostRecent.sType)'>Most Recent</a> - <a href='javascript:ClickSearch()'>" + sSearchForUL + "</a></b><br><br>";
	sCard += sText;
	sCard += "</div>";
	document.getElementById('NewsRow').innerHTML = sCard;
	document.getElementById('MostRecent').innerHTML = "<a href='javascript:ShowHeadlineCards(\""+ShowMostRecent.sType+"\")'>"+ShowMostRecent.sType+" by source</a>";
	document.getElementById('SearchCard').style.display = 'none';
}

var sort_search_matches = function (a, b) {
	return b.PubDate-a.PubDate;
};

function CloseSearch() {
	document.getElementById('SearchCard').style.display = 'none';
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
<iframe src="http://embed.live.huffingtonpost.com/HPLEmbedPlayer/?segmentId=54a3079b78c90a37d20002a0&autoPlay=false" width="570" height="321" frameBorder="0" scrollable="no"></iframe>

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

*/
