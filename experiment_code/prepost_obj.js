/**
* prepost_obj.js
* Ata Karagoz
*
* Plugin for generating list of object_stimuli pairings for similarity rating task
*
**/
// prepost_obj.js
var post_obj = [
	{ stimulus_1: 'stimuli/object_01.png', stimulus_2: 'stimuli/object_02.png' },
	{ stimulus_1: 'stimuli/object_01.png', stimulus_2: 'stimuli/object_03.png' },
	{ stimulus_1: 'stimuli/object_01.png', stimulus_2: 'stimuli/object_04.png' },
	{ stimulus_1: 'stimuli/object_01.png', stimulus_2: 'stimuli/object_05.png' },
	{ stimulus_1: 'stimuli/object_01.png', stimulus_2: 'stimuli/object_06.png' },
	{ stimulus_1: 'stimuli/object_02.png', stimulus_2: 'stimuli/object_01.png' },
	{ stimulus_1: 'stimuli/object_02.png', stimulus_2: 'stimuli/object_03.png' },
	{ stimulus_1: 'stimuli/object_02.png', stimulus_2: 'stimuli/object_04.png' },
	{ stimulus_1: 'stimuli/object_02.png', stimulus_2: 'stimuli/object_05.png' },
	{ stimulus_1: 'stimuli/object_02.png', stimulus_2: 'stimuli/object_06.png' },
	{ stimulus_1: 'stimuli/object_03.png', stimulus_2: 'stimuli/object_01.png' },
	{ stimulus_1: 'stimuli/object_03.png', stimulus_2: 'stimuli/object_02.png' },
	{ stimulus_1: 'stimuli/object_03.png', stimulus_2: 'stimuli/object_04.png' },
	{ stimulus_1: 'stimuli/object_03.png', stimulus_2: 'stimuli/object_05.png' },
	{ stimulus_1: 'stimuli/object_03.png', stimulus_2: 'stimuli/object_06.png' },
	{ stimulus_1: 'stimuli/object_04.png', stimulus_2: 'stimuli/object_01.png' },
	{ stimulus_1: 'stimuli/object_04.png', stimulus_2: 'stimuli/object_02.png' },
	{ stimulus_1: 'stimuli/object_04.png', stimulus_2: 'stimuli/object_03.png' },
	{ stimulus_1: 'stimuli/object_04.png', stimulus_2: 'stimuli/object_05.png' },
	{ stimulus_1: 'stimuli/object_04.png', stimulus_2: 'stimuli/object_06.png' },
	{ stimulus_1: 'stimuli/object_05.png', stimulus_2: 'stimuli/object_01.png' },
	{ stimulus_1: 'stimuli/object_05.png', stimulus_2: 'stimuli/object_02.png' },
	{ stimulus_1: 'stimuli/object_05.png', stimulus_2: 'stimuli/object_03.png' },
	{ stimulus_1: 'stimuli/object_05.png', stimulus_2: 'stimuli/object_04.png' },
	{ stimulus_1: 'stimuli/object_05.png', stimulus_2: 'stimuli/object_06.png' },
	{ stimulus_1: 'stimuli/object_06.png', stimulus_2: 'stimuli/object_01.png' },
	{ stimulus_1: 'stimuli/object_06.png', stimulus_2: 'stimuli/object_02.png' },
	{ stimulus_1: 'stimuli/object_06.png', stimulus_2: 'stimuli/object_03.png' },
	{ stimulus_1: 'stimuli/object_06.png', stimulus_2: 'stimuli/object_04.png' },
	{ stimulus_1: 'stimuli/object_06.png', stimulus_2: 'stimuli/object_05.png' },
];


var practice_objs = [
	{ stimulus_1: 'stimuli/practice_object_01.png', stimulus_2: 'stimuli/practice_object_02.png'},
	{ stimulus_1: 'stimuli/practice_object_01.png', stimulus_2: 'stimuli/practice_object_03.png'},
	{ stimulus_1: 'stimuli/practice_object_01.png', stimulus_2: 'stimuli/practice_object_04.png'},
]

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function arr_compress(array) {
	var my_array = [[array[0],array[1]],[array[2],array[3]],[array[4],array[5]],[array[6],array[7]]]

	return my_array;
}

