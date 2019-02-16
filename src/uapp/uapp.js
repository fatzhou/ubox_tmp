var _callback_maps = {};

/**
 * exec local function
 * parameters:
 *    service: service
 * return:
 */
function exec (service, execute, arrargs) {
  var callbackId = Math.floor (Math.random () * 100000000000);
  var postmsgargs = JSON.stringify ({callbackId: callbackId, service: service, execute: execute, arrargs: arrargs});
  return new Promise(function(resolve, reject){
    _callback_maps[callbackId] = [resolve, reject];
    webkit.messageHandlers.cordova_iab.postMessage(postmsgargs);
  });
}

/**
 * exec local function return, called by framework
 */
function _exec_result (callbackId, ret, args) {
  if (_callback_maps[callbackId]) {
    var promise = _callback_maps[callbackId];
    if(promise.length === 2) {
      if (ret === true) {
        promise[0] (args);//resolve
      } else {
        promise[1] (args);//reject
      }
    }else{
      console.log ('value of callbackid:' + callbackId + ' length is not 2, something error!!!!');
    }
  } else {
    console.log ('unkown callbackid:' + callbackId);
  }
  delete _callback_maps[callbackId];
}

console.log ('----ubbey iab: inject exec done.--by file--');


window.exec = exec;
