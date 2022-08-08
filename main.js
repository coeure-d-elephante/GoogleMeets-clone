let localStream;
let remoteStream;
let peerConnection;

const servers = {'iceServers': [
  {
    'url': 'stun:stun.l.google.com:19302'
  }
]};


const mediaStreamConstraints = {
  video: true, audio: false
}

//upon initialising app
const init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  document.getElementById('localVideo').srcObject = localStream

  createOffer();
}

const localScreen =  document.getElementById('localScreen');

localScreen.addEventListener("click", () => {
  navigator.mediaDevices.getDisplayMedia(mediaStreamConstraints)
})

const createOffer = async () => {
  //new => live instance
  peerConnection = new RTCPeerConnection(servers)

  remoteStream = new MediaStream()
  document.getElementById('remoteVideo').srcObject = remoteStream

//   localStream.getTracks().forEach((track) => {
//     peerConnection.addTrack(track, localStream)
//   })

//   peerConnection.ontrack = (e) => {
//     e.streams[0].getTracks().forEach(() => {
//       remoteStream.addTrack(track)
//     })
//   }

//   peerConnection.onicecandidate = async (e) => {
//     if(e.candidate){
//       console.log('new ICE candidate', e.candidate)
//     }
//   }

  let offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)

  console.log("offer", offer)
}

init();



