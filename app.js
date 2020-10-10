// get reference to the video element
const videoContainer = document.querySelector("#videoContainer");
const video = document.querySelector("#video");
// emoji area
const emoji = document.querySelector(".emoji");
// body
const body = document.body;

// get all the models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startStreaming);

// get the stream from camera and
// stream to the video element
function startStreaming() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.log(err)
  );
}

// function to set emoji
function setEmoji(expression) {
  let str = "Melvin looks, ";
  if (expression.happy >= 0.6 && expression.happy <= 1) {
    body.className = "";
    str += "Happy 😃";
    emoji.innerHTML = str;
    body.classList.add("blue");
  }
  if (expression.neutral >= 0.6 && expression.neutral <= 1) {
    body.className = "";
    str += "Normal 🙂";
    emoji.innerHTML = str;
  }
  if (expression.sad >= 0.6 && expression.sad <= 1) {
    body.className = "";
    str += "Sad 😢";
    emoji.innerHTML = str;
    body.classList.add("dark");
  }
  if (expression.surprised >= 0.6 && expression.surprised <= 1) {
    body.className = "";
    str += "Surprised 🤩";
    emoji.innerHTML = str;
    body.classList.add("yellow");
  }
  if (expression.angry >= 0.6 && expression.angry <= 1) {
    body.className = "";
    str += "Angry 🤬";
    emoji.innerHTML = str;
    body.classList.add("red");
  }
}

// when video starts playing
// detect the emotions and play with it
video.addEventListener("play", () => {
  // create canvas from the faceapi
  // and append to the body
  const canvas = faceapi.createCanvasFromMedia(video);
  videoContainer.append(canvas);

  // make the canvas width and height
  // to match the video element
  const displaySize = {
    width: video.width,
    height: video.height,
  };
  faceapi.matchDimensions(canvas, displaySize);

  // draw elements on to the canvas and
  // update every 100 milliseconds
  setInterval(async () => {
    // get the details of the detected face
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // set appropriate emoji in the html
    setEmoji(detections[0].expressions);

    // resize the results to that of the video element
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // clear canvas and draw landmarks and 
    // other expressions details
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});
