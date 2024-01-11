const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");

const app = express();

require("dotenv").config();
let corsOptions = {
  origin: process.env.ORIGIN_URL,
  credentials: true,
};

app.use(cors(corsOptions));

// listen(서버띄울 포트번호, 띄운 후 실행할 코드)
app.listen(process.env.PORT, function () {
  console.log("hello world");
});

app.get("/pet", async function (req, res) {
  const getHTML = async () => {
    try {
      const headers = {
        "User-Agent": process.env.USER_API_HEADER,
      };
      const html = await axios.get(process.env.USER_API_URL, {
        headers,
      });
      let List = [];

      const $ = cheerio.load(html.data);
      const $bodyList = $(".table-responsive tr");
      $bodyList
        .filter((i, el) => $(el).find("td.result").has(".result-ac").length > 0)
        .map((i, el) => {
          List[i] = {
            problemNum: $(el).find("td a.problem_title").text(),
            problemLink: $(el).find("td a.problem_title").attr("href"),
            language: $(el).find("td.time").next("td").text(),
            solvedTime: new Date(
              $(el).find("td a.real-time-update").attr("title")
            ),
          };
        });
      return List;
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const lists = await getHTML();
  res.json(lists);
});

// 누군가 /pet으로 방문하면 pet관련된 안내문을 띄워주자
// app.get("경로", function (요청, 응답) {
//   응답.send("펫용품 쇼핑할 수 있는 사이트입니다.");
// });

// app.get("/beauty", function (req, res) {
//   res.send("뷰티용품 쇼핑할 수 있는 사이트입니다.");
// });

// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/index.html");
// });
