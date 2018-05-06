// load the map
var mymap = L.map('mapid').setView([51.525, -0.13], 13);
var curpositonMaker=L.marker([51.525, -0.13]).addTo(mymap);
// load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			maxZoom: 18,
			id: 'mapbox.streets'
}).addTo(mymap);

var allQuestions=null;//全部问题
var currentQuestion=null;//当前问题
var maxdistance=0.1;//100m,最大距离，超出这个距离不弹出问题

/**
 * 跟踪用户地理位置
 * @returns
 */
function trackLocation() {
	navigator.geolocation.watchPosition(showPosition);
}
/**
 * 显示用户地理位置
 * @param position
 * @returns
 */
function showPosition(position) {
	
	//地图移动到当前用户所在位置
	 mymap.panTo([position.coords.latitude, position.coords.longitude], {animate:true});
	 //更新marker的位置
	 curpositonMaker.setLatLng(L.latLng(position.coords.latitude, position.coords.longitude));
	 
	 //如果有问题并且当前没有弹出问题
	 if(allQuestions!=null&&currentQuestion==null)
	{
		 //所有问题对应的位置与用户当前位置的最小距离
		var mindistance=null;
		
		var index=null;
		for(var i=0;i<allQuestions.length;i++)
		{
			var question=allQuestions[i];
			//计算距离
			var distance = calculateDistance(position.coords.latitude, position.coords.longitude, question.lat,question.lng, 'K');
			if(distance<=maxdistance&&(mindistance==null||distance<mindistance))
			{
				//当前距离小于等于maxdistance，并且是最小距离，修改最小距离
				mindistance=distance;
				index=i;
			}
		}
		if(index!=null)
		{
			//在规定距离范围内有问题
			
			//获取当前问题
			var q=allQuestions[index];
			//设置当前问题
			currentQuestion=q;
			//把已弹出的问题从所有问题中移除，避免多次弹出
			allQuestions.splice(index,1);
			//弹出问题
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
 * 获取用户选中的答案
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
 * 取消选中的答案
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
 * 提交答案
 * @returns
 */
function commitAnswer()
{
	//获取用户选中的答案
	var useranswer=getSelectAnswer();
	if(useranswer==-1)
	{
		alert("请选择答案");
		return;
	}
	//上传答案到服务器
	uploadAnswer(useranswer,function(){
		//禁止选择
		disabledOptions(true);
		//隐藏commit按钮
		hide("button_commit");
		//显示ok按钮
		show("button_ok");
		//显示答案
		showResult(currentQuestion.answer,useranswer);
	});
}
/**
 * 上传答案
 * @param answer
 * @param callback
 * @returns
 */
function uploadAnswer(answer,callback)
{
	//判断用户选则的答案是否正确，1:正确 0:不正确
	var correct=answer==currentQuestion.answer?1:0;
	//上传到服务器
	postData("commitanswer","phoneid="+phoneid+"&questionid="+currentQuestion.id+"&answer="+answer+"&correct="+correct,callback);
	
}
/**
 * 关闭弹出
 */
function closePopWindow()
{
	currentQuestion=null;
	hide("poplayer");
}
/**
 * 禁用或启用选择
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
 * 显示结果
 * @param answer    正确答案
 * @param useranswer  用户答案
 * @returns
 */
function showResult(answer,useranswer)
{
	//获取正确选项
	var correctanswer=document.getElementById("info_option"+answer);
	//设置正确选项的字体为绿色
	correctanswer.className="font-green";
	if(answer==useranswer)
	{
		//答对了，显示correct提示
		show("msg_correct");
	}
	else 
	{
		//答错了，显示wrong提示
		show("msg_wrong");
		
		//获取用户选中的选项
		var selectedoption=document.getElementById("info_option"+useranswer);
		//设置用户选中的选项的字体为红色
		selectedoption.className="font-red";
	}
}
/**
 * 显示问题
 * @param question
 * @returns
 */
function showQuestion(question)
{
	//显示问题弹窗
	show("poplayer");
	
	//显示问题信息
	document.getElementById("info_question").innerHTML=question.question;
	document.getElementById("info_option1").innerHTML="A:"+question.option1;
	document.getElementById("info_option2").innerHTML="B:"+question.option2;
	document.getElementById("info_option3").innerHTML="C:"+question.option3;
	document.getElementById("info_option4").innerHTML="D:"+question.option4;
	
	
	//恢复选项的颜色为黑色
	document.getElementById("info_option1").className="font-black";
	document.getElementById("info_option2").className="font-black";
	document.getElementById("info_option3").className="font-black";
	document.getElementById("info_option4").className="font-black";
	
	
	hide("msg_correct");
	hide("msg_wrong");
	hide("button_ok");
	show("button_commit");
	
	//取消选中
	unSelectAnswer();
	
	//设置选项可选
	disabledOptions(false);
}
/**
显示指定id的元素
*/
function show(id)
{
	//根据id获取元素
	var elm=document.getElementById(id);
	if(elm!=null)
		elm.style.display="block";//显示元素
}
/**
隐藏指定id的元素
*/
function hide(id)
{
	//根据id获取元素
	var elm=document.getElementById(id);
	if(elm!=null)
		elm.style.display="none";//隐藏元素
}
/**
 * //在地图上显示问题对应的marker
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
		//把问题所在的坐标在地图上用marker展示出来
		L.marker([question.lat,question.lng], {icon:markerPink}).addTo(mymap);
		
	}
}
/**
 * 获取问题
 * @param callback
 * @returns
 */
function getQuestions(callback)
{
	//从服务器获取问题
	getData("getallquestions",function(data){
		var questions=JSON.parse(data);
		callback(questions);
	});
}
/**
 * 获取所有问题
 * @returns
 */
function loadQuestions()
{
	getQuestions(function(data){
		//data为所有问题
		allQuestions=data;
		//在地图上显示问题对应的marker
		showQuestionMarker(data);
	})
}