const gameState = {
    score: 0,
}

const textDiv = document.getElementById('text-div')
const buttonDiv = document.getElementById('button-div')
const scoreDiv = document.getElementById('score-div')
const highscores = document.getElementById('highscores')

document.getElementById('submit').addEventListener('click', (event) => {
	event.preventDefault();
	const name = document.getElementById('input-box').value
	if (name !== ''){
		fetch('https://untitled-northcoders-game.herokuapp.com/highscores', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: name,
				score: gameState.score
			})
		})
		.then((res) => res.json())
		.then((scores) => {
			scores.forEach((score) => {
				const scoreDiv = document.createElement('div')
				scoreDiv.textContent = `Name: ${score.name}. Score: ${score.score}`
				highscores.appendChild(scoreDiv)
			})
		})
	}
	
})

const setScreen = (text, options, callback) => {
	textDiv.textContent = text
	buttonDiv.innerHTML = ''
	options.forEach((option, i) => {
		const button = document.createElement('button')
		button.textContent = option
		button.addEventListener('click', () => callback(i))
		buttonDiv.appendChild(button)
	})
}

const handleScenario = (scenarioID) => {
	if(scenarioID === null){
		handleEnding(gameState.score)
		return
	}
	const scenario = scenarios[scenarioID]
	
	setScreen(
		scenario.text,
		scenario.options.map(option => option.text),
		i => handleOption(scenario.options[i])
	);
}

const handleOption = option => {
	gameState.score += option.scoreChange
	displayScore(gameState.score)
	if(option.outcome === ''){
		return handleScenario(option.next)
	}
	setScreen(
		option.outcome,
		['continue'],
		() => handleScenario(option.next)
	);
}

const restart = () => {
	gameState.score = 0
	displayScore(0)
	highscores.innerHTML = ''
	document.getElementById('input').style.display = 'none';
	handleScenario('wake_up')
}

const handleEnding = score => {
	let ending = ''
	if(score < 0){
		ending = "You are the Star Pupil. All the tutors love you and you've made them very happy. I hope you're pleased with this result because you have totally failed."
	}else if(score < 25){
		ending = "You are barely bad. Yeah, you've caused some trouble and the tutors have had a worse day than normal, but nothing they can't shrug off with a nice curry and a relaxing evening of Star Trek tonight. You can do better"
	}else if(score < 55){
		ending = "You are unusually unruly. You've caused trouble all day sending the tutors home with a nasty headache and badly in need of a cuddle from their girlfriend/boyfriend/carton of oat milk. But yet - the perfect score is still out there! It's calling you to try again"
	}else{
		ending = "You are effortlessly evil. The tutors are re-evaluating why they ever thought teaching was a good career choice. You have crushed them utterly! The perfect score - I have nothing more to teach you."
	}
	document.getElementById('input').style.display = 'block';
	showHighScores();
	setScreen(
		ending, 
		['Play again'], 
		restart
	)
}

const showHighScores = () => {
	fetch(
		'https://untitled-northcoders-game.herokuapp.com/highscores'
	)
	.then((res) => res.json())
	.then((scores) => {
		scores.forEach((score) => {
			const scoreDiv = document.createElement('div')
			scoreDiv.textContent = `Name: ${score.name}. Score: ${score.score}`
			highscores.appendChild(scoreDiv)
		})
	})
}

const displayScore = (score) => {
	scoreDiv.textContent = `Score: ${score}`
}

const output = text => console.log(text);

const createScenario = (text, options) => ({ text, options });
const createOption = (text, outcome, next, scoreChange=0) => ({ text, outcome, next, scoreChange });

