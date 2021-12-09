export var instructions = [
  {
    foreground: "big_rabbit.png",
    isVideo: "0",
    text: {
      en:"This is the little rabbit Maxi.  <br><br>He is very hungry and carrots are his favorite food.  <br><br>Maxi is looking for carrots to eat."
    },
    textDelay: "1",
    x:"45%",
    y:"30%",
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
      to: "100",
      duration: "1"
    },
    text: {
      en: "There is a path in the forest. Along the path, there are some cards. <br> Maxi will follow the path looking for carrots."
    },
    textDelay: "2",
    x:"50%",
    y:"5%",
    image_x: "-10%",
    image_y: "0",
    image_width: "200px",
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
    y:"10%",
    textAlign: "center",
    image_x: 0,
    image_y: 0,
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
    y:"10%",
    textAlign: "center",
    image_x: "1367px",
    image_y: 0,
    image_width: "1366px",
    imgfadeOut: "0"
  },
  {
    bgColor: "rgba(0,0,0,0)",
    foreground: "big_rabbit.png",
    animation: {
      property: "y",
      to: "100",
      duration: "2"
    },
    isVideo: "0",
    text: {
      en:"Maxi knows that it is just as likely to <br> find food under a card as it is to not <br>find food under a card.."
    },
    textDelay: "0",
    x:"50%",
    y:"10%",
    textAlign: "center",
    image_x: "50%",
    image_y: "-100%",
    image_width: "400px",
    imgfadeOut: "1"
  },
  {
    background: "path.png",
    foreground: "big_rabbit.png",
    animation: {
      property: "y",
      to: "800",
      duration: "2"
    },
    isVideo: "0",
    text: {
      en:"Should we help Maxi guess if he will find something to eat or if he won’t find something to eat under each card?"
    },
    textDelay: "1",
    x:"10%",
    y:"80%",
    textAlign: "left",
    image_x: "80%",
    image_y: "110%",
    image_width: "800px",
    imgfadeOut: "1"
  }
]
