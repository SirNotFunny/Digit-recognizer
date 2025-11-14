window.addEventListener("load", () => {

    let model = null;
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;

    // ---- 1. Initialize canvas background ----
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ---- 2. Load model from GitHub Pages root ----
    async function loadModel() {
        try {
            console.log("Loading model...");
            model = await tf.loadLayersModel("./model.json"); 
            console.log("Model loaded successfully!");
        } catch (err) {
            console.error("Model load failed:", err);
        }
    }
    loadModel();

    // ---- 3. Drawing events ----
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

    // ---- 4. Clear button ----
    document.getElementById("clearBtn").onclick = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        document.getElementById("result").innerText = "Prediction:";
    };

    // ---- 5. Predict button ----
    document.getElementById("predictBtn").onclick = async () => {

        if (!model) {
            document.getElementById("result").innerText = "Prediction: (model not loaded)";
            console.error("MODEL NOT LOADED");
            return;
        }

        // 1. Get canvas image
        let imgData = ctx.getImageData(0, 0, 280, 280);

        // 2. Convert to tensor (grayscale)
        let tensor = tf.browser.fromPixels(imgData, 1).toFloat();

        // 3. Invert colors (MNIST = white digit on black bg)
        tensor = tf.sub(255, tensor);

        // 4. Resize + normalize
        tensor = tensor
            .resizeBilinear([28, 28])
            .div(255.0)
            .reshape([1, 28, 28, 1]);

        // 5. Predict
        const prediction = await model.predict(tensor).data();
        const result = prediction.indexOf(Math.max(...prediction));

        document.getElementById("result").innerText = "Prediction: " + result;
        console.log("Prediction vector:", prediction);
    };

});