const scenarios = {
    'wake_up': createScenario("It's a lovely day at Northcoders and you are a horrible student. Your mission is to distract and discomfit the tutors using all the tools available to you. Your day starts with kata hour. How do you choose to use it?", [
        createOption('ignore the katas and make breakfast', "You dawdle your way to the kitchen and make yourself a leisurely breakfast of crunchy-nut cornflakes and coffee. By the time you make it to your desk, it's time for the lecture to start", 'lecture_start_crunchy', 2),
		createOption('spam the slack chat with distracting memes', "Bad news! The tutors love your hilarious memes. They all comment 😂. You've got their day off to a great start. You lose 2 points.", 'lecture_start', -2),
		createOption('get on with the katas', "", 'kata_start')
    ]),
    'kata_start': createScenario("This morning's kata is creating a mini database. Which file do you open?", [
        createOption('look in models', "It's an empty file", 'kata_start'),
		createOption('look in controllers', "It's an empty file", 'kata_start'),
		createOption('look in knexfile', '', 'find_password')
	]),
	'find_password': createScenario("'Hang on, shouldn't this have been gitignored?' you think to yourself as you open the knexfile. Within the file you find a username of Northcoders_admin and a password, as well as a url labelled 'Northcoders master database'.", [
		createOption('continue coding', 'You crack on with your kata and finish it just before the lecture starts', 'lecture_start'),
		createOption('try the password', '', 'master_database')
	]),
	'master_database': createScenario("You copy and paste the url into your browser and type in the password - you're in! You see a jumble of code and information on the screen in front of you but one button jumps out at you: master sketchbook settings", [
		createOption('close the window', "You lose your nerve and close the window. You make a cup of tea to calm yourself and by the time it's brewed it's time for the lecture to begin.", 'lecture_start'),
		createOption('change the settings', 'You open up the master sketchbook settings and change the default colour to lime green and the style to caligraphy. Chuckling to yourself, you close the browser down and get ready to dial into the lecture', 'lecture_start_green', 5)
	]),
    
    'lecture_start': createScenario("You sit at your desk with your cat curled up on your lap. The lecture begins uneventfully. It's Alex teaching you react for the third time this week. He asks a question and you feel pretty confident on the answer. What do you do?", [
		createOption('give the right answer', '', 'question_2'),
		createOption('give the wrong answer', "Bad news! Alex is thrilled. 'Aha! That's exactly what I wanted you to say! It's actually a common misconception...' You lose 2 points. The lecture continues.", 'loading_screen', -2),
		createOption('sit in silence', "Your silence allows someone else to chip in with the answer instead. The lecture continues", 'loading_screen')
	]),
	
	'lecture_start_crunchy': createScenario("You sit at your desk with your cat curled up on your lap. The lecture begins. It's Alex teaching you react for the third time this week. You leave your mic on and take a big bite of your cereal. Alex's intro is totally drowned out by the sound of crunching. The chat starts to fill with other students reporting audio issues. It takes him 5 minutes to find the controls, mute everyone and regain control of the class. It's a moderate success. You gain 2 points. He finally starts the lecture and asks a question. You feel pretty confident on the answer. What do you do?", [
		createOption('give the right answer', '', 'question_2'),
		createOption('give the wrong answer', "Bad news! Alex is thrilled. 'Aha! That's exactly what I wanted you to say! It's actually a common misconception...' You lose 2 points. The lecture continues", 'loading_screen', -2),
		createOption('sit in silence', "Your silence allows someone else to chip in with the answer instead. The lecture continues", 'loading_screen')
	]),
	
	'lecture_start_green': createScenario("You sit at your desk with your cat curled up on your lap. The lecture begins. It's Alex teaching you react for the third time this week. He starts to draw out some code but your changes make it completely illegible. The chat starts to fill with other students saying they can't read it. It takes him 15 minutes to find the settings, switch them back to normal and regain control of the class. Success! You gain 5 points. He finally starts the lecture and asks a question. You feel pretty confident on the answer. What do you do?", [
		createOption('give the right answer', '', 'question_2'),
		createOption('give the wrong answer', "Bad news! Alex is thrilled. 'Aha! That's exactly what I wanted you to say! It's actually a common misconception...' You lose 2 points. The lecture continues", 'loading_screen', -2),
		createOption('sit in silence', "Your silence allows someone else to chip in with the answer instead. The lecture continues", 'loading_screen')
	]),
	
	'question_2': createScenario("Alex thanks you for your great answer and asks another question. What do you do?", [
		createOption('answer again', '', 'question_3'),
		createOption('let someone else take a turn', "Someone else chips in. Alex thanks them. The lecture continues", 'loading_screen')
	]),

	'question_3': createScenario("Alex looks slightly uncomfortable. 'Another great answer' he says in a slightly strained voice. He asks another question. What do you do?", [
		createOption('answer again', "You see the tension in Alex's face. 'Ummmmm, that's right again. Thanks.' He sees you open your mouth to answer a fourth question and he finally cracks: 'Maybe let someone else answer the next one' he sighs uncomfortably. Success! You gain 5 points.", 'loading_screen', 5),
		createOption('let someone else take a turn', "Someone else chips in. Alex thanks them. The lecture continues", 'loading_screen')
	]),

	'loading_screen': createScenario("'So before we can load anything up, I'm going to need to install React', Alex says, typing the command into his terminal. The loading bar appears, creeps up to three percent, then 10 percent, then judders to a halt. Alex sighs. This could be a while, what do you do?", [
		createOption('make a supportive comment in the zoom chat', "'look's like your computer's going at snail's pace this morning 🙁🙁', you type. 'wait, shouldn't it be tortoise pace?' somebody replies. The chat quickly devolves into a busy discussion about the slowest animal. React has finished installing but nobody is paying attention to the lecture anymore. 'Can everyone please concentrate', Alex pleads. Success! You gain 5 points", 'typo', 5),
		createOption('make a cup of tea', "You make a cup of tea. By the time you've finished, React has finished installing and Alex has moved on", 'typo'),
		createOption('start a slow clap', "You begin a clap but, as you start, the loading bar suddenly speeds up and the installation completes. The rest of the cohort think you're applauding Alex's success and joins in in a round of applause. 'Aww, thank you guys', Alex beams. You lose 5 points.", 'typo', -5)
	]),

	'typo': createScenario("Alex types out a lengthy React component with a state and multiple children. As he finishes up his render function, you spot a small typo in how he's called one of them. Do you point it out?", [
		createOption('yes', "'Thank you!', Alex exclaims, 'Phew! That could have taken me ages to find.' You lose 2 points.", 'finished_code', -2),
		createOption('no', '', 'finding_typo_1')
	]),

	'finding_typo_1': createScenario("Alex refreshes his live server and errors fill the screen. 'Oh no,' he growns 'I must have made a mistake somewhere.' He start scanning back through the pages of the code looking for the error. Do you help?", [
		createOption("tell him it's in the render function", "With your help he locates the typo and fixes the code. What the hell are you doing? Did you not read the objectives of this game? Lose 10 points.", 'finished_code', -10),
		createOption('stay silent', "It takes Alex 10 minutes of flicking back and forth through his vscode windows, anxiously sweating, before he finally finds the typo and fixes it. 'Ohhhh, I though it might be that', you say smugly. Alex shoots you a glare. You gain 5 points.", 'finished_code', 5)
	]),

	'finished_code': createScenario("It's the end of the lecture and Alex has just finished a complicated looking, really informative bit of code - the kind of thing that is going to be really useful during your sprint today. This is your final chance to cause chaos, which gambit do you choose?", [
		createOption("adjust your speakers so they are pointing directly at your microphone", "the audio feedback creates a high pitched whine, but Alex is quick off the mark and mutes you. You distract everyone, but only for a moment. You gain 1 point", 'programming_start', 1),
		createOption("unmute yourself, whack up your volume and take a screenshot", "Nice try, but this is an Alex lecture. He smiles and says 'yes, go ahead and screenshot it! This will help you later. You lose 2 points.", 'programming_start', -2),
		createOption("hold your cat up to the camera and snuggle with her, nose to nose", "The rest of the cohort loses their minds at the cuteness of the scene. The chat fills up with emojis and 'SQUEEEEEEEE'. Alex totally loses focus and forgets to wrap up the lecture. Chaos acheived! You gain 5 points.", 'programming_start', 5)
	]),

	'programming_start': createScenario("It's time to start coding. It's a solo sprint today so it's up to you and your nchelp requests to wear down the tutors. It's a busy day and they're going to have a lot of requests. How much of their time can you tie up with pointless errors?What's your first move", [
		createOption('get cracking on some code', '', 'testing'),
		createOption('nchelp', "Sam appears. He looks at your blank screen with an air of confusion. 'You haven't even downloaded the repo, there's nothing here for me to help with. Why don't you try and make a start by yourself'. He leaves. This round is not that easy. 0 points.", "programming_start")
	]),

	'testing': createScenario("You need to write some pretty complex utils functions. TDD could really help you create some clear code. Do you write any tests?", [
		createOption('no tests. zero. zilch', '', 'no_tests'),
		createOption('test everything', '', 'tests')
	]),

	'no_tests': createScenario("Surprise, surprise! Your code quickly becomes a quagmire of confusion where nothing works. What do you do?", [
		createOption('nchelp', "David appears. He asks to see your tests and sighs in disgust when he realises you have none. 'I'm not helping you until you've written some test' he says and leaves. 0 points", 'no_tests'),
		createOption('figure it out yourself', 'It takes you an hour but you finally unpick the problems and move on.', 'which_file'),
		createOption('write some tests', '', 'tests')
	]),

	'tests': createScenario('You need to install jest to run your tests. Which operating system are you using?', [
		createOption('Linux', 'It installs fine and you use your tests to create some functioning code', 'which_file'),
		createOption('Mac', 'It installs fine and you use your tests to create some functioning code', 'which_file'),
		createOption("WSL", 'As you install jest, a wall of errors appears. You nchelp and get David. It takes him 30 minutes of hard googling before he finally gives up and tells you to restart your computer. He leaves with a defeated look in his eyes. 10 points!', 'which_file', 10)
	]),

	'which_file': createScenario("Your code is coming along but it still doesn't really work. You decide to ask for help, but which file do you request assistance on?", [
		createOption('tests', "Liam pops in. 'These tests look pretty good' he smiles. He helps you troubleshoot a couple of issues. You ask if you should run it to see if it works. 'Make it so!' he says, pointing at his camera. He leaves, grinning. Not a success. You lose 3 points.", 'mess_up_code', -3),
		createOption('css', "Sam dials in. He sees the css in front of him and the colour drains from his face. 'Oh no', you hear him whisper under his breath. You make him stay for 40 minutes, asking questions about position: relative. He is almost crying as he exits the call. Well done! 10 points.", 'mess_up_code', 10)
	]),

	'mess_up_code': createScenario("You've created some fully functioning code. This will not do! There are still 30 minutes left until the roundup. How do you mess up your code before you put in your final nchelp?", [
		createOption("replace all your maps with forEach", 'Pretty good! It takes a tired Jim 20 minutes to find all your arrays and help you rewrite them all as maps. You gain 5 points', null , 5),
		createOption("remove all return statements", 'Haz spots your little trick straight away. It takes her less than 5 minutes to put your code back together and be on her way. You lose 2 points', null, -2),
		createOption("use object destructuring on all your module exports but none of your requires", 'A masterstroke! It takes Izzy the full 30 minutes, jumping back and forth through your poorly organised file system to find and correct every export. She leaves just before the roundup, eyes glazed. You gain 10 points', null, 10)
	]),

	
};

handleScenario('wake_up')
