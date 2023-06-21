


const imageUpload = document.getElementById("imageUpload");
const detectedNames = [];

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
]).then(start);

async function start() {
  const container = document.createElement("div");
  // container.style.position = "relative";
  document.getElementById("image-upload").append(container);
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let image;
  let canvas;
  imageUpload.addEventListener("change", async () => {
    if (image) image.remove();
    if (canvas) canvas.remove();
    image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);
    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);

    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    console.log(detections);

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    console.log(resizedDetections);

    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );

    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });

      drawBox.draw(canvas);
      const name = result.label;
      detectedNames.push(name);
    });

    console.log(detectedNames);
    const data = document.querySelector("#student-count");
    const count = detections.length;
    data.innerText = count;
    const Table = document.getElementById("table");

    for (i = 0; i < count; i++) {
      var row = table.insertRow(-1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      
      const filteredData = roll_no.filter(item => detectedNames.includes(item.pn));
  
      if (filteredData.length > i) {
        const { roll_no, name } = filteredData[i];
        cell1.innerText = roll_no;
        cell2.innerText = name;
        cell2.setAttribute("name", "cellname");
      }
    }
  });
}

function loadLabeledImages() {
  const labels = [
    "anurag",
    "arsh",
    "deep",
    "divya",
    "harshit",
    "parteek",
    "abhishek chauhan",
    "abhishek jha",
    "aijaz",
    "aditya",
    "anuj",
    "arun",
    "ashutosh",
    "bipul",
    "dilip",
    "drishti",
    "harman",
    "harsh tandon",
    "harshit arora",
    "harshvardhan",
    "kiran",
    "kundan",
    "lalit",
    "manpreet",
    "manveen",
    "nisha",
    "palwinder",
    "pratham",
    "prince",
    "priyanka",
    "ram singh",
    "ravishankar",
    "ravikant",
    "sakshi",
    "shabroz",
    "shrishti",
    "siya",
    "vandana",
    "varnika",
    "varnit",
    "vasu arora",
    "yash",
  ];

  const labeledDescriptors = labels.map(async (label) => {
    const descriptions = [];

    for (let i = 1; i <= 2; i++) {
      const img = await faceapi.fetchImage(`./assets/labels/${label}/${i}.jpg`);
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      descriptions.push(detections.descriptor);
    }

    return new faceapi.LabeledFaceDescriptors(label, descriptions);
  });
  return Promise.all(labeledDescriptors);
}

function onClick() {
  while (table.rows.length > 1) {
    table.deleteRow(1);
    detectedNames.length = 0;
  }
}
console.log(detectedNames);
const cells = document.getElementsByName("cellname");
console.log(cells);

function convertArrayToExcel(data, detectedNames) {
  const headers = ['Roll No.', 'Name', 'Attendance'];
  const attendanceData = data.map((item, index) => {
    const { roll_no, name, pn } = item;
    const attendance = detectedNames.includes(pn) ? 'Present' : 'Absent';
    return {
      'Roll No.': roll_no,
      'Name': name,
      'Attendance': attendance,
    };
  });

 
  
  const worksheet = XLSX.utils.json_to_sheet(attendanceData, { header: headers});
  const workbook = XLSX.utils.book_new();


// Calculate the maximum width for each column
const columnWidths = headers.map((header, columnIndex) => {
  const columnData = attendanceData.map(row => row[header]);
  const maxColumnWidth = columnData.reduce((width, cell) => {
    const cellWidth = cell ? cell.toString().length : 0;
    return Math.max(width, cellWidth);
  }, header.length);
  return { wch: maxColumnWidth };
});

// Set the column widths in the worksheet
worksheet["!cols"] = columnWidths;


  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return excelBuffer;
}

function downloadExcelFile(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.click();
}


const button = document.getElementById('downloadButton');

button.addEventListener('click', function () {
  const array = detectedNames;
  const excelData = convertArrayToExcel(roll_no, array);
  downloadExcelFile(excelData, 'data.xlsx');
});
