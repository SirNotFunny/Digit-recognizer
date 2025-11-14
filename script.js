window.addEventListener("load", () => {
    let model;
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;

    // 1) Make canvas white at the beginning
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2) Load model
    async function loadModel() {
        try {
            console.log("Loading model...");
            model = await tf.loadLayersModel("./model.json");
            console.log("Model loaded!", model);
        } catch (err) {
            console.error("MODEL LOAD ERROR:", err);
        }
    }
    loadModel();

    // 3) Drawing logic
    canvas.addEventListener("mousedown", e => {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener("mouseup", () => {
        isDrawing = false;
    });

    canvas.addEventListener("mouseleave", () => {
        isDrawing = false;
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

    // 4) Clear button
    document.getElementById("clearBtn").onclick = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        document.getElementById("result").innerText = "Prediction:";
    };

    // 5) Predict button
    document.getElementById("predictBtn").onclick = async () => {
        if (!model) {
            console.error("MODEL NOT LOADED YET");
            document.getElementById("result").innerText = "Model not loaded!";
            return;
        }

        const imgData = ctx.getImageData(0, 0, 280, 280);

        const tensor = tf.browser.fromPixels(imgData, 1)
            .resizeBilinear([28, 28])
            .toFloat()
            .div(255.0)
            .reshape([1, 28, 28, 1]);

        const prediction = model.predict(tensor);
        const result = prediction.argMax(1).dataSync()[0];

        document.getElementById("result").innerText = "Prediction: " + result;
        console.log("Prediction done:", result);
    };
});


