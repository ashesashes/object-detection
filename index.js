import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";


env.allowLocalModels = false;

const fileUpload = document.getElementById("file-upload");
const imageContainer = document.getElementById("image-container");
const status = document.getElementById("status");

status.textContent = "Loading model...";

const detector = await pipeline("object-detection", "Xenova/detr-resnet-50");

status.textContent = "Ready";

fileUpload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
  
    const reader = new FileReader();
  
    // Set up a callback when the file is loaded
    reader.onload = function (e2) {
      imageContainer.innerHTML = "";
    
        const image = new Image()
        image.onload = function() {

            const displayedImageWidth = image.clientWidth;
            const aspectRatio = image.naturalWidth / image.naturalHeight;
            const displayedImageHeight = displayedImageWidth / aspectRatio;
            const imageOffsetTop = image.offsetTop;
            detect(image, displayedImageWidth, displayedImageHeight, imageOffsetTop);
        }
      image.src = e2.target.result;
      imageContainer.appendChild(image);
      
    };
    reader.readAsDataURL(file);
  });


async function detect(img, displayedImageWidth, displayedImageHeight, imageOffsetTop) {
    status.textContent = "Analyzing...";
    const output = await detector(img.src, {
      threshold: 0.95,
      percentage: true,
    });
    status.textContent = "";
    console.log("output", output);
    
    const aspectRatio = img.naturalWidth / img.naturalHeight

    console.log("Displayed Width and Aspect Ratio:", displayedImageWidth, displayedImageHeight, aspectRatio)

    output.forEach(box => renderBox(box, displayedImageWidth, displayedImageHeight, imageOffsetTop))
  }

// Render a bounding box and label on the image
function renderBox({ box, label }, displayedImageWidth, displayedImageHeight, imageOffsetTop) {
    const { xmax, xmin, ymax, ymin } = box;

    const boxWidth = displayedImageWidth * (xmax - xmin)
    const boxHeight = displayedImageHeight * (ymax - ymin)
    const boxTop = (displayedImageHeight * ymin) + imageOffsetTop
    const boxLeft = displayedImageWidth * xmin
  
    // Generate a random color for the box
    const color = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, 0);
  
    // Draw the box
    const boxElement = document.createElement("div");
    boxElement.className = "bounding-box";
    Object.assign(boxElement.style, {
      borderColor: color,
      position: 'absolute',
      left: `${boxLeft}px`,
      top: `${boxTop}px`,
      width: `${boxWidth}px`,
      height: `${boxHeight}px`,
      zIndex: 2
    });
  
    // Draw the label
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    labelElement.className = "bounding-box-label";
    labelElement.style.backgroundColor = color;

  
    boxElement.appendChild(labelElement);
    imageContainer.appendChild(boxElement);
  }