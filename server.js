const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http")
const app = express();
const today = new Date();
const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1));

require("dotenv").config();
let corsOptions = {
  origin: process.env.ORIGIN_URL,
  credentials: true,
};

app.use(cors(corsOptions));

// listen(서버띄울 포트번호, 띄운 후 실행할 코드)
// app.listen(process.env.PORT, function () {
//   console.log("hello world");
// });

app.get("/achievement", async function (req, res) {
  const userID = req.query.id;
  const getHTML = async (topNum) => {
    const headers = {
      "User-Agent": process.env.USER_API_HEADER,
    };
    const html = await axios.get(
      process.env.USER_API_URL +
        userID +
        process.env.USER_API_URL_QUERY +
        `${topNum == null ? "" : `&top=${topNum}`}`,
      {
        headers,
      }
    );
    let List = [];

    const $ = cheerio.load(html.data);
    const $bodyList = $(".table-responsive tr");
    const $nextButton = $("#next_page");
    if ($nextButton.length) {
      topNum = $nextButton.attr("href").split("top=")[1];
    } else {
      topNum = null;
    }
    try {
      $bodyList
        .filter((i, el) => $(el).find("td.result").has(".result-ac").length > 0)
        .map((i, el) => {
          const date = $(el).find("td a.real-time-update").attr("title");
          if(oneYearAgo <= new Date(date.split(" ")[0])){
            List[i] = {
              problemNum: $(el).find("td a.problem_title").text(),
              problemLink: $(el).find("td a.problem_title").attr("href"),
              language: $(el).find("td.time").next("td").text(),
              solvedTime: date,
            };
          }else{
            throw List;
          }
        });
        return { List, topNum };
      } catch (error) {
        return { List, topNum: null };
      }
  };
  let topNum = null;
  let allLists = [];
  do {
    let lists = await getHTML(topNum);
    allLists = [...allLists, ...lists.List];
    topNum = lists.topNum;
  } while (topNum !== null);
  res.json(allLists);
});

app.get("/login", async function (req, res) {
  const getUser = async () => {
    try {
      const headers = {
        "User-Agent": process.env.USER_API_HEADER,
      };
      const html = await axios.get(
        process.env.LOGIN_API_URL + req.query.userId,
        {
          headers,
        }
      );
      return html.status;
    } catch (error) {
      return error.response.status;
    }
  };
  let result = await getUser();
  res.json(result);
});

module.exports.handler = serverless(app);