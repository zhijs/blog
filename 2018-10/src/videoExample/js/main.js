

function getMain(){
  var main  = 
  { 
    pc: null,
    offer: null,
    name: null,
    init: function(){
      window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.msRTCPeerConnection;
      var ice = {
        "iceServers": [
            { "url": "stun:stun.l.google.com:19302" }, //使用google公共测试服务器
            { "url": "turn:user@turnserver.com", "credential": "pass" } // 如有turn服务器，可在此配置
        ]
      };
      // 创建pc对象
      this.pc = new RTCPeerConnection(ice);
    }
  }
  return main;
}