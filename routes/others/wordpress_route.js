const express = require("express");
const router = express.Router();
const connection = require("../../src/database/mysql_connection");
var HTMLParser = require("node-html-parser");
const logEvent = require("../../src/middleware/event_logging");

router.get("/blogs/info", async (req, res) => {
  //   let query = "select * from wordpress.wp_posts";
  let query =
    "SELECT * FROM wp_posts WHERE post_type='post' AND post_status='publish' ORDER BY post_date DESC";

  try {
    connection.query(query, (err, blogs, fields) => {
      if (err) {
        console.log(err);
      } else {
        let dataObject = [];
        blogs.forEach((blog) => {
          let parsed = HTMLParser.TextNode(blog.post_content)._rawText;
          let image = parsed.match(/<img[^>]+src="([^">]+)"/g);
          let imageSrc = image[0].match(/src="([^"]+)"/g);
          let imageUrl = imageSrc[0].match(/"([^"]+)"/g)[0].replace(/"/g, "");

          let content = parsed.split("<!-- /wp:image -->")[1];
          let plainText = content.replace(/<[^>]*>/g, "");
          let parsedBlogs = [];
          plainText.split("\n").forEach((item) => {
            if (item.trim() !== "") {
              parsedBlogs.push(item);
            }
          });
          dataObject.push({
            ...blog,
            post_content: parsedBlogs,
            post_image: imageUrl,
          });
        });
        // let parsed = HTMLParser.TextNode(blogs[0].post_content)._rawText;
        // let image = parsed.match(/<img[^>]+src="([^">]+)"/g);
        // let imageSrc = image[0].match(/src="([^"]+)"/g);
        // let imageUrl = imageSrc[0].match(/"([^"]+)"/g)[0].replace(/"/g, "");

        // let content = parsed.split("<!-- /wp:image -->")[1];
        // let plainText = content.replace(/<[^>]*>/g, "");
        // let parsedBlogs = [];
        // plainText.split("\n").forEach((item) => {
        //   if (item.trim() !== "") {
        //     parsedBlogs.push(item);
        //   }
        // });
        // let dataObject = [];
        // blogs.forEach((blog) => {
        //   dataObject.push({
        //     ...blog,
        //     post_content: parsedBlogs,
        //     post_image: imageUrl,
        //   });
        // });
        res.status(200).json({
          reason: "Scrapped Models Found Successfully",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: dataObject,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
