/**
* jspsych-memory-2step-stake-stim
* Ata Karagoz
* adapted from Bettina Bustos & Wouter Kool
* Plugin for displaying a novel3d object and category background version of the model-based/model-free Kool 2-step task with stakes.
* (Kool et al., Psychological Science, 2017).
*
**/

jsPsych.plugins["memory-2step-stake-stim"] = (function() {

	var plugin = {}

	plugin.info = {
		name: 'memory-2step-stake-stim',
		description: 'Plugin for displaying space and aliens of the Kool 2-step task with stakes.',
		parameters: {
			practice:{
				type:jsPsych.plugins.parameterType.INT,
				default: 0,
				description: 'Indicate whether current block is a practice block.'
			},
			rews:{
				type:jsPsych.plugins.parameterType.INT,
				default: [],
				instructions: 'Total treasure pieces or antimatter received. (upper arm)'
			},
			task_objs:{
				type:jsPsych.plugins.parameterType.INT,
				default: [],
				instructions: 'Total treasure pieces or antimatter received. (lower arm)'
			},
			rew_objs:{
				type:jsPsych.plugins.parameterType.INT,
				default: [],
				instructions: 'Total treasure pieces or antimatter received. (lower arm)'
			},
			task_bckgrnds:{
				type:jsPsych.plugins.parameterType.INT,
				default: [],
				instructions: 'Total treasure pieces or antimatter received. (lower arm)'
			},
			subid:{
				type:jsPsych.plugins.parameterType.INT,
				default: [],
				description: 'Subject ID'
			},
			stakes:{
				type:jsPsych.plugins.parameterType.INT,
				default: 1,
				description: 'The possible stake multipliers.'
			},
			low_arm_pstakes:{
				type:jsPsych.plugins.parameterType.INT,
				default: 1,
				description: 'The probability that each stake multiplier will occur high_reward.'
			},
			low_arm_pstakes:{
				type:jsPsych.plugins.parameterType.INT,
				default: 1,
				description: 'The probability that each stake multiplier will occur low_reward.'
			},
			//timing parameters
			feedback_time: {
				type: jsPsych.plugins.parameterType.INT,
				default: 500,
				description:'Length of time (ms) participant receives feedback.'
			},
			feedback_time2: {
				type: jsPsych.plugins.parameterType.INT,
				default: 200,
				description:'Length of time (ms) participant receives feedback.'
			},
			iti: {
				type: jsPsych.plugins.parameterType.INT,
				default:500,
				description: 'Length of time (ms) between trials.',
			},
			timeout_time: {
				type: jsPsych.plugins.parameterType.INT,
				default: 1500,
				description: 'Length of time (ms) participants view time out screen.'
			},
			timing_response:{
				type: jsPsych.plugins.parameterType.INT,
				default: 3000,
				description: 'Length of time (ms) to make a response.'
			},
			score_time:{
				type: jsPsych.plugins.parameterType.INT,
				default: 1500,
				description: 'Length of time (ms) total treasure pieces or antimatter are shown.'
			},
			totalscore_time:{
				type: jsPsych.plugins.parameterType.INT,
				default: 1500,
				description: 'Length of time (ms) the total score in points is displayed.'
			},
			stake_time:{
				type: jsPsych.plugins.parameterType.INT,
				default: 1000,
				description: 'Length of time (ms) stake is displayed.'
			},
			SOA:{
				type: jsPsych.plugins.parameterType.INT,
				default: 500,
				description: 'Length of time (ms) between stimuli.'
			},
			points_loop_time:{
				type: jsPsych.plugins.parameterType.INT,
				default: 100,
				description: 'Length of time (ms) each point increment is displayed.'
			}
		}
	}

	plugin.trial = function(display_element, trial) {
		trial_number = trial_number + 1
		var displayColor = '#0738db'
		var borderColor = '#197bff'
		var textColor = '#b8fff6'
		var stimsperstate = [[1,2],[3,4],[5,6],[7,8]]
		var state1 = task_backgrounds_zip[trial_number-1][0]
		var stims = jsPsych.randomization.repeat(stimsperstate[state1-1], 1)
		// var stim_objs = test_objs[state1-1]
		var part = -1
		var choice1 = -1
		var state2 = -1
		var state2_obj = 0
		var points = 0
		var stake = 1
		var backgrounds = ["desert","forest","library","restaurant"]


		if (trial.practice == 0) {
			var rand_background= backgrounds[state1-1];
			var state_names = [rand_background,"purple","red"];
			var state_colors = [
				[5, 157, 190],
				[115, 34, 130],
				[211, 0, 0]
			]
		} else {
			var rand_background= backgrounds[state1-1];
			var state_names = [rand_background,"purple","red"];
			var state_colors = [
				[5, 157, 190],
				[115, 34, 130],
				[211, 0, 0]
			]
		}

		//randomly pick a stake multiplier

		stake_p = Math.random() // all arms now treated as low arm
			for (var i = 0; i <= trial.stakes.length; i++){
				if (stake_p <= trial.high_arm_pstakes[i]) {
					var stake = trial.stakes[i]
					break
				}
			}

		// store responses
		var setTimeoutHandlers = []
		var keyboardListener = new Object
		var response = new Array(2)
		for (var i = 0; i < 2; i++) {
			response[i] = {rt: -1, key: -1}
		}

		var state = 0
		var both_choices = [["f","j"],[" "]]
		var choices = new Array

		var points_loop_counter = 0

		var points_loop = function() {
			if (points_loop_counter < Math.abs(points)) {
				points_loop_counter = points_loop_counter + 1
				display_stimuli(3)
				var handle_points_loop = jsPsych.pluginAPI.setTimeout(function() {
					points_loop()
				}, trial.points_loop_time)
				setTimeoutHandlers.push(handle_points_loop)
			} else {
				if (trial.practice == 0){
					score = score + points*stake
				}
				end_trial()
			}
		}

		// function to end trial
		var end_trial = function(){

			kill_listeners()
			kill_timers()
			// gather the data to store for the trial
			var trial_data = {
				"state1": state1,
				"stim_left": test_objs[stims[0]-1],
				"stim_right": test_objs[stims[1]-1],
				"rt_1": response[0].rt,
				"choice1": choice1,
				"response1": response[0].key,
				"rt_2": response[1].rt,
				"points": points,
				"state2": state2,
				"stim_state2":state2_obj,
				"stake": stake,
				"score": score,
				"practice": trial.practice,
				"rews1": trial.rews[0],
				"rews2": trial.rews[1],
				"background":task_backgrounds_zip[trial_number-1][1],
				"high_arm": high_arm
			}

			var handle_totalscore = setTimeout(function() {
				display_element.innerHTML = ''; 	// clear the display

				// finish the current trial
				var handle_iti = jsPsych.pluginAPI.setTimeout(function() {
					jsPsych.finishTrial(trial_data)
				}, trial.iti)
				setTimeoutHandlers.push(handle_iti)
			}, trial.totalscore_time)
			setTimeoutHandlers.push(handle_totalscore)
		}

		//function to handle responses by the subject
		var after_response = function(info){

			kill_listeners()
			kill_timers()

			// only record the first response
			if (response[part].key == -1){
				response[part] = info
			}

			display_stimuli(2) // feedback

			if (trial.timing_response>0) {
				var extra_time = trial.timing_response-response[part].rt
			} else {
				var extra_time = 0
			}
			if (state == 0) { // determine second-stage state
				if(info.key == 'f'){ // left response
					choice1 = stims[0]
				} else { // right response
					choice1 = stims[1]
				}
				if ((choice1 == 1) || (choice1 == 3)) { // second-stage transition
					state2 = 1 // high reward arm second stage 1
					state2_obj = rew_objs[0]
				} else  if ((choice1 == 2) || (choice1 == 4)){
					state2 = 2 // high reward arm second stage 2
					state2_obj = rew_objs[1]
				} else if ((choice1 == 5) || (choice1 == 7)){
					state2 = 1 //low reward arm second stage 1
					state2_obj = rew_objs[0]
				} else {
					state2 = 2 //low reward arm second stage 2
					state2_obj = rew_objs[1]
				}
				state = state2

				var handle_feedback = jsPsych.pluginAPI.setTimeout(function() {
					display_element.innerHTML = '' // clear screen
					next_part()
				}, trial.feedback_time+extra_time)
				setTimeoutHandlers.push(handle_feedback)
			} else { // show feedback
				if ((state == 1) || (state == 2)) {
					points = trial.rews[state-1]
					// console.log(points)
				} else if ((state == 3) || (state == 4)) {
					points = trial.rews[state-1]
					// console.log(points)
				}
				display_stimuli(2)

				var handle_feedback = jsPsych.pluginAPI.setTimeout(function() {
					display_stimuli(3)
					var handle_scoretime = jsPsych.pluginAPI.setTimeout(function() {
						points_loop()
					}, trial.score_time)
					setTimeoutHandlers.push(handle_scoretime)
				}, trial.feedback_time2)
				setTimeoutHandlers.push(handle_feedback)
			}
		}


		var display_stimuli = function(stage){

			kill_timers()
			kill_listeners()

			state_name = state_names[state]
			state_color = state_colors[state]
			if ((state_name != "red") && (state_name != "purple")) {
				// trial_number = background_trial_num[state_name]
				// console.log(trial_number)
				var back_num = task_backgrounds_zip[trial_number-1][1]
			} else if ((state_name =="red")) {
				var back_num = "red_planet"
			} else if ((state_name =="purple")){
				var back_num = "purple_planet"
			}
			if (stage==-1) { // timeout	at first level
				if (state == 0) {
					bottom_left.innerHTML = '<br><br>X'
					bottom_right.innerHTML = '<br><br>X'
					bottom_left.style.backgroundImage = 'url("stimuli/'+test_objs[stims[0]-1]+'.png")'
					bottom_right.style.backgroundImage = 'url("stimuli/'+test_objs[stims[1]-1]+'.png")'
				} else {
					bottom_middle.innerHTML = '<br><br>X'
					bottom_middle.style.backgroundImage = 'url("stimuli/'+state2_obj+'.png")'
					// bottom_middle.style.backgroundImage = 'url("stimuli/'+state_name+'/'+back_num+'.jpg")'
				}
				top_middle.innerHTML = ('<br><br><br>' + (0)*stake)
				if (trial.practice == 0) {
					// top_right.innerHTML = ('score: ' + score)
					// top_right.style.marginLeft = '-30px'
					// top_right.style.textAlign = 'right'
					// top_right.innerHTML += '<div id="jspsych-2step-mini-score"></div>'
					content.querySelector('#jspsych-2step-mini-score').innerHTML = ('score: ' + score)
				}
			}

			if ((stage == 0.5) || (stage == 0.75)) { // set up content
				display_element.innerHTML = '<div id="jspsych-2step-content"></div>'
				content = display_element.querySelector('#jspsych-2step-content')
				content.style.backgroundImage = 'url("stimuli/'+state_name+'/'+back_num+'.jpg")'
				content.style.backgroundSize='cover'
				content.style.backgroundPosition='center'
				content.style.height = '400px'
				content.style.width = '533px'

				content.innerHTML += '<div id= "jspsych-2step-content-top-left"></div>'
				content.innerHTML += '<div id= "jspsych-2step-content-top-middle"></div>'
				content.innerHTML += '<div id= "jspsych-2step-content-top-right"></div>'
				content.innerHTML += '<div id="break"></div>'
				content.querySelector('#break').style.clear = 'both'
				content.innerHTML += '<div id= "jspsych-2step-content-bottom-left"></div>'
				content.innerHTML += '<div id= "jspsych-2step-content-bottom-middle"></div>'
				content.innerHTML += '<div id= "jspsych-2step-content-bottom-right"></div>'

				top_left = content.querySelector('#jspsych-2step-content-top-left')
				top_middle = content.querySelector('#jspsych-2step-content-top-middle')
				top_right = content.querySelector('#jspsych-2step-content-top-right')
				bottom_left = content.querySelector('#jspsych-2step-content-bottom-left')
				bottom_middle = content.querySelector('#jspsych-2step-content-bottom-middle')
				bottom_right = content.querySelector('#jspsych-2step-content-bottom-right')

				if (stage == 0.5) {
					top_middle.innerHTML += '<div id="jspsych-2step-top-stake"></div>'
					content.querySelector('#jspsych-2step-top-stake').innerHTML = (stake + 'x')
				}
			}

			if (stage==1) { // choice stage
				if (trial.practice == 0) {
					top_left.innerHTML += '<div id="jspsych-2step-mini-stake"></div>'
					content.querySelector('#jspsych-2step-mini-stake').innerHTML = (stake + 'x')
				}
				if (trial.practice == 0) {
					top_right.innerHTML += '<div id="jspsych-2step-mini-score"></div>'
					content.querySelector('#jspsych-2step-mini-score').innerHTML = ('score: ' + score)
					// top_right.innerHTML = ('score: ' + score)
					// top_right.style.marginLeft = '-30px'
					// top_right.style.textAlign = 'right'
				}
				if (state == 0) {
					bottom_left.style.backgroundImage = 'url("stimuli/'+test_objs[stims[0]-1]+'.png")'
					bottom_right.style.backgroundImage = 'url("stimuli/'+test_objs[stims[1]-1]+'.png")'
					bottom_middle.style.width = '50px'
				} else { //state == 1 | 2
					bottom_middle.style.backgroundImage = 'url("stimuli/'+state2_obj+'.png")'
				}
			}

			if (stage==2) { // feedback
				if (state == 0) {
					// if (String.fromCharCode(response[part].key)==choices[0]) { // left response
						if (response[part].key==choices[0]) {
						bottom_right.style.backgroundImage = 'url("stimuli/'+test_objs[stims[1]-1]+'_grey.png")'
						bottom_left.style.outlineColor = 'rgba('+state_color[0]+','+state_color[1]+','+state_color[2]+', 1)'
						bottom_left.style.boxShadow = '0 0 0 4px white'
					} else {
						bottom_left.style.backgroundImage = 'url("stimuli/'+test_objs[stims[0]-1]+'_grey.png")'
						bottom_right.style.outlineColor = 'rgba('+state_color[0]+','+state_color[1]+','+state_color[2]+', 1)'
						bottom_right.style.boxShadow = '0 0 0 4px white'
					}
				} else {
					bottom_middle.style.outlineColor = 'rgba('+state_color[0]+','+state_color[1]+','+state_color[2]+', 1)'
					bottom_middle.style.boxShadow = '0 0 0 4px white'
				}
			}

			if (stage==3) { // reward
				if (points==0) {
					top_middle.style.backgroundImage = 'url("stimuli/noreward.png")'
				}	else {
					if (points>0) {
						bottom_middle.style.backgroundImage = 'url("stimuli/'+state2_obj+'.png")'
						top_middle.style.backgroundImage = 'url("stimuli/treasure_'+(points-points_loop_counter)+'.png")'
						extra_text = '+'
					}
					// if (points<0) {
					// 	bottom_middle.style.backgroundImage = 'url("stimuli/'+state_name+'_stim_sad.png")'
					// 	top_middle.style.backgroundImage = 'url("stimuli/antimatter_'+((-1*points)-points_loop_counter)+'.png")'
					// 	extra_text = ''
					// }
					if (points_loop_counter==0) {
						text = ''
					} else {
						text = extra_text+(points_loop_counter)*stake*Math.sign(points) + ' &nbsp '
					}
					top_middle.innerHTML = '<br><br><br>' + text
					if (trial.practice == 0) {
						// top_right.style.textAlign = 'right'
						// top_right.style.marginLeft = '-30px'
						// top_right.innerHTML = ('score: '+ (score+points_loop_counter*stake*Math.sign(points)))
						// top_right.innerHTML += '<div id="jspsych-2step-mini-score"></div>'
						content.querySelector('#jspsych-2step-mini-score').innerHTML = ('score: ' + (score+points_loop_counter*stake*Math.sign(points)))

					}
				}
			}
		}

		var start_response_listener = function(){
			choices = both_choices[part]

			if(JSON.stringify(choices) != JSON.stringify(["none"])) {
				var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
					callback_function: after_response,
					valid_responses: choices,
					rt_method: 'date',
					persist: false,
					allow_held_key: false,
				})
			}
		}

		//kill timers and response listeners
		var kill_timers = function(){
			for (var i = 0; i < setTimeoutHandlers.length; i++) {
				clearTimeout(setTimeoutHandlers[i])
			}
		}
		var kill_listeners = function(){
			if(keyboardListener !== 'undefined'){
				jsPsych.pluginAPI.cancelAllKeyboardResponses()
			}
		}

		// function that starts next stage
		var next_part = function(){

			part = part + 1

			kill_timers()
			kill_listeners()

			if (part == 0) {
				if (trial.practice == 0) {
					display_stimuli(0.5)
					stake_time = trial.stake_time
					SOA = trial.SOA
				} else { // don't show stake during practice
					display_stimuli(0.75)
					stake_time = 0
					SOA = 0
				}
			} else { // don't show stake on second stage
				stake_time = 0
				SOA = 0
			}

			var handle_stake = jsPsych.pluginAPI.setTimeout(function() {
				display_stimuli(0.75)

				var handle_soa = jsPsych.pluginAPI.setTimeout(function() {
					display_stimuli(1)
					start_response_listener()

					if (trial.timing_response>0) {
						var handle_response = jsPsych.pluginAPI.setTimeout(function() {
							kill_listeners()
							score = score + stake*(0)
							display_stimuli(-1)
							var handle_timeout = jsPsych.pluginAPI.setTimeout(function() {
								end_trial()
							}, trial.timeout_time)
							setTimeoutHandlers.push(handle_timeout)
						}, trial.timing_response)
						setTimeoutHandlers.push(handle_response)
					}
				}, SOA)
				setTimeoutHandlers.push(handle_soa)
			}, stake_time)
			setTimeoutHandlers.push(handle_stake)
		}

		// begin the trial
		next_part()

	}

	return plugin
})()
