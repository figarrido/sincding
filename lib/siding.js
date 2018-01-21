const cheerio = require("cheerio")
const iconv = require("iconv-lite")
const axios = require("axios")
const urls = require("./urls")
const course = require("./course")
const log = require("./log")

class Siding {
  static async coursesListFrom(session, url, ignore = []) {
    axios.defaults.responseType = "arraybuffer"
    axios.defaults.transformResponse = [
      data => iconv.decode(data, "ISO-8859-1"),
    ]
    await session.login()
    log("Getting courses list... ", { partial: true })
    const html = (await axios.get(url)).data
    return Siding.coursesListFromHtml(html, ignore)
  }

  static async currentCoursesList(session, ignore = []) {
    return await Siding.coursesFrom(session, urls.currentCoursesURL, ignore)
  }

  static coursesListFromHtml(html, ignore = []) {
    log("parsing... ", { partial: true })
    const courses = []
    const $ = cheerio.load(html)
    $("a").each((i, l) => {
      const link = $(l).attr("href")
      if (link.indexOf("id_curso_ic") === -1) {
        return
      }
      const courseId = link.split("id_curso_ic=")[1]
      const courseText = $(l).text()
      const courseSplit = courseText.split(/ s\.[0-9] /)
      const courseSection = courseText.split(" ")[1].match(/\d+/)[0]
      const courseAcronym = courseSplit[0]
      if (ignore.indexOf(courseAcronym) !== -1) {
        return
      }
      const courseName = courseSplit[1]
      courses.push(
        new course(courseId, courseAcronym, courseName, courseSection)
      )
    })
    log.ok()
    return courses
  }
}

module.exports = Siding
