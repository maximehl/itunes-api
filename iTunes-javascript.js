function searchButtonClicked(){
    var searchTerm = document.getElementById("artistName").value;
    var searchURL = 'https://itunes.apple.com/search?term=';
    for(var i = 0; i<searchTerm.length; i++){
        if(searchTerm[i]===" "){
            searchURL+="+";
        }else{
            searchURL+=searchTerm[i];
        }
    }
    $.ajax({
        url: searchURL,
        type: 'GET',
        crossDomain: true,
        dataType: 'jsonp',
        success: function(result){
            programGo(result);
        },
        error: function(){
            alert('Failed!');
        }
    });
}

var artistNames = ["50 Cent", "AC/DC", "Aerosmith", "Akon", "Alabama", "Alan Jackson",
    "Alessia Cara", "Alicia Keys", "Anne-Marie", "Ariana Grande", "Avicii",
    "Avril Lavigne", "Backstreet Boys", "Barbara Streisand", "The Beatles", "Beyoncé",
    "Billy Joel", "Bob Dylan", "Bob Marley", "Bob Seger & The Silver Bullet Band", "Bon Jovi",
    "Big Sean", "Britney Spears", "Bruce Springsteen", "Bruno Mars", "Carrie Underwood",
    "Celine Dion", "Chicago", "Chris Brown", "Christina Aguilera", "Clean Bandit", "Coldplay",
    "Daft Punk", "Def Leppard", "Demi Lovato", "DJ Khaled", "dodie",
    "Eagles", "Ed Sheeran", "Elton John", "Elvis Presley", "Eminem", "Eric Clapton",
    "Fergie", "Fleetwood Mac", "Foo Fighters", "Foreigner", "Future", "Garth Brooks", "George Strait",
    "Guns N' Roses", "Hailee Steinfeld", "Imagine Dragons", "Jay-Z", "Jennifer Lopez", "Journey",
    "Justin Bieber", "Justin Timberlake",
    "Katy Perry", "Kelly Clarkson", "Kenny G", "Kenny Rogers", "Kesha", "Lady Gaga",
    "Led Zeppelin", "Lil Wayne", "LINKIN PARK", "Lorde", "Ludacris", "Macklemore", "Madonna",
    "Mariah Carey", "Maroon 5", "Mary J. Blige", "Metallica", "Michael Jackson",
    "Miley Cyrus", "Neil Diamond", "Nicki Minaj",
    "Nelly Furtado", "One Direction", "P!nk", "Pentatonix", "Phil Collins", "Pink Floyd", "Prince", "Queen",
    "R. Kelly", "Reba McEntire", "Rihanna", "Rod Stewart", "The Rolling Stones", "Sam Smith", "Santana", "Sean Paul",
    "Shakira", "Shania Twain", "Sia", "Simon & Garfunkel", "Stevie Wonder", "Snoop Dogg", "T.I.", "Taylor Swift",
    "The Temptations", "Tim McGraw", "Tupac Shakur", "U2", "Van Halen", "Whitney Houston", "Zac Efron"];

function generateSuggestions(){
    var returnList = "";
    for(var i in artistNames){
        returnList+="<option value='" + artistNames[i] + "'>"
    }
    document.getElementById("suggestions").innerHTML = returnList;
}

var numResults = 50;
function updateRange(rangeValue){
    $('#numResults').text(rangeValue);
    numResults = rangeValue;
}

function programGo(jsonData){
    trackList.empty();
    if(jsonData.resultCount===0){
        var errorMessage = $("<li id='errorMessage'><h3>This search returned 0 results.</h3></li>");
        trackList.append(errorMessage);
        showResults();
        return;
    }
    var numDisplayed = 0;
    for(var i in jsonData.results){
        if(numDisplayed>=numResults){
            break;
        }
        numDisplayed++;
        buildObject(jsonData.results[i]);
    }
    setTimeout(function(){
        tracksContainer.css({'height': trackList.height() + H3HEIGHT});
    }, 100);
}

var H3HEIGHT;
var trackList;
var tracksContainer;
$(document).ready(function(){
    trackList = $("#tracks");
    tracksContainer = $("#tracksContainer");
    H3HEIGHT = trackList.parent().find("h3").height();

    tracksContainer.css({"height": H3HEIGHT});
    tracksContainer.on("mouseenter", function() {
        showResults();
    });
    tracksContainer.on("mouseleave", function(){
        hideResults();
    });
});

function showResults(){
    tracksContainer.css({'height': trackList.height() + H3HEIGHT});
}

function hideResults(){
    tracksContainer.css({'height': H3HEIGHT});
}

var trackData;
var unacceptableWrappers = ["audiobook"];
function buildObject(trackObject){
    if(unacceptableWrappers.indexOf(trackObject.wrapperType)>-1){
        return;
    }
    trackData = [trackObject.trackName, trackObject.artistName, trackObject.trackPrice,
        convertTrackTime(trackObject.trackTimeMillis), trackObject.artworkUrl100, trackObject.trackViewUrl, 0];
    trackData[6] = findFeaturedArtists();
    var pageObject = $("<li><a href='" + trackData[5] + "'><h5>" + trackData[0]+ "</h5><img src='" + trackData[4]
        + "'><br><span class='information collapsible'>Artist: " + trackData[1] + trackData[6] + "<br>Length: "
        + trackData[3] + "<br>Price: $" + trackData[2] + "</span></a></li>");
    pageObject.on("mouseenter", function(){
        var infoSpan = $(this).find('.information');
        var clonedSpan = infoSpan.clone().css({'height': 'auto'}).appendTo(this);
        var heightNeeded = clonedSpan.height();
        clonedSpan.remove();
        infoSpan.animate({'top': -1*heightNeeded, 'height': heightNeeded, 'marginBottom': -1*heightNeeded}, 400);
    });
    pageObject.on("mouseleave", function(){
        var infoSpan = $(this).find('.information');
        infoSpan.animate({'top': 0, 'height': 0, 'marginBottom': 0}, 400);
    });
    trackList.append(pageObject);
}

function findFeaturedArtists(){
    var trackName = trackData[0];
    var featuredIndex = trackName.indexOf("feat. ");
    var featuredArtists = "";
    if(featuredIndex>-1){
        featuredArtists = "<br>Featuring: " + trackName.slice(featuredIndex+6, trackName.length-1);
        trackData[0] = trackName.slice(0, featuredIndex-2);
    }
    return featuredArtists;
}

function convertTrackTime(trackTime){
    var timeString = "";
    var seconds = (trackTime/1000).toFixed();
    var minutes = Math.floor(seconds/60);
    seconds -= minutes*60;
    var hours = 0;
    if(minutes>60){
        hours = Math.floor(minutes/60);
        minutes -= hours*60;
    }
    if(hours>0){
        timeString+=hours + ":";
    }
    timeString += minutes + ":" + seconds;
    return timeString;
}