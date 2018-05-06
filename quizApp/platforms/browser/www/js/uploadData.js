var host="http://developer.cege.ucl.ac.uk:31092/";
function postData(url,postString,callback) {
   var client;
   client = new XMLHttpRequest();
   client.open("POST",host+url,true);
   client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   client.onreadystatechange = function(){
	  if (client.readyState == 4) {
		  // change the DIV to show the response
		  if(callback)
			  callback(client.responseText);
	  }
   };
   client.send(postString);
}

function getData(url,callback) {
   var client;
   client = new XMLHttpRequest();
   client.open("GET",host+url);
   client.onreadystatechange = function(){
	  if (client.readyState == 4) {
		  // change the DIV to show the response
		  if(callback)
			  callback(client.responseText);
	  }
   };
   client.send();
}
