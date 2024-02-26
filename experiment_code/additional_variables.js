var instructions_judge_1a_text =  ["<div align=center><div style = 'width:800px'>Great job! Now we are going to teach you how to do another part of our experiment.<br><br></div>"]
var instructions_judge_1b_text = ["<div align=center><div style = 'width:800px'>Think about all the objects you just saw in the task.<br><br>Specifically, think about what happened when you encountered and picked each object. <br><br>In the next part of this experiment, we are going to show you these objects in pairs, and ask you how related they feel to each other in terms of the task on a scale that goes from NOT AT ALL RELATED to VERY RELATED.<br><br>This may feel strange, but think about what the objects did (or did not) have in common in the task, and go with your gut.<br><br></div>"]
var instructions_judge_1c_text =["<div align=center><div style = 'width:800px'>You will now practice this task with objects that you didn't see previously just to get a sense of how it looks.<br><br></div>"]

var instructions_judge_2_text =["<div align=center><div style = 'width:800px'>You are now going to make these same judgments for the objects you saw in the previous task.<br><br>Again, this judgment may seem strange, but just go with your instinct.<br><br></div>"]

var instructions_1a_text =  ["<div align=center><div style = 'width:800px'>Hello! Welcome to our experiment, we will now teach you how to do the task for today.<br><br></div>"]
var instructions_1b_text = ["<div align=center><div style = 'width:800px'>In this task, you are going to travel to two different planets in order to look for space treasure.<br><br>These two planets will look like this:<br><br><img style='margin:0px auto;display:block;height:200px' src='stimuli/example_planets.png'/></div><br></div>"]
var instructions_1c_text =["<div align=center><div style = 'width:800px'>Each planet has one space treasure machine on it. If you arrive at a planet, you can use the machine there to earn space treasure.<br><br>This is what the space treasure machines will look like on the two planets:<br><br><img style='margin:0px auto;display:block;height:200px' src='stimuli/example_artifacts.png'/></div><br></div>"]

function instructions_1d_text(){
    return ["<div align=center><div style = 'width:800px'><div align=justify>How much a space treasure a machine can create depends on how good its fuel source is.<br><br>If a space treasure machine has a good fuel source, it will give a lot of space treasure:<br><br><img style='margin:0px auto;display:block' src='stimuli/treasure_"+max+".png'/><br>However, if a space treasure machine has a bad fuel source, it will give only a little treasure:<br><br><img style='margin:0px auto;display:block' src='stimuli/treasure_1.png'/><br>Sometimes, a machine has no fuel and give no treasure:<br><br><img style='margin:0px auto;display:block' src='stimuli/noreward.png'/><br>At the end of each trial, the pieces of space treasure that you earned will be converted to points. Each piece of space treasure will be worth one point.<br><br>For example, if you were to get "+max+" pieces of treasure, you would earn "+max+" points, but if you were to get "+mean_rew+" "+piece_s+" of treasure, you would earn "+mean_rew+" "+point_s+".<br><br></div>"]
}

function instructions_1e_text(){
  return ["<div align=center><div style = 'width:800px'>Each time you visit a planet and you see a space treasure machine, you should press the SPACE key to interact with it. After you press the SPACE key, you will see how many pieces of treasure you earned.<br><br>Note that you only have to press the SPACE key once to interact with a machine.<br><br>Let's try practicing a few times.<br><br></div>"]
}

var instructions_2_text = ["<div align=center><div style = 'width:800px'>You may have noticed that this machine started out giving a lot of treasure, but that this got worse over time.<br><br>Indeed, how much treasure each machine gives will change over time in similar or different ways as you just saw.<br><br>To see this, you will practice interacting with another machine right now.<br><br></div>"];

var instructions_3a_text = ["<div align=center><div style = 'width:800px'>This machine did not give a lot of treasure at the beginning, but it then became better.<br><br>As in these two examples, all machines will follow a unique pattern in how much treasure they give over time.<br><br></div>"];

