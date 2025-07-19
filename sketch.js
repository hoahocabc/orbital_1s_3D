let numDots; // Không thiết lập giá trị mặc định ở đây
let autoRotate = false;
let rotationOffset = 0; // Tổng góc xoay đã tích lũy
let electronPositions = [];
let cameraZ = 300;
let overlayOn = false;

let playButton, rotateButton, overlayButton, toggleElectronButton, toggleAxesButton;
let electronInput, timeInput, colorPicker;
let uiContainer;

let isPlaying = false;
let startTime = 0;
let timeToReveal = 5; // Thời gian để xuất hiện hết electron (giây)
let visibleElectrons = 0;

// Slider cho lớp phủ (độ trong suốt), lớp phủ (kích thước) và electron (kích thước)
let overlayAlphaSlider;
let overlaySizeSlider;
let electronSizeSlider;

let electronDistributionDiameter = 300; // Giá trị mặc định ban đầu

// Các biến điều khiển hiển thị electron và trục tọa độ
let showElectrons = true;
let showAxes = false; // Mặc định trục tọa độ tắt

function setup() {
  // Tạo container chính chứa UI và canvas, sắp xếp theo hàng ngang (flex)
  let mainContainer = createDiv();
  mainContainer.style("display", "flex");
  mainContainer.style("justify-content", "center");
  mainContainer.style("gap", "20px");
  
  // Tạo container UI, đặt bên trái, cố định chiều cao 450px (theo mẫu code gốc)
  uiContainer = createDiv();
  uiContainer.id("uiContainer");
  uiContainer.style("width", "330px");
  uiContainer.style("height", "420px");
  uiContainer.style("background-color", "#fff");
  uiContainer.style("padding", "10px");
  uiContainer.style("border-radius", "5px");
  uiContainer.style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.2)");
  uiContainer.style("display", "flex");
  uiContainer.style("flex-direction", "column");
  uiContainer.style("gap", "10px");
  
  mainContainer.child(uiContainer);
  
  // Row 1: Nút Play và nút Xoay cạnh nhau, cách nhau 10px.
  let row1 = createDiv();
  row1.style("display", "flex");
  row1.style("align-items", "center");
  
  playButton = createButton("Play");
  playButton.style("padding", "5px 10px");
  playButton.mousePressed(() => {
    // Đọc giá trị số electron từ ô nhập và chuyển thành số nguyên
    numDots = parseInt(electronInput.value());
    // Nếu không phải số, bỏ qua hành động play
    if (isNaN(numDots) || numDots <= 0) {
      alert("Vui lòng nhập một số electron hợp lệ!");
      return;
    }
    // Tạo electron theo số được nhập
    generateElectronPositions(numDots);
    // Reset biến để bắt đầu hiển thị electron dần dần
    isPlaying = true;
    startTime = millis();
    visibleElectrons = 0;
  });
  playButton.parent(row1);
  
  rotateButton = createButton("Xoay");
  rotateButton.style("padding", "5px 10px");
  // Cách nút Play 10px
  rotateButton.style("margin-left", "10px");
  rotateButton.mousePressed(() => {
    autoRotate = !autoRotate;
  });
  rotateButton.parent(row1);
  row1.parent(uiContainer);
  
  // Row 2: Nút bật/tắt lớp phủ.
  let row2 = createDiv();
  overlayButton = createButton("Bật/Tắt lớp phủ");
  overlayButton.style("padding", "5px 10px");
  overlayButton.mousePressed(() => overlayOn = !overlayOn);
  overlayButton.parent(row2);
  row2.parent(uiContainer);
  
  // Row 3: Nút bật/tắt electron.
  let row3 = createDiv();
  toggleElectronButton = createButton("Bật/Tắt electron");
  toggleElectronButton.style("padding", "5px 10px");
  toggleElectronButton.mousePressed(() => showElectrons = !showElectrons);
  toggleElectronButton.parent(row3);
  row3.parent(uiContainer);
  
  // Row 4: Nút bật/tắt trục tọa độ.
  let row4 = createDiv();
  toggleAxesButton = createButton("Bật/Tắt trục tọa độ");
  toggleAxesButton.style("padding", "5px 10px");
  toggleAxesButton.mousePressed(() => showAxes = !showAxes);
  toggleAxesButton.parent(row4);
  row4.parent(uiContainer);
  
  // Row 5: Nhãn Độ trong suốt lớp phủ + Thanh trượt Độ trong suốt lớp phủ.
  let row5 = createDiv();
  row5.style("display", "flex");
  row5.style("align-items", "center");
  row5.style("gap", "10px");
  createSpan("Độ trong suốt lớp phủ:").parent(row5);
  overlayAlphaSlider = createSlider(0, 255, 150);
  overlayAlphaSlider.style("width", "150px");
  overlayAlphaSlider.parent(row5);
  row5.parent(uiContainer);
  
  // Row 6: Nhãn Kích thước lớp phủ + Thanh trượt Kích thước lớp phủ.
  let row6 = createDiv();
  row6.style("display", "flex");
  row6.style("align-items", "center");
  row6.style("gap", "10px");
  createSpan("Kích thước lớp phủ:").parent(row6);
  overlaySizeSlider = createSlider(50, 600, 300);
  overlaySizeSlider.style("width", "150px");
  overlaySizeSlider.parent(row6);
  row6.parent(uiContainer);
  
  // Row 7: Nhãn Kích thước electron + Thanh trượt Kích thước electron.
  let row7 = createDiv();
  row7.style("display", "flex");
  row7.style("align-items", "center");
  row7.style("gap", "10px");
  createSpan("Kích thước electron:").parent(row7);
  electronSizeSlider = createSlider(0.5, 10, 1.5, 0.1);
  electronSizeSlider.style("width", "150px");
  electronSizeSlider.parent(row7);
  row7.parent(uiContainer);
  
  // Row 8: Nhãn Số electron + Ô nhập Số electron.
  let row8 = createDiv();
  row8.style("display", "flex");
  row8.style("align-items", "center");
  row8.style("gap", "5px");
  createSpan("Số electron:").parent(row8);
  electronInput = createInput("");
  electronInput.attribute("placeholder", "Nhập số electron");
  electronInput.style("width", "100px");
  electronInput.parent(row8);
  row8.parent(uiContainer);
  
  // Row 9: Nhãn Thời gian (giây) + Ô nhập Thời gian (giây).
  let row9 = createDiv();
  row9.style("display", "flex");
  row9.style("align-items", "center");
  row9.style("gap", "5px");
  createSpan("Thời gian (giây):").parent(row9);
  timeInput = createInput("5");
  timeInput.style("width", "50px");
  timeInput.parent(row9);
  row9.parent(uiContainer);
  
  // Row 10: Nhãn Chọn màu electron + Nút bảng Chọn màu electron.
  let row10 = createDiv();
  row10.style("display", "flex");
  row10.style("align-items", "center");
  row10.style("gap", "10px");
  createSpan("Chọn màu electron:").parent(row10);
  colorPicker = createColorPicker("#FBF5F5");
  colorPicker.parent(row10);
  row10.parent(uiContainer);
  
  // Hàng cuối cùng: Ghi chú về cách sử dụng
  let row11 = createDiv();
  row11.style("font-size", "12px");
  row11.style("color", "#333");
  row11.html(
    "- Nhập số electron vào ô \"Số electron:\" và bấm nút \"Play\" để chạy.<br>" +
    "- Bấm giữ chuột trái để xoay orbital.<br>" +
    "- Dùng con lăn chuột để phóng to/thu nhỏ.<br>" +
    "© HÓA HỌC ABC"
  );
  row11.parent(uiContainer);
  
  // Tạo container canvas, căn bên phải container UI, với kích thước 600x600px.
  let canvasContainer = createDiv();
  canvasContainer.style("width", "600px");
  canvasContainer.style("height", "600px");
  mainContainer.child(canvasContainer);
  
  let canvas = createCanvas(600, 600, WEBGL);
  canvas.parent(canvasContainer);
  canvas.style("z-index", "1");
  noStroke();

  // Không tạo electron ở đây, sẽ được tạo sau khi ấn nút Play
  overlaySizeSlider.value(electronDistributionDiameter);
}

