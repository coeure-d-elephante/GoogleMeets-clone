const APP_ID = "202bddbdec1949a69e911c7b1ba5388c"

let token = null;
let uid = String(Math.floor(Math.random() * 10000))

let client;
let channel;

let queryString = window.location.search
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')

let localStream;
let remoteStream;
let peerConnection;

const servers = {'iceServers': [
  {
    'url': 'stun:stun.l.google.com:19302'
  }
]};

const mediaStreamConstraints = {
  video: true, audio: true
}

const init = async () => {
  client = await AgoraRTM.createInstance(APP_ID)
  await client.login({uid, token})

  //index.html?room=234234
  channel = client.createChannel('main')
  await channel.join()

  channel.on('MemberJoined', handleUserJoined)

  client.on('MessageFromPeer', handleMessageFromPeer)

  localStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  document.getElementById('localVideo').srcObject = localStream
}

const handleMessageFromPeer = async (message, MemberId) => {
  message = JSON.parse(message.text)
  if(message.type === 'offer') {
    createAnswer(MemberId, message.offer)
  }
  if(message.type === 'answer') {
    addAnswer(message.answer)
  }
  if(message.type === 'candidate') {
    if(peerConnection){
      peerConnection.addIceCandidate(message.candidate)
    }
  }
}

const handleUserJoined = async (MemberId) => {
  console.log('A new user:', MemberId)
  createOffer(MemberId);
}

const createPeerConnection = async (MemberId) => {
  peerConnection = new RTCPeerConnection(servers)

  remoteStream = new MediaStream()
  document.getElementById('remoteVideo').srcObject = remoteStream

  if(!localStream){
    localStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    document.getElementById('localVideo').srcObject = localStream
  }

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream)
  })

  //event listener for when remote peer adds track
  peerConnection.ontrack = (e) => {
    e.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track)
    })
  }

  peerConnection.onicecandidate = async (e) => {
    if(e.candidate){
      client.sendMessageToPeer({text:JSON.stringify({'type': 'candidate', 'candidate': e.candidate})}, MemberId)

    }
  }

}

const createOffer = async (MemberId) => {
  await createPeerConnection(MemberId)

  let offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)

  client.sendMessageToPeer({text:JSON.stringify({'type': 'offer', 'offer': offer})}, MemberId)
}

const createAnswer = async (MemberId, offer) => {
  await createPeerConnection(MemberId)

  await peerConnection.setRemoteDescription(offer)

  let answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  client.sendMessageToPeer({text:JSON.stringify({'type': 'answer', 'answer': answer})}, MemberId)
}

const addAnswer = async (answer) => {
  if(!peerConnection.currentRemoteDescription){
    peerConnection.setRemoteDescription(answer)
  }
}

const localScreen =  document.getElementById('localScreen');

localScreen.addEventListener("click", () => {
  navigator.mediaDevices.getDisplayMedia(mediaStreamConstraints)
})
init();

//=======================
