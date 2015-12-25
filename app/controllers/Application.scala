package controllers

import java.io.{File, PrintWriter}
import java.text.SimpleDateFormat

import org.apache.spark.{SparkContext, SparkConf}
import play.api._
import play.api.mvc._

import play.api.libs.json._

import scala.collection.mutable.ListBuffer


case class TwitterCount(date: String, topic: String, count: Int)

case class TwitterContent(content: String)

class Application extends Controller {

  implicit val twitterCountWrites = new Writes[TwitterCount] {
    def writes(twitterCount: TwitterCount) = Json.obj(
      "date" -> twitterCount.date,
      "key" -> twitterCount.topic,
      "value" -> twitterCount.count
    )
  }
 // val filePaths = Seq("public/data/leaders.csv", "public/data/raw_twitter.csv")

  val filePaths = Seq("public/data/raw_twitter.csv")

  def index = Action {
    Ok(views.html.index("Congraration, your new application is ready."))
  }

  def twitter = Action {
    Ok(views.html.twitter("Twitter"))
  }

  def refresh = Action { request =>
    //println(request.body)
    val format = new SimpleDateFormat("yyyy-MM-dd")
    val startDate = format.parse(request.body.asFormUrlEncoded.get("start")(0))
    val endDate = format.parse(request.body.asFormUrlEncoded.get("end")(0))

    val sparkConf = new SparkConf().setMaster("local[4]").setAppName("twitterVisual")
    sparkConf.set("spark.driver.allowMultipleContexts", "true")

    val sc = new SparkContext(sparkConf)

    val leader_twitterMaps = filePaths.map(path => {
      val csvRdd = sc.textFile(path)
      val csvHeaderAndRows = csvRdd.map(line => line.split(",").map(_.trim))
      val csvHeader = csvHeaderAndRows.first
      val cvsData = csvHeaderAndRows.filter(_(0) != csvHeader(0))
      cvsData.map(splits => csvHeader.zip(splits).toMap)
    })

    val betweenTwitters = leader_twitterMaps(0).filter(item => {
      val datetime = format.parse(item("date"))
      if(datetime.compareTo(startDate) >= 0 && datetime.compareTo(endDate) <=0)
        true
      else{
        false
      }
    })
    val allTwitterCount = betweenTwitters.count

    var twitterCountList = new ListBuffer[TwitterCount]()

    val twitterSample = betweenTwitters.takeSample(false, 10).map(item => item("content"))

    val twitterPairRDD = betweenTwitters.map(item => (item("date"), item("topic")) -> 1)

    val date_topic_count = twitterPairRDD.reduceByKey(_ + _)


    date_topic_count.sortByKey().collect().foreach(i => {
      val t = TwitterCount(i._1._1, i._1._2, i._2)
      twitterCountList += t
    })

    val outputJsonFile = new PrintWriter(new File("public/data/t2.json"))
    outputJsonFile.write(Json.toJson(twitterCountList).toString())
    outputJsonFile.close()

    sc.stop()

    Ok(Json.obj("twitterCount" -> allTwitterCount,
         "twitterSample" -> Json.toJson(twitterSample)))
  }

  def words = Action { request =>

    Ok("ok")
  }

}

