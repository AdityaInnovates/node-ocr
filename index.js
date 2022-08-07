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
    langPath: "tmp",
    cacheMethod: "none",
    gzip: false,
  });

  (async () => {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    if (req.body["motion-test"]) {
      const {
        data: { text },
      } = await worker.recognize(
        `https://onlinetestseries.motion.ac.in/dashboard/img/testid-66665555137/${
          req.body.Q ? "Question" : "Solution"
        }_${req.body.ques}.jpg`
      );
      var newtext;
      if (!req.body.Q) {
        if (req.body.onlyans) {
          if (!text.includes("Sol:")) {
            newtext = text.replace("Answer:", "").trim();
          } else {
            newtext = text.split("Sol:")[0].replace("Answer:", "").trim();
          }
        } else {
          newtext = text;
        }
      } else {
        newtext = text;
      }
      res.send(newtext);
    } else if (req.body.url) {
      var expression =
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
      var regex = new RegExp(expression);
      if (req.body.url.match(regex)) {
        const {
          data: { text },
        } = await worker.recognize(req.body.url);
        res.status(202).send(text);
      } else {
        res.status(404).send("use url in url field.");
      }
    } else {
      res.status(404).send("enter url");
    }

    await worker.terminate();
  })();
});

app.listen(process.env.PORT || 8080, () => {
  console.log(
    `listen started on ${process.env.PORT ? process.env.PORT : "8080"}`
  );
});
