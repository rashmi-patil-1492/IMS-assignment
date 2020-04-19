
var manifestUri =
    'https://ims-assignment.s3.eu-west-2.amazonaws.com/outputmulti_dash.mpd';

function initApp() {
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    initPlayer();
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
  }
}

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    console.log(items);
    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function initPlayer() {
  // Create a Player instance.
  var video = document.getElementById('video');
  var player = new shaka.Player(video);



  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;
  player.configure({
  streaming:{
    bufferingGoal:70,
    rebufferingGoal:20,
    bufferBehind :20
  }
})

player.configure({
  manifest:{
    dash:{
      ignoreMinBufferTime : true
    }
  }
})




  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  // Try to load a manifest.
  // This is an asynchronous process.
  player.load(manifestUri).then(function() {
    // This runs if the asynchronous load is successful.
    console.log('The video has now been loaded!');

  }).catch(onError);  // onError is executed if the asynchronous load fails.


  player.getNetworkingEngine().registerRequestFilter(function(type, request) {
  if (type != shaka.net.NetworkingEngine.RequestType.SEGMENT) return;
  // Log that segment has started downloading; record start time.
});

var basicLogs = []
var statLogs = []
player.getNetworkingEngine().registerResponseFilter(function(type, response) {
  if (type != shaka.net.NetworkingEngine.RequestType.SEGMENT) return;
  // Log that segment has finished downloading.\
  var stats = player.getStats();
  statLogs.push({
    timestamp: (Date.now()/1000),
    width: stats['width'],
    height: stats['height'],
    streamBandwidth: stats['streamBandwidth'],
    estimatedBandwidth: stats['estimatedBandwidth'],
    loadLatency:stats['loadLatency'],
    manifestTimeSeconds: stats['manifestTimeSeconds'],
    playTime: stats['playTime'],
    pauseTime: stats['pauseTime'],
    bufferingTime: stats['bufferingTime']
  });

  basicLogs.push({
    timestamp: (Date.now()/1000),
    width: stats['width'],
    height: stats['height'],
    streamBandwidth: stats['streamBandwidth'],
    estimatedBandwidth: stats['estimatedBandwidth'],
    loadLatency:stats['loadLatency'],
    manifestTimeSeconds: stats['manifestTimeSeconds'],
    playTime: stats['playTime'],
    pauseTime: stats['pauseTime'],
    bufferingTime: stats['bufferingTime']
  });

  // // state history
stats['stateHistory'].forEach((item) => {
    statLogs.push({
      timestamp: 'None',
      width: 'None',
      height: 'None',
      streamBandwidth: 'None',
      estimatedBandwidth: 'None',
      loadLatency:'None',
      manifestTimeSeconds: 'None',
      playTime: 'None',
      pauseTime: 'None',
      bufferingTime: 'None',

// state history
      sth_timestamp: item['timestamp'],
      sth_state: item['state'],
      sth_duration: item['duration']
    });
});

// // switch history
stats['switchHistory'].forEach((item) => {
  statLogs.push({
    timestamp: 'None',
    width: 'None',
    height: 'None',
    streamBandwidth: 'None',
    estimatedBandwidth: 'None',
    loadLatency:'None',
    manifestTimeSeconds: 'None',
    playTime: 'None',
    pauseTime: 'None',
    bufferingTime: 'None',

// state history
    sth_timestamp: 'None',
    sth_state: 'None',
    sth_duration: 'None',

// switch history
    swh_timestamp: item['timestamp'],
    swh_id: item['id'],
    swh_type: item['type'],
    swh_fromAdaptation: item['fromAdaptation'],
    swh_bandwidth: item['bandwidth']
  });
});


  console.log('logs',player.getStats());  // |data| is an ArrayBuffer.
});

var basicHeaders = {
  timestamp: "timestamp",
  width: "width",
  height: "height",
  streamBandwidth: "streamBandwidth",
  estimatedBandwidth: "estimatedBandwidth",
  loadLatency: "loadLatency",
  manifestTimeSeconds: "manifestTimeSeconds",
  playTime: "playTime",
  pauseTime: "pauseTime",
  bufferingTime: "bufferingTime"
};
var headers = {
    timestamp: "timestamp",
    width: "width",
    height: "height",
    streamBandwidth: "streamBandwidth",
    estimatedBandwidth: "estimatedBandwidth",
    loadLatency: "loadLatency",
    manifestTimeSeconds: "manifestTimeSeconds",
    playTime: "playTime",
    pauseTime: "pauseTime",
    bufferingTime: "bufferingTime",
    // state history
    sth_timestamp: "sh_timestamp",
    sth_state: "sh_state",
    sth_duration: "sh_duration",
    // switch history
    swh_timestamp: "swh_timestamp",
    swh_id: "swh_id",
    swh_type: "swh_type",
    swh_fromAdaptation: "swh_fromAdaptation",
    swh_bandwidth: "swh_bandwidth"
};


var experiment = "experiment-5";
fileTitle = experiment + "_advanced";
var x = document.createElement("BUTTON");
var t = document.createTextNode(fileTitle);
x.appendChild(t);
x.onclick = function() {
      exportCSVFile(headers, statLogs, fileTitle);
};
document.body.appendChild(x);

basicFileTitle = experiment + "_basic"
var basic = document.createElement("BUTTON");
var basicT = document.createTextNode(basicFileTitle);
basic.appendChild(basicT);
basic.onclick = function() {
      exportCSVFile(basicHeaders, basicLogs, basicFileTitle);
};
document.body.appendChild(basic);
// adding ui

// const ui = video['ui'];
// const config = {
//   'overflowMenuButtons' : ['quality']
// }
// ui.configure(config);


}




function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error('Error code', error.code, 'object', error);
}

document.addEventListener('DOMContentLoaded', initApp);