function draw() {
  background(10);
  
  // Luôn kích hoạt điều khiển bằng chuột để người dùng có thể zoom và xoay.
  orbitControl();
  
  ambientLight(50);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  directionalLight(255, 255, 255, -0.5, -1, 0.5);
  pointLight(255, 255, 255, 0, 0, 300);
  
  push();
  // Áp dụng xoay theo rotationOffset, giữ lại vị trí khi tắt autoRotate.
  rotateY(rotationOffset);
  rotateX(rotationOffset * 0.5);
  
  // Nếu autoRotate bật, tăng giá trị rotationOffset từ từ.
  if (autoRotate) {
    rotationOffset += 0.01;
  }
  
  if (showAxes) {
    drawAxes();
  }
  
  drawNucleus();
  
  if (showElectrons) {
    drawOrbital();
  }
  
  if (overlayOn) {
    push();
    // Thêm nguồn sáng nhẹ chiếu từ góc dưới bên trái (directional light từ hướng (-1, -1, 0))
    directionalLight(150, 150, 200, -1, -1, 0);
    noStroke();
    fill(0, 119, 190, overlayAlphaSlider.value());
    let overlayDiameter = overlaySizeSlider.value();
    let overlayRadius = overlayDiameter / 2;
    sphere(overlayRadius, 200, 200);
    pop();
  }
  pop();
  
  if (isPlaying) {
    let elapsedTime = (millis() - startTime) / 1000;
    visibleElectrons = floor(map(elapsedTime, 0, timeToReveal, 0, numDots));
    visibleElectrons = constrain(visibleElectrons, 0, numDots);
    if (visibleElectrons >= numDots) {
      isPlaying = false;
    }
  }
}

