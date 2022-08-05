//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);
//var sTime = 0;


function startRecording() {
	
	sTime = performance.now(); //記錄啟動時間
	console.log("recordButton clicked, sTime=" + sTime +"ms");
	document.getElementById("timer").innerHTML="開始錄製: 0秒";
	renewclock = window.setInterval("document.getElementById(\"timer\").innerHTML=\"錄製時間:\" + Math.round((performance.now()-sTime)/1000) + \"秒\"",1000);
	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;
	//stopButton.disabled = false;
	pauseButton.disabled = true;//false;
	lockstop = window.setInterval("stopButton.disabled = false; window.clearInterval(lockstop);console.log(\"unlock the stop button\") ", 5000); //延時五秒解除鎖定
	
	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		//update the format 
		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz" + "錄製中，錄音長度須5秒以上，結束請按停止"

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true;
	});
}

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="繼續錄音";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="暫停";

	}
}

function stopRecording() {
	console.log("stopButton clicked");
	var eTime = performance.now(); //記錄結束時間
	console.log("Call to doSomething took " + (eTime - sTime) + " ms.");
	window.clearInterval(renewclock); //解除數字更新
	if ((eTime - sTime) >5000){
		//document.getElementById("timer").innerHTML="錄製時間: " + Math.round((eTime - sTime)/100)/10 + "秒"
		$("#timer").removeAttr("class");
		$("#timer").addClass("badge badge-success");
		document.getElementById("formats").innerHTML='錄製完成，如需重新錄製請按\<a href=\"#\" onClick=\"document.location.reload()\""\>這裡\</a>'
	}else{
		document.getElementById("formats").innerHTML='\<b\>長度不足，請重新錄製\<\/b\>'
	}
	//window.clearInterval(lockstop); //解除遞迴程式
	

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = true;//false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="暫停";
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('div');//('li');
	var link = document.createElement('a');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//save to disk link
	//link.href = url;
	//link.id = "localsave";
	//link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	//link.innerHTML = " ";//"備份錄音檔案到手機";

	//add the new audio element to li
	li.appendChild(au);

	//add the filename to the li
	//li.appendChild(document.createTextNode(filename+".wav "))

	//add the save to disk link to li
	//li.appendChild(link);

	
	//upload link


	//var upload = document.createElement('a');
	//upload.href="#";
	//upload.innerHTML = "Upload";
	//upload.addEventListener("click", function(event){
	document.getElementById("submit").addEventListener("click", function(event){
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server returned: ",e.target.responseText);
		      }
		  };
		  $('#submit').attr('disabled', true); /*停用送出按鈕*/
		  $('#submit').text("資料上傳中...");
		  //console.log(blob);
		  var author = $("#template-contactform-name").val()
		  //console.log(author);
		  var gender = $('input[name=template-contactform-gender]:checked').val()
		  //console.log(gender);
		  var platform = $('input[name=template-contactform-platform]:checked').val()
		  //console.log(platform);
		  var age = $("#template-contactform-age").val()
		  //console.log(age);
		  var label = $("#template-contactform-tags-select").val()
		  //console.log(label);
		  var weight = $("#template-contactform-weight").val()
		  //console.log(weight);
		  	//save to disk link
			link.href = url;
			link.id = "localsave";
		    link.download = filename + "-" + gender + "-" + platform + "-" + author + "-" + age + "-" + weight + "-"+ label + ".wav";
		    link.innerHTML = " ";
		  //add the save to disk link to li
		  li.appendChild(link);

		  //Cookies記錄區
			expire_days = 30; // 過期日期(天)
			var d = new Date();
			d.setTime(d.getTime() + (expire_days * 24 * 60 * 60 * 1000));
			var expires = "expires=" + d.toGMTString();
			document.cookie = "platform=" + platform + "; " + expires;
			document.cookie = "author=" + author + "; " + expires;
			document.cookie = "gender=" + gender + "; " + expires;
			document.cookie = "age=" + age + "; " + expires;
			document.cookie = "weight=" + weight + "; " + expires;
			// alert(document.cookie)

		  

		  var fd=new FormData();
		  fd.append("audio_data",blob, filename);
		  
		  fd.append("author",author);
		  fd.append("gender",gender);
		  fd.append("platform",platform);
		  fd.append("age",age);
		  fd.append("label",label);
		  fd.append("weight",weight);
		  //xhr.open("POST","upload.php",true);
		  //xhr.send(fd);
		  //fd.append('fname', filename);
		  //fd.append('data', blob);
		  
		  $.ajax({
		    type: 'POST',
		    url: 'upload.php',
		    data: fd,
		    processData: false,
		    contentType: false,
		    dataType: "json" //返回格式
		  }).done(function(data) {
		    console.log(data);
		    if (data.save) {
		    	if (platform=='babymoonbade' | platform=='babymoonsinyi') {
		    		alert("上傳成功，謝謝您提供資料\n目前資料數量為" + data.datanumber.babymoon + "筆(彌月房)");
		    	} else if (platform=='bobson'){
		    		alert("上傳成功，謝謝您提供資料\n目前資料數量為" + data.datanumber.bobson + "筆(曜生)");
		    	} else {
		    		alert("上傳成功，謝謝您提供資料");
		    	}
		    	
		    	//$("#localsave").get(0).click(); //觸發本地下載
		    	//alert("上傳成功，謝謝您提供資料",'',function(){
		    	//	location.reload();
		    	//});
		    	//alert(data.save);
		    	location.reload();
		    } else {
		    	alert("上傳失敗，儲存檔案到手機端" + data);
		    	$("#localsave").get(0).click(); //觸發本地下載

		    }
		    //location.reload();
		  });
		  
	})
	li.appendChild(document.createTextNode (" "))//add a space in between
	//li.appendChild(upload)//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);
}


function downsampleBuffer(buffer, rate) {
    if (rate == sampleRate) {
        return buffer;
    }
    if (rate > sampleRate) {
        throw "downsampling rate show be smaller than original sample rate";
    }
    var sampleRateRatio = sampleRate / rate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
         // Use average value of skipped samples
        var accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = accum / count;
        // Or you can simply get rid of the skipped samples:
        // result[offsetResult] = buffer[nextOffsetBuffer];
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}