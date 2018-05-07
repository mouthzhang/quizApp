// load the map
var mymap = L.map('mapid').setView([51.525, -0.13], 13);
var curpositonMaker=L.marker([51.525, -0.13]).addTo(mymap);
// load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
}).addTo(mymap);

var allQuestions=null;//all questions
var currentQuestion=null;//current question
var maxdistance=0.005;//proximity alert 5m,no popup beyond this distance

/**
 * tracking user geolocation
 * @returns
 */
function trackLocation() {
	navigator.geolocation.watchPosition(showPosition);
}
/**
 * show user geolocation
 * @param position
 * @returns
 */
function showPosition(position) {
	
	//map centred at current user location
	 mymap.panTo([position.coords.latitude, position.coords.longitude], {animate:true});
	 //update marker location
	 curpositonMaker.setLatLng(L.latLng(position.coords.latitude, position.coords.longitude));
	 
	 //if user within the proximity aleart range but no question pop up, pop the closest question
	 if(allQuestions!=null&&currentQuestion==null)
	{
		 //minimum distance from user coord to all question points
		var mindistance=null;
		
		var index=null;
		for(var i=0;i<allQuestions.length;i++)
		{
			var question=allQuestions[i];
			//calculate Distance
			var distance = calculateDistance(position.coords.latitude, position.coords.longitude, question.lat,question.lng, 'K');
			if(distance<=maxdistance&&(mindistance==null||distance<mindistance))
			{
				//if new distance is within the proximity aleart range, change the question which satisfy the new distance
				mindistance=distance;
				index=i;
			}
		}
		if(index!=null)
		{
			//question point within proximity aleart distance
			
			//get the question
			var q=allQuestions[index];
			//get ready the question
			currentQuestion=q;
			//avoid repeating same question
			allQuestions.splice(index,1);
			//popup question
			showQuestion(q);
		}
	}
}


// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
	 var radlat1 = Math.PI * lat1/180;
	 var radlat2 = Math.PI * lat2/180;
	 var radlon1 = Math.PI * lon1/180;
	 var radlon2 = Math.PI * lon2/180;
	 var theta = lon1-lon2;
	 var radtheta = Math.PI * theta/180;
	 var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	 subAngle = Math.acos(subAngle);
	 subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
	 dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
	// where radius of the earth is 3956 miles
	 if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
	 if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
	 return dist;
}
/**
 * get selected answer
 * @returns
 */
function getSelectAnswer()
{
	var ops=document.getElementsByName("answer");
	for(var i =0;i< ops.length;i++)
	{
		if(ops[i].checked)
		{
			return ops[i].value;
		}
	}
	return -1;
}
/**
 * un-select question
 * @returns
 */
function unSelectAnswer()
{
	var ops=document.getElementsByName("answer");
	for(var i =0;i< ops.length;i++)
	{
		if(ops[i].checked)
		{
			 ops[i].checked="";
		}
	}
	return -1;
}
/**
 * commit answer
 * @returns
 */
function commitAnswer()
{
	//get selected question
	var useranswer=getSelectAnswer();
	if(useranswer==-1)
	{
		alert("Please choose the answer for the question");
		return;
	}
	//upload to server
	uploadAnswer(useranswer,function(){
		//close the question
		disabledOptions(true);
		//hide commite buton
		hide("button_commit");
		//show ok button
		show("button_ok");
		//show the result
		showResult(currentQuestion.answer,useranswer);
	});
}
/**
 * upload answer
 * @param answer
 * @param callback
 * @returns
 */
function uploadAnswer(answer,callback)
{
	//answer right or wrong，1:correct 0:wrong
	var correct=answer==currentQuestion.answer?1:0;
	//upload to server
	postData("commitanswer","phoneid="+phoneid+"&questionid="+currentQuestion.id+"&answer="+answer+"&correct="+correct,callback);
	
}
/**
 * close popup
 */
function closePopWindow()
{
	currentQuestion=null;
	hide("poplayer");
}
/**
 * disable options
 * @param disabled
 * @returns
 */
function disabledOptions(disabled)
{
	
	var ops=document.getElementsByName("answer");
	for(var i =0;i< ops.length;i++)
	{
		ops[i].disabled=disabled?"disabled":"";
	}
}
/**
 * show result
 * @param answer    correct answer
 * @param useranswer  selected answer
 * @returns
 */
function showResult(answer,useranswer)
{
	//get correct answer
	var correctanswer=document.getElementById("info_option"+answer);
	//set correct one green
	correctanswer.className="font-green";
	if(answer==useranswer)
	{
		//answer correctly, show correct
		show("msg_correct");
	}
	else 
	{
		//other wise, show wrong 
		show("msg_wrong");
		
		//get selected answer
		var selectedoption=document.getElementById("info_option"+useranswer);
		//set the font red
		selectedoption.className="font-red";
	}
}
/**
 * show question
 * @param question
 * @returns
 */
function showQuestion(question)
{
	//show popup
	show("poplayer");
	
	//show question and choices
	document.getElementById("info_question").innerHTML=question.question;
	document.getElementById("info_option1").innerHTML="A:"+question.option1;
	document.getElementById("info_option2").innerHTML="B:"+question.option2;
	document.getElementById("info_option3").innerHTML="C:"+question.option3;
	document.getElementById("info_option4").innerHTML="D:"+question.option4;
	
	
	//restore font black
	document.getElementById("info_option1").className="font-black";
	document.getElementById("info_option2").className="font-black";
	document.getElementById("info_option3").className="font-black";
	document.getElementById("info_option4").className="font-black";
	
	
	hide("msg_correct");
	hide("msg_wrong");
	hide("button_ok");
	show("button_commit");
	
	//un-select
	unSelectAnswer();
	
	//set options available to choose
	disabledOptions(false);
}
/**
show the element for certain id
*/
function show(id)
{
	//get element by id
	var elm=document.getElementById(id);
	if(elm!=null)
		elm.style.display="block";//show element
}
/**
hide the element for certain id
*/
function hide(id)
{
	//get element by id
	var elm=document.getElementById(id);
	if(elm!=null)
		elm.style.display="none";//hide element
}
/**
 * //show marker on the map
 * @param questions
 * @returns
 */
function showQuestionMarker(questions)
{
	//pink marker
	var markerPink = L.AwesomeMarkers.icon({
		icon: 'play',
		markerColor: 'pink'});
	for(var i=0;i<questions.length;i++)
	{
		var question=questions[i];
		//show all question marker on the map
		L.marker([question.lat,question.lng], {icon:markerPink}).addTo(mymap);
		
	}
}
/**
 * get question
 * @param callback
 * @returns
 */
function getQuestions(callback)
{
	//get question from server
	getData("getallquestions",function(data){
		var questions=JSON.parse(data);
		callback(questions);
	});
}
/**
 * get all questions
 * @returns
 */
function loadQuestions()
{
	getQuestions(function(data){
		//get data for all question
		allQuestions=data;
		//match the question marker with data
		showQuestionMarker(data);
	})
}