function instructions_3b_text(){
  return["<div align=center><div style = 'width:800px'>Now that you know about the treasure, you are ready to learn how to travel to the planets.<br><br>On each trial, you will travel from earth to one of two planets,<br>a green planet and a yellow planet:<br><br><img style='margin:0px auto;display:block;height:200px' src='stimuli/example_planets.png'/><br></div>"]
}
var instructions_3c_text = ["<div align=justify style = 'width:800px'>You will travel to these two planets by choosing between two teleporters on earth. If you touch a teleporter, it will immediately take you to either the green or the yellow planet.<br><br>There will be two pairs of teleporters, which you can see here:<br><img style='margin:0px auto;display:block;height:200px' src='stimuli/example_teleporters.png'/>On each trial, you will see one pair of teleporters. On some trials, you will be choosing between the two teleporters on the left, and on other trials you will be choosing between the two teleporters on the right.<br><br>The pair of teleporters will be presented side-by-side. You can choose the left teleporter by pressing the 'F' key and the right teleporter by pressing the 'J' key.<br><br>Each teleporter will zap you to one of the two planets. For each pair, one teleporter will <b>always</b> transport you to the yellow planet, and the other will <strong>always</strong> transport you to the green planet.<br><br></div>"]
// var instructions_3d_text = ["<div align=justify style = 'width:800px'>The pairs of teleporters will always appear at particular locations in the world. For these teleporters, one pair always appears in the gym, and the other pair always on the beach.<br><br></div>"]
var instructions_3d_text = ["<div align=justify style = 'width:800px'>Let's practice choosing teleporters to get to the planets! First, try to pick the teleporters that will get you to the yellow planet:<br><br><img style='margin:0px auto;display:block;height:200px' src='stimuli/yellow_planet.png'/><br></div>"]

var instructions_4_text = ["<div align=center style = 'width:800px'>Very good!<br><br>Now, try to pick the teleporters that will get you to the green planet:<br><br><img style='margin:0px auto;display:block;height:200px' src='stimuli/green_planet.png'/><br></div>"]

function instructions_5_text(){
  return ["<div align=center><div style = 'width:800px'>Great job! There's one more thing you need to learn before you can start the real experiment.<br><br>From now on, at the start of each trial you will see one of these two displays:<br><br><img style='margin:0px auto;display:block;height:100px' src='stimuli/example_values.png'/><br>These displays are called 'point multipliers'. They indicate that the points that you earn on that trial will be multiplied by the number on the display.<br><br>So, if you see the display that says '1x', and you would earn 6 pieces of treasures,<br>you would get 6 points.<br><br>However, if you see the display that says '5x', the stakes of that trial are raised. If you would earn 6 pieces of treasure, you would get 30 points!<br><br>The point multiplier will be presented in the upper left corner throughout the whole trial.<br><br></div>"]
}

function instructions_6a_text(){
  return["<div align = center style = 'width:800px'>You are now ready to start the real game!<br><br>You will earn 1 cent for every 5 points you earn in the real game. This means that you can earn up to $9 in this task.<br><br>From now on, there will be two new planets, a <b>red</b> one and a <b>purple</b> one, with two new space treasure machines. You will also see two new pairs of teleporters. So, you will have to figure which teleporter goes to which planet while playing the task.<br><br>All the other rules will be the same.<br><br></div>"]
}

var instructions_6b_text = ["<div align=center style = 'width:800px'><br><br>Remember, you want to find as much space treasure as you can by teleporting to planets and interacting with a space treasure machines.<br><br>How much treasure comes out of each machine changes slowly over time, so you need to concentrate and be flexible to keep track of which machines are good right now.<br><br>On each trial, you will see a points multiplier, which indicates that the points you earn on that trial will be multiplied by the number given on the display (1x or 5x).<br><br></div>"]

// var instructions_6c_text = ["<div align=center><div style = 'width:800px'><br><br>Each pair will appear in particular locations in the world. Two pairs will always be in locations that are <b>inside</b> a building: One pair will always appear in <b>restaurants</b>, and the other pair will always appear in <b>libraries</b>.<br><br> The other two pairs will always be in locations that are <b>outside</b>: One pair will always appear in <b>forests</b>, and the other pair will always appear in <b>deserts</b>.<br><br>The specific location of each pair will vary from trial to trial, but the type of location will not. So, if one pair of transporters appears in a desert, you will never see it in a forest, restaurant, or gym.</div></div>"]

