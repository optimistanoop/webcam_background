const videoElement = document.getElementById('video');
const canvas = document.getElementById('canvas');

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const blurBtn = document.getElementById('blur-btn');
const unblurBtn = document.getElementById('unblur-btn');
const bgBtn = document.getElementById('bg-btn');
const unbgBtn = document.getElementById('unbg-btn');

const ctx = canvas.getContext('2d');

startBtn.addEventListener('click', e => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  unblurBtn.disabled = false;
  blurBtn.disabled = false;
  bgBtn.disabled = false;
  unbgBtn.disabled = false;

  startVideoStream();
});

stopBtn.addEventListener('click', e => {
  startBtn.disabled = false;
  stopBtn.disabled = true;

  unblurBtn.disabled = true;
  blurBtn.disabled = true;

  unbgBtn.disabled = true;
  bgBtn.disabled = true;

  unblurBtn.hidden = true;
  blurBtn.hidden = false;

  videoElement.hidden = false;
  canvas.hidden = true;

  stopVideoStream();
});

blurBtn.addEventListener('click', e => {
  blurBtn.hidden = true;
  unblurBtn.hidden = false;

  videoElement.hidden = true;
  canvas.hidden = false;

  loadBodyPixWithBlurr();
});

unblurBtn.addEventListener('click', e => {
  blurBtn.hidden = false;
  unblurBtn.hidden = true;

  videoElement.hidden = false;
  canvas.hidden = true;
});

bgBtn.addEventListener('click', e => {
  bgBtn.hidden = true;
  unbgBtn.hidden = true;

  videoElement.hidden = true;
  canvas.hidden = false;

  loadBodyPixWithBg();
});

unbgBtn.addEventListener('click', e => {
  bgBtn.hidden = false;
  unbg.hidden = true;

  videoElement.hidden = false;
  canvas.hidden = true;
});

videoElement.onplaying = () => {
  canvas.height = videoElement.videoHeight;
  canvas.width = videoElement.videoWidth;
};

function startVideoStream() {
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(stream => {
      videoElement.srcObject = stream;
      videoElement.play();
    })
    .catch(err => {
      startBtn.disabled = false;
      blurBtn.disabled = true;
      bgBtn.disabled = true;
      stopBtn.disabled = true;
      alert(`Following error occured: ${err}`);
    });
}

function stopVideoStream() {
  const stream = videoElement.srcObject;

  stream.getTracks().forEach(track => track.stop());
  videoElement.srcObject = null;
}

function loadBodyPixWithBlurr() {
  options = {
    multiplier: 0.75,
    stride: 32,
    quantBytes: 4
  }
  bodyPix.load(options)
    .then(net => performBlurr(net))
    .catch(err => console.log(err))
}

async function performBlurr(net) {

  while (startBtn.disabled && blurBtn.hidden) {
    const segmentation = await net.segmentPerson(video);

    const backgroundBlurAmount = 6;
    const edgeBlurAmount = 2;
    const flipHorizontal = true;

    bodyPix.drawBokehEffect(
      canvas, videoElement, segmentation, backgroundBlurAmount,
      edgeBlurAmount, flipHorizontal);
  }
}

function loadBodyPixWithBg() {
  options = {
    multiplier: 0.75,
    stride: 32,
    quantBytes: 4
  }
  bodyPix.load(options)
    .then(net => performBg(net))
    .catch(err => console.log(err))
}

async function performBg(net) {

  while (startBtn.disabled && bgBtn.hidden) {
    const segmentation = await net.segmentPerson(video);
    drawBody(segmentation)
    // const coloredPartImage = bodyPix.toMask(segmentation);
    // const opacity = 0.7;
    // const maskBlurAmount = 0;
    // const flipHorizontal = false;
    // bodyPix.drawMask(canvas, videoElement, coloredPartImage, opacity, maskBlurAmount, flipHorizontal);
  }
}


function drawBody(personSegmentation){
    ctx.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
    let imageData = ctx.getImageData(0,0, videoElement.width, videoElement.height);
    let pixel = imageData.data;
    for (let p = 0; p<pixel.length; p+=4){
      if (personSegmentation.data[p/4] == 0) {
          pixel[p+3] = 0;
      }
    }
    ctx.imageSmoothingEnabled = true;
    ctx.putImageData(imageData,0,0);
}
