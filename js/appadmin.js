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
		  var note = $("#template-contactform-note").val()

		  

		  var fd=new FormData();
		  //fd.append("audio_data",blob, filename);
		  
		  fd.append("author",author);
		  fd.append("note",note);

		  
		  $.ajax({
		    type: 'POST',
		    url: 'notemanager.php',
		    data: fd,
		    processData: false,
		    contentType: false,
		    dataType: "json" //返回格式
		  }).done(function(data) {
		    console.log(data);
		    if (data.save) {
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