function generateElectronPositions(count) {
  electronPositions = [];
  let rMin = 25; // Bán kính tối thiểu để tránh electron dính hạt nhân
  let maxR = 0;
  
  for (let i = 0; i < count; i++) {
    let r;
    do {
      r = abs(randomGaussian(60, 15));
      if (random(1) < 0.005) {
        r *= 1.5;
      }
    } while (r < rMin);
    
    if (r > maxR) {
      maxR = r;
    }
    
    let theta = random(TWO_PI);
    let cosPhi = random(-1, 1);
    let phi = acos(cosPhi);
    let x = r * sin(phi) * cos(theta);
    let y = r * sin(phi) * sin(theta);
    let z = r * cos(phi);
    let alpha = map(z, -100, 100, 50, 255);
    electronPositions.push({ x, y, z, alpha, r });
  }
  
  let modCount = floor(count * 0.02);
  for (let j = 0; j < modCount; j++) {
    let index = floor(random(0, count));
    let e = electronPositions[index];
    let currentR = e.r;
    let factor = random(1.05, 1.1);
    let newR = currentR * factor;
    let theta = atan2(e.y, e.x);
    let phi = acos(e.z / currentR);
    let newX = newR * sin(phi) * cos(theta);
    let newY = newR * sin(phi) * sin(theta);
    let newZ = newR * cos(phi);
    e.x = newX;
    e.y = newY;
    e.z = newZ;
    e.r = newR;
    e.alpha = map(newZ, -100, 100, 50, 255);
    if (newR > maxR) {
      maxR = newR;
    }
  }
  
  electronDistributionDiameter = maxR * 2;
}

function drawNucleus() {
  push();
  fill(255, 100, 100);
  sphere(10);
  pop();
}

function drawOrbital() {
  let col = colorPicker.color();
  let eSize = electronSizeSlider.value();
  
  for (let i = 0; i < visibleElectrons; i++) {
    let e = electronPositions[i];
    let distanceToCamera = dist(e.x, e.y, e.z, 0, 0, 0);
    let size = map(distanceToCamera, 50, 300, eSize * 1.0, eSize * 0.1);
    size = constrain(size, eSize * 0.1, eSize);
    push();
    fill(red(col), green(col), blue(col), e.alpha);
    ambientMaterial(red(col), green(col), blue(col));
    translate(e.x, e.y, e.z);
    sphere(size);
    pop();
  }
}

function drawAxes() {
  let axisLength = electronDistributionDiameter;
  let axisRadius = 0.5;
  
  push();
  // Trục X (màu đỏ)
  push();
  rotateZ(HALF_PI);
  fill(255, 0, 0);
  noStroke();
  cylinder(axisRadius, axisLength);
  pop();
  
  // Trục Y (màu xanh lá)
  push();
  fill(0, 255, 0);
  noStroke();
  cylinder(axisRadius, axisLength);
  pop();
  
  // Trục Z (màu xanh dương)
  push();
  rotateX(HALF_PI);
  fill(0, 0, 255);
  noStroke();
  cylinder(axisRadius, axisLength);
  pop();
  pop();
}