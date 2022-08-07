var express = require("express");
var { createWorker } = require("tesseract.js");

const app = express();

// for parsing json data
app.use(express.json());

// for parsing multiform data
app.use(
  express.urlencoded({
    extended: false,
  })
);

// api Routes
app.use("/api", (req, res) => {
  const worker = createWorker({
    logger: (m) => console.log(m),
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