function instructions_6c_text(){
  return["<div align=center><div style = 'width:800px'>The teleporters will always be on screen for 3 seconds, even after you already made a decision.<br><br>There will be "+nrtrials+" trials and you can take a break in the middle of the task.<br><br>The task will start after you press 'next', so make sure you have your fingers on the 'F' and the 'J' keys. Good luck!<br><br></div>"]
}

function createMemberInNormalDistribution(mean,std_dev){
  return mean + (gaussRandom()*std_dev);
}

/*
* Returns random number in normal distribution centering on 0.
* ~95% of numbers returned should fall between -2 and 2
*/

function gaussRandom() {
  var u = 2*Math.random()-1;
  var v = 2*Math.random()-1;
  var r = u*u + v*v;
  /*if outside interval [0,1] start over*/
  if(r == 0 || r > 1) return gaussRandom();

  var c = Math.sqrt(-2*Math.log(r)/r);
  return u*c;
}

function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

var assorted_images = [
'stimuli/gym_planet.png',
'stimuli/beach_planet.png',
'stimuli/yellow_planet.png',
'stimuli/green_planet.png',
'stimuli/purple/purple_planet.jpg',
'stimuli/red/red_planet.jpg',
'stimuli/example_artifacts.png',
'stimuli/example_planets.png',
'stimuli/example_teleporters.png',
'stimuli/noreward.png',
'stimuli/example_values.png',
'stimuli/5x.png',
'stimuli/1x.png',
'stimuli/treasure_0.png',
'stimuli/treasure_1.png',
'stimuli/treasure_2.png',
'stimuli/treasure_3.png',
'stimuli/treasure_4.png',
'stimuli/treasure_5.png',
'stimuli/treasure_6.png',
'stimuli/treasure_7.png',
'stimuli/treasure_8.png',
'stimuli/treasure_9.png',
'stimuli/object_01_grey.png',
'stimuli/object_02_grey.png',
'stimuli/object_03_grey.png',
'stimuli/object_04_grey.png',
'stimuli/object_05_grey.png',
'stimuli/object_06_grey.png',
'stimuli/object_07_grey.png',
'stimuli/object_08_grey.png',
'stimuli/object_09_grey.png',
'stimuli/object_10_grey.png',
'stimuli/practice_object_01_grey.png',
'stimuli/practice_object_02_grey.png',
'stimuli/practice_object_03_grey.png',
'stimuli/practice_object_04_grey.png',
'stimuli/practice_object_05_grey.png',
'stimuli/practice_object_06_grey.png',
// 'stimuli/5x.png',
// 'stimuli/1x.png',
];

/* a function that saves data in a mysql database */

function save_data(data, table) {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', 'write_data.php') // change 'write_data.php' to point to php script.
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onload = function() {
    console.log(xhr.responseText)
    if(xhr.status == 200){
      var response = JSON.parse(xhr.responseText)
      console.log(response.success)
    }
  }
  xhr.send('data=' + data + '&table=' + table)
}

function change_slider_data(img_data,slider_data) {
  var image_data_json = JSON.parse(img_data)
  var slider_data_json = JSON.parse(slider_data)
  // var stim1_arr = []
  // var stim2_arr = []
  // for (var i =0; i< image_data_json.length; i++) {
  //    if (i % 2 == 0) {
  //        stim1_arr.push(image_data_json[i]['stimulus'])
  //    } else if (i % 2 ==1) {
  //        stim2_arr.push(image_data_json[i]['stimulus'])
  //    }
  // }
  for (var i =0; i< slider_data_json.length; i++){
    slider_data_json[i]['stim1'] = image_data_json[i]['stim1']
    slider_data_json[i]['stim2'] = image_data_json[i]['stim2']
  }
  return(slider_data_json)
}

/* a function that allows removal of a specific value */

Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