function add_image_ending(array) {
	var my_array = []
	for (var i =0; i< array.length; i++) {
		if (array[i].slice(0,3) == 'des') {
			my_array[i] = 'stimuli/' + array[i] + '.jpg'
		} else if (array[i].slice(0,3)=='for') {
			my_array[i] = 'stimuli/' + array[i] + '.jpg'
		} else if (array[i].slice(0,3)=='lib'){
			my_array[i] = 'stimuli/' + array[i] + '.jpg'
		} else if (array[i].slice(0,3)=='res'){
			my_array[i] = 'stimuli/' + array[i] + '.jpg'
		}

	}
	return my_array
}

function add_object_ending(array) {
	var my_array = []
	for (var i =0; i< array.length; i++) {
		my_array[i] = 'stimuli/' + array[i] + '.png'
	}
	return my_array
}

function make_image_dict(array) {
	var my_array = []
	for (var i=0; i< array.length; i++){
		current = {stimuli: array[i]}
		my_array.push(current)
	}
	return my_array
}


Array.prototype.duplicate = function() {

  var len = this.length;

  for (var i = 0; i < len; i++) {
    this[len + i] = this[i];
  }

  return this;
}
// Shuffling objects to place into the 10 separate slots for study
// var objects_arr = ['object_01','object_02','object_03','object_04','object_05','object_06','object_07','object_08','object_09','object_10']
var objects_arr = ['object_01','object_02','object_03','object_04','object_05','object_06']
var p_objects_arr = ['practice_object_01','practice_object_02','practice_object_03','practice_object_04','practice_object_05','practice_object_06']
var shuffled_obj = shuffle(objects_arr)
var object_file_paths = add_object_ending(objects_arr)
var p_object_file_paths = add_object_ending(p_objects_arr)
// var test_objs = arr_compress(shuffled_obj)
var test_objs = shuffled_obj.slice(0, 4)
// var test_objs_dict = make_image_dict(add_object_ending(test_objs))
// var rew_objs = [shuffled_obj[8],shuffled_obj[9]]
var rew_objs = [shuffled_obj[4], shuffled_obj[5]]
// var rew_objs_dict = make_image_dict(add_object_ending(rew_objs))

var second_stage_backgrounds = ['stimuli/red_planet.jpg','stimuli/purple_planet.jpg']
// Shuffling images from the background stimulus sets

var desert_img = 'desert_1'

var forest_img = 'forest_1'

var library_img = 'library_1'

var restaurant_img = 'restaurant_1'

var number_of_trials = 200
var number_of_first_stage = 2

var numb_env_seen = number_of_trials/number_of_first_stage

var desert = new Array(numb_env_seen).fill(1);
var forest = new Array(numb_env_seen).fill(2);
var library = new Array(numb_env_seen).fill(3);
var restaurant = new Array(numb_env_seen).fill(4);

var rew_des = new Array(numb_env_seen).fill(desert_img)
var rew_for = new Array(numb_env_seen).fill(forest_img)
var rew_lib = new Array(numb_env_seen).fill(library_img)
var rew_res = new Array(numb_env_seen).fill(restaurant_img)

var task_backgrounds = {}
task_backgrounds["desert"] = rew_des
task_backgrounds["forest"] = rew_for
task_backgrounds["library"] = rew_lib
task_backgrounds["restaurant"] = rew_res

if (number_of_first_stage === 4) {
	var task_backgrounds_full = rew_des.concat(rew_for).concat(rew_lib).concat(rew_res)
	var task_backgrounds_types = desert.concat(forest).concat(library).concat(restaurant)

	var preload_backgrounds = [rew_des[0],rew_for[0],rew_lib[0], rew_res[0]]
	preload_backgrounds = add_image_ending(preload_backgrounds)

} else if (number_of_first_stage === 2){
	var task_backgrounds_full = rew_des.concat(rew_for) // if number of first-stages is 2 
	var task_backgrounds_types = desert.concat(forest)

	var preload_backgrounds = [rew_des[0], rew_for[0]]
	preload_backgrounds = add_image_ending(preload_backgrounds)
}
const zip = (arr1, arr2) => arr1.map((k, i) => [k, arr2[i]]);

var task_backgrounds_zip = zip(task_backgrounds_types,task_backgrounds_full)

task_backgrounds_zip = shuffle(task_backgrounds_zip)

var trial_number = 0 // setting trial_number

var high_arm = 1; // hardcoding high_arm though it doesn't matter

// var high_arm = Math.floor(Math.random() * 2) + 1 // if 1 high_arm is outdoor, if 2 high_arm is indoor // now removed

