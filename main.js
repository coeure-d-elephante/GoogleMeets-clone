const servers = { iceServers: [{ url: "stun:stun.l.google.com:19302" }] };

let peerConnection = new RTCPeerConnection(servers);

const mediaStreamConstraints = { video: true, audio: true };
const offerOptions = { offerToReceiveVideo: 1 }; //boolean for 1= true? 0=false?

const init = async () => {
  peerConnection;
  console.log("Created peer connection");

  //local video
  const peerMediaStream = new MediaStream();
  peerConnection.addStream(peerMediaStream);

  navigator.mediaDevices
    .getUserMedia(mediaStreamConstraints)
    .then((mediaStream) => {
      localVideo.srcObject = mediaStream;

      for (const track of mediaStream.getTracks())
        peerMediaStream.addTrack(track);
    })
    .catch(logError);
};

//elements from HTML
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const localOffer = document.getElementById("localOffer");
const remoteOffer = document.getElementById("remoteOffer");
const createOffer = document.getElementById("createOffer");
const acceptOffer = document.getElementById("acceptOffer");

const localAnswer = document.getElementById("localAnswer");
const remoteAnswer = document.getElementById("remoteAnswer");
const acceptAnswer = document.getElementById("acceptAnswer");

//	assign click handlers to each button
createOffer.addEventListener("click", offerCreate);
acceptOffer.addEventListener("click", offerAccept);
acceptAnswer.addEventListener("click", answerAccept);

peerConnection.addEventListener("icecandidate", handleConnection);
peerConnection.addEventListener("addstream", gotRemoteMediaStream);

function handleConnection(event) {
  const connection = event.target;
  const iceCandidate = event.candidate;

  if (iceCandidate == null) {
    const description = connection.localDescription;
    const descriptionType = description.type;
    const descriptionString = JSON.stringify(description);

    if (descriptionType == "offer") {
      localOffer.value = descriptionString;
    } else {
      localAnswer.value = descriptionString;
    }
  }
}

function gotRemoteMediaStream(event) {
  const mediaStream = event.stream;
  remoteVideo.srcObject = mediaStream;
  console.log("remote peer connection received remote stream");
}

function offerCreate() {
  peerConnection.createOffer(offerOptions).then(createdOffer).catch(logError);
}

function createdOffer(description) {
  peerConnection
    .setLocalDescription(description)
    .then(() => {
      console.log("local peer description set");
    })
    .catch(logError);
}

function offerAccept() {
  const description = JSON.parse(remoteOffer.value);

  peerConnection
    .setRemoteDescription(description)
    .then(() => {
      console.log("remote peer offer accepted");
    })
    .catch(logError);

  peerConnection.createAnswer().then(createdAnswer).catch(logError);
}

function createdAnswer(description) {
  peerConnection
    .setLocalDescription(description)
    .then(() => {
      console.log("remote peer answered");
    })
    .catch(logError);
}

function answerAccept() {
  const description = JSON.parse(remoteAnswer.value);

  console.log(description);

  peerConnection
    .setRemoteDescription(description)
    .then(() => {
      console.log("Local peer remote description set");
    })
    .catch(logError);
}

function logError(error) {
  console.log(error.toString());
}

//====================Screen Share===============
const localScreen = document.getElementById("localScreen");
const remoteScreen = document.getElementById("remoteScreen");
const startLocalScreen = document.getElementById("startLocalScreen");
const stopLocalScreen = document.getElementById("stopLocalScreen");
const startRemoteScreen = document.getElementById("startRemoteScreen");
const stopRemoteScreen = document.getElementById("stopRemoteScreen");

//returns screen share media
// const startScreenShare = async (displayMediaOptions) => {
//   let captureStream;

//   try{
//     captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
//   } catch (err) {
//     console.error(`Error, ${err}`);
//   }
//   return captureStream;
//   }

async function startCapture(displayMediaOptions) {
  try {
    localScreen.srcObject = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

async function startRemoteCapture(displayMediaOptions) {
  try {
    remoteScreen.srcObject = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

function stopRemoteCapture() {
  let tracks = remoteScreen.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  localScreen.srcObject = null;
}

function stopCapture() {
  let tracks = localScreen.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  localScreen.srcObject = null;
}

//plays screen share media
// const setLocalStream = (captureStream) => {
//   localScreen.srcObject = captureStream
//   localScreen.muted = true;
//   localScreen.onplay()
// }

startLocalScreen.addEventListener(
  "click",
  (e) => {
    startCapture();
  },
  false
);

stopLocalScreen.addEventListener(
  "click",
  (e) => {
    stopCapture();
  },
  false
);

startRemoteScreen.addEventListener(
  "click",
  (e) => {
    startRemoteCapture();
  },
  false
);

stopRemoteScreen.addEventListener(
  "click",
  (e) => {
    stopRemoteCapture();
  },
  false
);

init();
