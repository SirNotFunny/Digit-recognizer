window.addEventListener("load", () => {
    let model;
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;

    // Load model
    async function loadModel() {
        model = await tf.loadLayersModel("model/model.json");
        console.log("Model loaded!");
    }
    loadModel();

    // Drawing logic (mouse)
    canvas.addEventListener("mousedown", e => {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener("mouseup", () => {
        isDrawing = false;
        ctx.beginPath();
    });

    canvas.addEventListener("mouseleave", () => {
        isDrawing = false;
        ctx.beginPath();
    });

    canvas.addEventListener("mousemove", draw);

    function draw(event) {
        if (!isDrawing) return;

        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";

        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
    }

    // Clear canvas
    document.getElementById("clearBtn").onclick = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        document.getElementById("result").innerText = "Prediction:";
    };

    // Predict
    document.getElementById("predictBtn").onclick = async () => {
        const imgData = ctx.getImageData(0, 0, 280, 280);

        const tensor = tf.browser.fromPixels(imgData, 1)
            .resizeBilinear([28, 28])
            .toFloat()
            .div(255.0)
            .reshape([1, 28, 28, 1]);

        const prediction = model.predict(tensor);
        const result = prediction.argMax(1).dataSync()[0];

        document.getElementById("result").innerText = "Prediction: " + result;
    };
});

document.getElementById("predictBtn").onclick = async () => {
    if (!model) {
        console.error("MODEL NOT LOADED");
        document.getElementById("result").innerText = "Prediction: (model not loaded)";
        return;
    }
}