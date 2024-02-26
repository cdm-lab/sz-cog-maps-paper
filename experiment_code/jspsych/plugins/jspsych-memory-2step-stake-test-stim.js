/**
* jspsych-memory-2step-stake-test-stim
* Ata Karagoz
* adapted from code by Bettina Bustos & Wouter Kool
* Plugin for displaying the stakes practice block of the model-based/model-free Kool-2-step task but with memory and differing reward arms.
* (Kool et al., Psychological Science, 2017).
*
**/

jsPsych.plugins["memory-2step-stake-test-stim"] = (function() {

	var plugin = {}

	plugin.info = {
		name: 'memory-2step-stake-test-stim',
		description: 'Plugin for displaying the stake practice block of the model-based/model-free 2-step task.',
		parameters: {
			choices :{
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'choice',
				default: ["space"],
				description:'Selected keys for participant responses.'
			},
			rews:{
				type:jsPsych.plugins.parameterType.INT,
				default: [],
				description: 'Total treasure pieces or antimatter received.'
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
			pstakes:{
				type:jsPsych.plugins.parameterType.INT,
				default: 1,
				description: 'The probability that each stake multiplier will occur.'
			},
			//timing parameters
			feedback_time: {
				type: jsPsych.plugins.parameterType.INT,
				default: 500,
				description:'Length of time (ms) participant receives feedback.'
			},
			iti: {
				type: jsPsych.plugins.parameterType.INT,
				default:500,
				description: 'Length of time (ms) between trials.',
			},
			timeout_time: {
				type:jsPsych.plugins.parameterType.INT,
				default:1500,
				description: 'Length of time (ms) participants view time out screen.'
			},
			timing_response:{
				type:jsPsych.plugins.parameterType.INT,
				default:3000,
				description: 'Length of time (ms) to make a response.'
			},
			score_time:{
				type:jsPsych.plugins.parameterType.INT,
				default:1500,
				description: 'Length of time (ms) total treasure pieces or antimatter are shown.'
			},
			totalscore_time:{
				type:jsPsych.plugins.parameterType.INT,
				default:2000,
				description: 'Length of time (ms) the total score in points is displayed.'
			},
			stake_time:{
				type:jsPsych.plugins.parameterType.INT,
				default:1500,
				description: 'Length of time (ms) stake is displayed.'
			},
			SOA:{
				type:jsPsych.plugins.parameterType.INT,
				default:500,
				description: 'Length of time (ms) between stimuli.'
			},
			points_loop_time:{
				type:jsPsych.plugins.parameterType.INT,
				default:200,
				description: 'Length of time (ms) each point increment is displayed.'
			},
			guessfeedback_time:{
				type:jsPsych.plugins.parameterType.INT,
				default: 2000,
				description: 'Length of time (ms) points guess feedback is displayed.'
			}
		}
	}

	plugin.trial = function(display_element, trial) {

		var displayColor = '#0738db'
		var borderColor = '#197bff'
		var textColor = '#b8fff6'
		var score = 0

		var stimsperstate = [[1,2],[3,4],[5,6],[7,8]]
		var state1 = Math.ceil(Math.random()*2)
		var stims = jsPsych.randomization.repeat(stimsperstate[state1-1], 1)

		var part = -1
		var choice1 = -1
		var state2 = -1
		var points = 0
		var minus = 0
		var stake = 1
		var points_guess = '?'

		var state_names = ["desert","forest","library","restaurant","p_purple","p_red"] // need to add randomization of which background is related to high or low
		var state_colors = [
			[5, 157, 190],
			[5, 157, 190],
			[5, 157, 190],
			[5, 157, 190],
			[115, 34, 130],
			[211, 0, 0]
		]

		//randomly pick a stake multiplier
		stake_p = Math.random()
		for (var i = 0; i <= trial.stakes.length; i++){
			if (stake_p <= trial.pstakes[i]) {
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
		var all_choices = [["f","j"],[" "],[48,49,50,51,52,53,54,55,56,57,32,90,189]]
		var choices = new Array

		var provide_answer = function() {
			display_stimuli(4)
			start_response_listener()
		}

		var points_loop_counter = 0
		var points_loop = function() {
			if (points_loop_counter < Math.abs(points)) {
				points_loop_counter = points_loop_counter + 1
				display_stimuli(5)
				var handle_points_loop = jsPsych.pluginAPI.setTimeout(function() {
					points_loop()
				}, trial.points_loop_time);
				setTimeoutHandlers.push(handle_points_loop)
			} else {
				end_trial()
			}
		}

		// function to end trial
		var end_trial = function(){

			kill_listeners()
			kill_timers()

			// gather the data to store for the trial
			var trial_data = {
				"subid": trial.subid,
				"state1": state1,
				"stim_left": stims[0],
				"stim_right": stims[1],
				"rt_1": response[0].rt,
				"choice1": choice1,
				"response1": response[0].key,
				"rt_2": response[1].rt,
				"points": points,
				"state2": state2,
				"stake": stake,
				"rews1": trial.rews[0],
				"rews2": trial.rews[1],
				"accuracy": correct_guess,
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

		// function to handle responses by the subject
		var after_response = function(info){
			kill_listeners()
			kill_timers()

			// only record the first response
			if (part < 3) {
				if (response[part].key == -1){
					response[part] = info
				}

				display_stimuli(2) //feedback

				if (trial.timing_response>0) {
					var extra_time = trial.timing_response-response[part].rt
				} else {
					var extra_time = 0
				}
			}
			if (state == 0) { // determine second-stage state
				if (info.key == 70) { // left response
					choice1 = stims[0]
				} else { // right response
					choice1 = stims[1]
				}
				if ((choice1 == 1) || (choice1 == 3)) { // second-stage transition
					state2 = 1 // high reward arm second stage 1
				} else  if ((choice1 == 2) || (choice1 == 4)){
					state2 = 2 // high reward arm second stage 2
				} else if ((choice1 == 5) || (choice1 == 7)){
					state2 = 3 //low reward arm second stage 1
				} else {
					state2 = 4 //low reward arm second stage 2
				}
				state = state2

				var handle_feedback = setTimeout(function() {
					display_element.innerHTML = ''; // clear screen
					next_part()
				}, trial.feedback_time+extra_time)
				setTimeoutHandlers.push(handle_feedback)
			} else { // show feedback
				if (part != 3) {
					points = p_rews[state-1]
					display_stimuli(2)
					var handle_feedback = jsPsych.pluginAPI.setTimeout(function() {
						display_stimuli(3)
						var handle_score = jsPsych.pluginAPI.setTimeout(function() {
							part = 3
							provide_answer()
						}, trial.score_time)
						setTimeoutHandlers.push(handle_score)
					}, trial.feedback_time+extra_time)
					setTimeoutHandlers.push(handle_feedback)
				}else {
					if (String.fromCharCode(info.key)==' ' && points_guess!='?'){
						kill_listeners()
						if ((Number(points_guess))==(points*stake)){
							correct_guess = 1
						} else {
							correct_guess = 0
						}
						display_stimuli(5)
						var handle_guessfeedback = jsPsych.pluginAPI.setTimeout(function(){
							points_loop()
						}, trial.guessfeedback_time)
						setTimeoutHandlers.push(handle_guessfeedback)
						accuracy = correct_guess
					} else {
						if (minus == 1) {
							points_guess = points_guess.slice(1)
						}
						if (String.fromCharCode(info.key)!=' ') {
							if (info.key==189) {
								if (minus == 0) {
									minus = 1
								} else{
									minus = 0
								}
							} else {
								if (String.fromCharCode(info.key)=='Z'){
									points_guess = '?'
									minus = 0
								} else {
									if (points_guess =='?') {
										points_guess = String.fromCharCode(info.key)
									} else {
										if (points_guess.length==(2)){
											points_guess = String.fromCharCode(info.key)
										} else {
											points_guess = points_guess[0] + String.fromCharCode(info.key)
											if (points_guess[0] == '0') {
												points_guess = points_guess[1]
											}
										}
									}
								}
							}
						}
						if (minus == 1){
							points_guess = "-" + points_guess
						} else {
							if (points_guess[0] == "-") {
								points_guess = points_guess.slice(1)
							}
						}
						display_stimuli(4)
						provide_answer()
					}
				}
			}
		}


		var display_stimuli = function(stage){

			kill_timers()
			kill_listeners()

			state_name = state_names[state]
			state_color = state_colors[state]

			if (stage==-1) { // timeout	at first level
				if (state == 0) {
					bottom_left.innerHTML = '<br><br>X'
					bottom_right.innerHTML = '<br><br>X'
					bottom_left.style.backgroundImage = 'url("img/'+state_name+'_stim_'+stims[0]+'_deact.png")'
					bottom_right.style.backgroundImage = 'url("img/'+state_name+'_stim_'+stims[1]+'_deact.png")'
				} else {
					bottom_middle.innerHTML = '<br><br>X'
					bottom_middle.style.backgroundImage = 'url("img/'+state_name+'_stim_deact.png")'
				}
			}

			if ((stage == 0.5) || (stage == 0.75)) { // set up content
				display_element.innerHTML = '<div id="jspsych-2step-content"></div>'
				content = display_element.querySelector('#jspsych-2step-content')
				content.style.backgroundImage = 'url("img/'+state_name+'_planet.png")'
				content.style.height = '400px'
				content.style.width = '533px'

				if (stage == 0.5) {
					content.innerHTML += '<div id="jspsych-2step-top-stake"></div>'
					content.querySelector('#jspsych-2step-top-stake').innerHTML += (stake + 'x')
					content.style.fontSize = '300%'
				}
			}

			if (stage==1) { // choice stage
				display_element.innerHTML = '<div id="jspsych-2step-content"></div>'
				content = display_element.querySelector('#jspsych-2step-content')

				content.style.backgroundImage = 'url("img/'+state_name+'_planet.png")'
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

				top_left.innerHTML = '<div id="jspsych-2step-mini-stake"></div>'
				content.querySelector('#jspsych-2step-mini-stake').innerHTML = (stake + 'x')

				if (state == 0) {
					bottom_left.style.backgroundImage = 'url("img/'+state_name+'_stim_'+stims[0]+'.png")' // so this needs to pull stage 1 stim
					bottom_right.style.backgroundImage = 'url("img/'+state_name+'_stim_'+stims[1]+'.png")' // this too needs to pull stage 1 stim
					bottom_middle.style.width = '50px'
				} else { //state == 1 |
					bottom_middle.style.backgroundImage = 'url("img/'+state_name+'_stim.png")' // this needs to pull stage 2 stim
				}
			}

			if (stage==2) { // feedback
				if (state == 0) {
					if (String.fromCharCode(response[part].key)==choices[0]) { // left response
						bottom_right.style.backgroundImage = 'url("img/'+state_name+'_stim_'+stims[1]+'_deact.png")' // this will need to display "deact" versions of stim when I make them
						bottom_left.style.outlineColor = 'rgba('+state_color[0]+','+state_color[1]+','+state_color[2]+', 1)'
						bottom_left.style.boxShadow = '0 0 0 4px white'
					} else {
						bottom_left.style.backgroundImage = 'url("img/'+state_name+'_stim_'+stims[0]+'_deact.png")'
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
					top_middle.style.backgroundImage = 'url("img/noreward.png")'
					top_middle.style.marginRight = '-25px'
				}	else {
					if (points>0) {
						bottom_middle.style.backgroundImage = 'url("img/'+state_name+'_stim_happy.png")' // don't have these so I can probably get rid of this if
						top_middle.style.backgroundImage = 'url("img/treasure_'+points+'.png")'
						top_middle.style.marginRight = '-25px'

					}
					if (points<0) {
						bottom_middle.style.backgroundImage = 'url("img/'+state_name+'_stim_sad.png")'
						top_middle.style.backgroundImage = 'url("img/antimatter_'+(-1*points)+'.png")' // not gonna have negative rewards so can comment out this part
						top_middle.style.marginRight = '-25px'

					}
				}
			}

			if (stage == 4) { // points guess panel
				if (points_guess>0) {
					top_middle.innerHTML = ('<br> '+points_guess)
				} else {
					top_middle.innerHTML = ('<br> '+points_guess)
				}
				top_right.innerHTML = ("Insert number:</br>0-9 keys</br></br>Positive/negative:</br>'-' key</br></br>Clear answer:</br>'Z' key</br></br>Continue:</br>space")
			}

			if (stage == 5) { // points guess feedback
				if (points>0) {
					top_middle.style.backgroundImage = 'url("img/treasure_'+(points-points_loop_counter)+'.png")'
					extra_text = '+'
				}
				if (points<0) {
					top_middle.style.backgroundImage = 'url("img/antimatter_'+((-1*points)-points_loop_counter)+'.png")'
					extra_text = ''
				}
				if (points_loop_counter==0) {
					text = ''
				} else {
					text = extra_text+(points_loop_counter)*stake*Math.sign(points)
				}
				if (correct_guess==0){
					if (points_guess>0) {
						top_middle.innerHTML =('<br><font color="red">+'+points_guess+'</font><br><br>'+text)
					} else {
						top_middle.innerHTML =('<br><font color="red">'+points_guess+'</font><br><br>'+text)
					}
				} else {
					if (points_guess>0) {
						top_middle.innerHTML =('<br><font color="green">+'+points_guess+'</font><br><br>'+text)
					} else {
						top_middle.innerHTML =('<br><font color="green">'+points_guess+'</font><br><br>'+text)
					}
				}
			}
		}

		var start_response_listener = function(){

			if (part < 3) {
				if (part == 0) {
					choices = all_choices[0]
				} else {
					choices = all_choices[1]
				}
			} else {
				choices = all_choices[2]
			}
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

		// kill timers and response listeners
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
				display_stimuli(0.5)
				stake_time = trial.stake_time
				SOA = trial.SOA
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

		next_part()
	}

	return plugin
})()
