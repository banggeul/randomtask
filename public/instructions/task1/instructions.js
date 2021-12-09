export var instructions = [
  {
    foreground: "big_rabbit.png",
    isVideo: "0",
    text: {
      en:"This is the little rabbit Maxi.  <br><br>They are very hungry and carrots<br>are their favorite food.  <br><br>Maxi is looking for carrots to eat.",
      de:"something german"
    },
    textDelay: "1",
    x:"45%",
    y:"40%",
    image_x: "5%",
    image_y: "0",
    textAlign: "left",
    imgfadeOut: "1"
  },
  {
    background: "path.png",
    foreground: "politePose.png",
    isVideo: "0",
    animation: {
      property: "x",
      to: "350",
      duration: "3"
    },
    text: {
      en: "There is a path in the forest. Along the path, there are some cards. <br> Maxi will follow the path looking for carrots."
    },
    textDelay: "2",
    x:"50%",
    y:"82%",
    image_x: "-200px",
    image_y: "6%",
    image_width: "230px",
    textAlign: "center",
    imgfadeOut: "1"
  },
  {
    background: "flip_bg.png",
    foreground: "carrot_flip.mp4",
    isVideo: "1",
    text: {
      en:"Underneath some of the cards Maxi finds <br> a yummy carrot that looks like this…"
    },
    textDelay: "0",
    x:"50%",
    y:"82%",
    textAlign: "center",
    image_x: "0",
    image_y: "0",
    image_width: "1366px",
    imgfadeOut: "0"
  },
  {
    bgColor: "rgba(0,0,0,0)",
    foreground: "dirt_flip.mp4",
    isVideo: "1",
    text: {
      en:"And underneath some of the cards Maxi <br>finds nothing to eat that looks like this…"
    },
    textDelay: "0",
    x:"50%",
    y:"82%",
    textAlign: "center",
    image_x: "1367px",
    image_y: "0",
    image_width: "1366px",
    imgfadeOut: "0"
  },
  {
    bgColor: "rgba(0,0,0,0)",
    foreground: "big_rabbit.png",
    animation: {
      property: "y",
      to: "1350",
      duration: "2"
    },
    isVideo: "0",
    text: {
      en:"Maxi knows that it is just as likely to <br> find food under a card as it is to not <br>find food under a card.."
    },
    textDelay: "0",
    x:"50%",
    y:"82%",
    textAlign: "center",
    image_x: "39%",
    image_y: "-1000px",
    image_width: "600px",
    imgfadeOut: "1"
  },
  {
    background: "path.png",
    foreground: "big_rabbit.png",
    animation: {
      property: "y",
      to: "-1317",
      duration: "3"
    },
    isVideo: "0",
    text: {
      en:"Should we help Maxi guess if he will find something to eat or if he won’t find something to eat under each card?"
    },
    textDelay: "1",
    x:"10%",
    y:"82%",
    textAlign: "left",
    image_x: "62%",
    image_y: "1994px",
    image_width: "1000px",
    imgfadeOut: "1"
  }
]
