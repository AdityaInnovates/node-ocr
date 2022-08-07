var express = require("express");
var { createWorker } = require("tesseract.js");
var path = require("path");
var fs = require("fs");

const app = express();

// for parsing json data
app.use(express.json());

// for parsing multiform data
app.use(
  express.urlencoded({
    extended: false,
  })
);

// destination.txt will be created or overwritten by default.
// fs.copyFile("./eng.traineddata", "/tmp/eng.traineddata", (err) => {
//   if (err) throw err;
//   console.log("source.txt was copied to destination.txt");
// });

app.use("/public", express.static(path.join(__dirname + "/public")));
app.use(express.static(__dirname + "/"));
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./index.html"));
});

// api Routes
app.get("/api", (req, res) => {
  res.send("not allowed");
});
app.post("/api", (req, res) => {
  const worker = createWorker({
    // logger: m => console.log(m)
    // langPath: "tmp",
    // cacheMethod: "none",
    // gzip: false,
  });

  (async () => {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(
      `https://onlinetestseries.motion.ac.in/dashboard/img/testid-66665555137/${
        req.body.Q ? "Question" : "Solution"
      }_${req.body.ques}.jpg`
    );
    var newtext;
    if (!text.includes("Sol:")) {
      newtext = text.replace("Answer:", "").trim();
    } else {
      newtext = text.split("Sol:")[0].replace("Answer:", "").trim();
    }
    res.send(newtext);
    await worker.terminate();
  })();
});

app.listen(process.env.PORT || 8080, () => {
  console.log(
    `listen started on ${process.env.PORT ? process.env.PORT : "8080"}`
  );
});
