function mainEditor(){
	var defaultWidth = 2000;
	var defaultHeight = 2000;
	var defaultGrid = 100;
	var updatedVertices = false;
	var loadedResources = false;
	var cellSizeX = (defaultWidth)/(defaultWidth / defaultGrid);
	var cellSizeY = (defaultHeight)/(defaultHeight / defaultGrid);
	var zoomLevel = 2
	var isSquaresEnabled = false
	
	//////////////////// Constants
	var SCALE_ASTEROID = 0.5
	/////////////////// vars to initialize
	var canvas
	var mouseX, mouseY
	var context
	var objectSelector, easingSelector
	var gridVertices
	var canvasPosition
	var images
	var currentVertexId
	var currentType
	var currentObjectId
	var currentEasing
	var lastObjectPlaced
	
	var isDrawingPath
	var isRotating
	var currentPathIndex = 0
	var pathTracker = []
	var pathLine
	
	var gridIndicator = {
		image: null,
		isVisible: false,
		x: 0,
		y: 0,
		height: 0,
		width: 0,
	}
	
	var playerData = {
		image: "images/player/ship.png",
	};
	
	var planetData = [
		{image: "images/planets/earth.png"},
	];
	
	var enemyData = [
		{type: "follower", image: "images/enemies/follower.png"},
		{type: "canoner", image: "images/enemies/canon.png"},
		{type: "shooter", image: "images/enemies/shooter.png"},
	];
	
	var baseData = [
		{type: "fruit", image: "images/bases/fruit/base.png"},
		{type: "vegetable", image: "images/bases/vegetable/base.png"},
		{type: "cereal", image: "images/bases/cereal/base.png"},
		{type: "dryfruit", image: "images/bases/dryfruit/base.png"},
		{type: "protein", image: "images/bases/protein/base.png"},
		{type: "milk", image: "images/bases/milk/base.png"},
		{type: "fat", image: "images/bases/fat/base.png"},
		{type: "grain", image: "images/bases/grain/base.png"},
		{type: "sugar", image: "images/bases/sugar/base.png"},
		
	];
	
	var asteroidData = [
		{type: "asteroidstart", image: "images/obstacles/asteroidstart.png"},
		{type: "asteroidend", image: "images/obstacles/asteroidend.png"},
	];
	
	var obstacleData = [
		{type: "blackhole", image: "images/obstacles/blackHole.png"},
	];
	
	var saveData = {
		world: 1,
		level: 1,
		width: 0,
		height: 0,
		player: {position: {x: 0, y:0}},
		enemies: [],
		obstacles: [],
		earth: {position: {x: 0, y:0}},
		bases: [],
		asteroids: [],
	}
	
	var inputs = {
		width: document.getElementById("t_width"),
		height: document.getElementById("t_height"),
		grid: document.getElementById("t_gridsize"),
	}
	
	var buttons = {
		update: document.getElementById("b_update"),
		dump: document.getElementById("b_dump"),
	}
	
	function preloadImages(){
		images = {}
		
		images.player = new Image()
		images.player.src = playerData.image
		
		images.planet = new Image()
		images.planet.src = planetData[0].image
		
		
		images.enemies = {}
		for (indexEnemy = 0; indexEnemy < enemyData.length; indexEnemy++){
			var enemyImage = new Image()
			enemyImage.src = enemyData[indexEnemy].image
			images.enemies[indexEnemy] = enemyImage
		}
		
		images.obstacles = {}
		for (indexObstacle = 0; indexObstacle < obstacleData.length; indexObstacle++){
			var baseImage = new Image()
			baseImage.src = obstacleData[indexObstacle].image
			images.obstacles[indexObstacle] = baseImage
		}
		
		images.bases = {}
		for (indexBase = 0; indexBase < baseData.length; indexBase++){
			var baseImage = new Image()
			baseImage.src = baseData[indexBase].image
			images.bases[indexBase] = baseImage
		}
		
		images.planets = {}
		for (indexPlanet = 0; indexPlanet < planetData.length; indexPlanet++){
			var baseImage = new Image()
			baseImage.src = planetData[indexPlanet].image
			images.planets[indexPlanet] = baseImage
		}
		
		
		images.asteroids = {}
		images.asteroids.start = new Image()
		images.asteroids.start.src = asteroidData[0].image
		
		images.asteroids.end = new Image()
		images.asteroids.end.src = asteroidData[1].image
	}
	
	function dumpLevel(){
	
		saveData.width = defaultWidth
		saveData.height = defaultHeight
		saveData.level = document.getElementById("t_level").value
		saveData.world = document.getElementById("t_world").value
		var tx = defaultWidth/2
		var ty = defaultHeight/2
		var dumpString = ""
		dumpString += "--World = "+saveData.world+", Level = "+saveData.level+"\n\n"
		dumpString += "["+saveData.level+"] = "
		dumpString += "{\n"
		dumpString += "\tx = scale * .067,\n"
		dumpString += "\ty = 100,\n"
		dumpString += "\tbackground = \"images/backgrounds/space.png\",\n"
		dumpString += "\tlevelDescription = \"Recolecta las porciones necesarias\",\n"
		//levelInfo
		dumpString += "\tlevelWidth = "+saveData.width+",\n"
		dumpString += "\tlevelHeight = "+saveData.height+",\n"
		//ship
		dumpString += "\tship = {position = { x = "+(saveData.player.position.x-tx)+", y = "+(saveData.player.position.y-tx)+"}},\n"
		//objetives
		dumpString += "\tobjetives = {fruit = {portions = 3}},\n"
		//enemies
		dumpString += "\tenemySpawnData = {\n"
		var enemies = saveData.enemies
		for(indexEnemy = 0; indexEnemy < enemies.length; indexEnemy++){
			if (enemies[indexEnemy] != null){
				dumpString += "\t\t{\n"
				dumpString += "\t\t\ttype = \""+enemies[indexEnemy].type+"\",\n"
				dumpString += "\t\t\trotation = 0,\n"
				dumpString += "\t\t\tspawnPoint = {x = "+(enemies[indexEnemy].spawnPoint.x-tx)+", y = "+(enemies[indexEnemy].spawnPoint.y-ty)+"},\n"
				dumpString += "\t\t\tpatrolPath = {[1] = {x = "+(enemies[indexEnemy].spawnPoint.x-tx)+", y = "+(enemies[indexEnemy].spawnPoint.y-ty)+"}},\n"
				dumpString += "\t\t},\n"
			}
		}
		dumpString += "\t},\n"
		//Obstacles
		dumpString += "\tobstacle = {\n"
		var obstacles = saveData.obstacles
		for(indexObstacle = 0; indexObstacle < obstacles.length; indexObstacle++){
			if (obstacles[indexObstacle] != null){
				dumpString += "\t\t["+(indexObstacle+1)+"] = {\n"
				dumpString += "\t\t\ttype = \""+obstacles[indexObstacle].type+"\",\n"
				dumpString += "\t\t\tposition = {x = "+(obstacles[indexObstacle].position.x-tx)+", y = "+(obstacles[indexObstacle].position.y-ty)+"},\n"
				dumpString += "\t\t},\n"
			}
		}
		dumpString += "\t},\n"
		//Planet
		var planet = saveData.earth
		dumpString += "\tearth = {\n"
		dumpString += "\t\tposition = { x = "+(planet.position.x-tx)+", y = "+(planet.position.y-ty)+"},\n"
		dumpString += "\t\tname = \"earth\",\n"
		dumpString += "\t\tassetPath = \"images/planets/earth/\",\n"
		dumpString += "\t\tscaleFactor = 1.5,\n"
		dumpString += "\t},\n"
		//Bases
		var bases = saveData.bases
		dumpString += "\tplanets = {\n"
		for(indexBase = 0; indexBase < bases.length; indexBase++){
			if (bases[indexBase] != null){
				dumpString += "\t\t["+(indexBase+1)+"] = {\n"
				dumpString += "\t\t\tfoodType = \""+bases[indexBase].type+"\",\n"
				dumpString += "\t\t\tposition = {x = "+(bases[indexBase].position.x-tx)+", y = "+(bases[indexBase].position.y-ty)+"},\n"
				dumpString += "\t\t},\n"
			}
		}
		dumpString += "\t},\n"
		//Asteroids
		var asteroids = saveData.asteroids
		dumpString += "\tasteroids = {\n"
		for(indexAsteroid = 0; indexAsteroid < asteroids.length; indexAsteroid++){
			if (asteroids[indexAsteroid] != null){
				dumpString += "\t\t["+(indexAsteroid+1)+"] = {\n"
				dumpString += "\t\t\tlineStart = { x = "+(asteroids[indexAsteroid].start.x-tx)+", y = "+(asteroids[indexAsteroid].start.y-ty)+"},\n"
				dumpString += "\t\t\tlineEnd = { x = "+(asteroids[indexAsteroid].end.x-tx)+", y = "+(asteroids[indexAsteroid].end.y-ty)+"},\n"
				dumpString += "\t\t\teasingX = "+asteroids[indexAsteroid].easingX.name+",\n"
				dumpString += "\t\t\teasingY = "+asteroids[indexAsteroid].easingY.name+",\n"
				dumpString += "\t\t},\n"
			}
		}
		dumpString += "\t},\n"
		//Level Description
		dumpString += "},"
		document.getElementById("dump_code").innerHTML = dumpString
		//console.clear()
		//console.log(dumpString)
		
	}
	
	function initializeEditor(){
	
		canvas = document.getElementById("editor");
		context = canvas.getContext("2d");
		objectSelector = document.getElementById("objectselector")
		easingSelector = document.getElementById("easing")
		lastObjectPlaced = null
		currentEasing = {
			func: easing.linear,
			name: "easing.linear",
		}
		inputs.width.value = defaultWidth;
		inputs.height.value = defaultHeight;
		inputs.grid.value = defaultGrid;
		
		currentType = "user"
		currentVertexId = 0;
		currentObjectId = 0
		
		canvas.style.width = defaultWidth / zoomLevel
		canvas.style.height = defaultHeight / zoomLevel
		
		canvas.width = defaultWidth;
		canvas.height = defaultHeight;
		
		canvasPosition = canvas.getBoundingClientRect()
		
		buttons.update.addEventListener("click", updateCanvas);
		buttons.dump.addEventListener("click", dumpLevel);
		canvas.addEventListener("mousemove", onMouseOver);
		canvas.addEventListener("click", onMouseClick);
		canvas.addEventListener("mousemove", enterMainLoop);
		document.addEventListener("keydown", onKeyboardDown)
		objectSelector.addEventListener("change", onSelectOption);
		easingSelector.addEventListener("change", onSelectEasing);
		
		gridIndicator.image = images.player
		gridIndicator.width = 150
		gridIndicator.height = 150
		
		updateGridVertices()
		
		var randomVertex = Math.floor(Math.random() * gridVertices.length)
		saveData.player.position.x = gridVertices[randomVertex].x
		saveData.player.position.y = gridVertices[randomVertex].y
		
		var randomVertex = Math.floor(Math.random() * gridVertices.length)
		saveData.earth.position.x = gridVertices[randomVertex].x
		saveData.earth.position.y = gridVertices[randomVertex].y
	}
	
	function onSelectEasing(event){
		var selectedIndex = event.target.selectedIndex
		var selectedElement = event.target[selectedIndex]
		currentEasing.func = easing[selectedElement.id]
		currentEasing.name = selectedElement.id
	}
	
	function onKeyboardDown(event){
		if (event.keyCode == 68){
			deleteLastObject()
		}
	}
	
	
	function onSelectOption(event){
		
		var selectedIndex = event.target.selectedIndex
		var currentOption = event.target[selectedIndex]
		var currentGroup = currentOption.parentNode
		
		var selectedId = currentOption.id
		currentType = currentGroup.id
		currentObjectId = selectedId
		switch(currentType){
			case "user":
				gridIndicator.image = images.player
				gridIndicator.width = 150
				gridIndicator.height = 150
				break;
			case "enemies":
				gridIndicator.image = images.enemies[selectedId]
				gridIndicator.width = 150
				gridIndicator.height = 150
				break;
			case "obstacles":
				gridIndicator.image = images.obstacles[selectedId]
				gridIndicator.width = 300
				gridIndicator.height = 300
				break;
			case "bases":
				gridIndicator.image = images.bases[selectedId]
				gridIndicator.width = 300
				gridIndicator.height = 300
				break;
			case "planets":
				gridIndicator.image = images.planets[selectedId]
				gridIndicator.width = 300
				gridIndicator.height = 300
				break;
			case "walls":
				gridIndicator.image = images.asteroids.start
				gridIndicator.width = 100
				gridIndicator.height = 100
				break;
		}
	}
	
	function deleteLastObject(){
	
		if (lastObjectPlaced != null){
			lastObjectPlaced[lastObjectPlaced.length - 1] = null
		}
		
	}
	
	function onMouseClick(event){
		
		var insertionData = {}
		var currentVertex = gridVertices[currentVertexId]
		switch(currentType){
			case "user":
				saveData.player.position = {
					x: currentVertex.x,
					y: currentVertex.y,
				}
				break;
			case "enemies":
				var type = enemyData[currentObjectId].type
				var position = currentVertex
				saveData.enemies.push({index: currentObjectId, type: type, spawnPoint: position})
				lastObjectPlaced = saveData.enemies
				break;
				/*if(currentPathIndex == 0){
					var spawnPoint = gridVertices[currentVertexId];
					pathTracker.push(gridVertices[currentVertexId]);
					currentPathIndex++;
				}else if(currentPathIndex == 1){
					currentPathIndex = 0;
					pathTracker.push(gridVertices[currentVertexId]);
					saveData.enemies.push({index: currentObjectId, type: type, spawnPoint: spawnPoint});
				}*/
				
				break;
			case "obstacles":
				var type = obstacleData[currentObjectId].type
				var position = currentVertex
				saveData.obstacles.push({index: currentObjectId, type: type, position: position})
				lastObjectPlaced = saveData.obstacles
				break;
			case "bases":
				var type = baseData[currentObjectId].type
				var position = currentVertex
				saveData.bases.push({index: currentObjectId, type: type, position: position})
				lastObjectPlaced = saveData.bases
				break;
			case "planets":
				saveData.earth.position = {
					x: currentVertex.x,
					y: currentVertex.y,
				}
				break;
			case "walls":
				if (currentPathIndex == 0){
					pathTracker.push(currentVertex);
					currentPathIndex++;
				}else if(currentPathIndex == 1){
					pathTracker.push(currentVertex);
					currentPathIndex = 0;
					var asteroid = {
						start: {
							x: pathTracker[0].x,
							y: pathTracker[0].y,
						},
						end: {
							x: pathTracker[1].x,
							y: pathTracker[1].y,
						},
						easingX: {
								func: currentEasing.func,
								name: currentEasing.name,
						},
						easingY: {
								func: easing.linear,
								name: "easing.linear",
						}
					};
					pathTracker = []
					saveData.asteroids.push(asteroid)
					lastObjectPlaced = saveData.asteroids
				}
		}
	}
	
	function onMouseOver(event){
		mouseX = ((event.pageX) - (canvas.offsetLeft)) * zoomLevel
		mouseY = ((event.pageY) - (canvas.offsetTop)) * zoomLevel
		for(indexVertex = 0; indexVertex < gridVertices.length; indexVertex++){
			var currentVertex = gridVertices[indexVertex]
			if(mouseX >= currentVertex.x - (cellSizeX * 0.5) && mouseX <= currentVertex.x + (cellSizeX * 0.5) &&
			mouseY >= currentVertex.y - (cellSizeY * 0.5) && mouseY <= currentVertex.y + (cellSizeY * 0.5)){
				currentVertexId = indexVertex
				gridIndicator.isVisible = true
				gridIndicator.x = currentVertex.x
				gridIndicator.y = currentVertex.y
			}
		}
	}
	
	function updateCanvas(){
		defaultWidth = parseInt(inputs.width.value);
		defaultHeight = parseInt(inputs.height.value);
		defaultGrid = parseInt(inputs.grid.value);
		cellSizeX = (defaultWidth)/(defaultWidth / defaultGrid);
		cellSizeY = (defaultHeight)/(defaultHeight / defaultGrid);
		zoomLevel = document.getElementById("t_zoom").value
		canvas.style.width = defaultWidth / zoomLevel
		canvas.style.height = defaultHeight / zoomLevel
		canvas.width = defaultWidth;
		canvas.height = defaultHeight;
		updatedVertices = false
		enterMainLoop();
	}
	
	function drawLine(x1, y1, x2, y2, easingX, easingY){
		
		if(!easingX){
			easingX = easing.linear
		}
		
		if(!easingY){
			easingY = easing.linear
		}
		context.lineWidth = 2 * zoomLevel;
		var unit = 1/10
		var newX = 0
		var newY = 0
		context.beginPath();
		for(index = 1; index <= 10; index++){
			newX = easingX(unit * (index - 1), x1, x2 - x1, 1)
			newY = easingY(unit * (index - 1), y1, y2 - y1, 1)
			context.moveTo(newX, newY);
			newX = easingX(unit * index, x1, x2 - x1, 1)
			newY = easingY(unit * index, y1, y2 - y1, 1)
			context.lineTo(newX, newY);
		}
		context.closePath();
		context.stroke();
		
	}
	
	function drawRect(x, y, width, height){
		context.fillStyle = "rgba(1,1,1,0.1)";
		var rect = context.fillRect(x - (width * 0.5), y - (height * 0.5), width, height)
		return rect
	}
	
	function drawGridCursor(){
	
		if(gridIndicator.isVisible){
			var xPosition = gridIndicator.x - (gridIndicator.width * 0.5)
			var yPosition = gridIndicator.y - (gridIndicator.height * 0.5)
			context.drawImage(gridIndicator.image, xPosition, yPosition, gridIndicator.width, gridIndicator.height)
			context.strokeStyle = "yellow"
			drawLine(xPosition + gridIndicator.width * 0.5, 0, xPosition + gridIndicator.height * 0.5, defaultWidth)
			drawLine(0, yPosition + gridIndicator.width * 0.5, defaultWidth, yPosition + gridIndicator.height * 0.5)
		}
		
		if(pathTracker.length >= 1){
			drawLine(pathTracker[0].x, pathTracker[0].y, gridVertices[currentVertexId].x, gridVertices[currentVertexId].y, currentEasing.func)
		}
	}
	
	function drawGrid(){
		var currentOffsetX = 0
		var currentOffsetY = 0
		context.strokeStyle = "white"
		for(lines = 0; lines <= defaultWidth; lines++){
			drawLine(currentOffsetX, 0, currentOffsetY, defaultHeight);
			drawLine(0, currentOffsetY, defaultWidth, currentOffsetY);
			currentOffsetX += defaultGrid;
			currentOffsetY += defaultGrid;
		}
		
		if (isSquaresEnabled){
			for(indexVertex = 0; indexVertex < gridVertices.length; indexVertex++){
				var vertex = gridVertices[indexVertex]
				drawRect(vertex.x, vertex.y, cellSizeX * 0.8, cellSizeY * 0.8)
			}
		}
		
		context.strokeStyle = "red"
		drawLine(defaultWidth * 0.5, 0, defaultWidth * 0.5, defaultHeight);
		drawLine(0, defaultHeight * 0.5, defaultWidth, defaultHeight * 0.5);
		
	}
	
	function drawPlayer(){
		var player = saveData.player
		//context.drawImage(images.player, player.position.x - (cellSizeX * 0.5), player.position.y - (cellSizeY * 0.5), cellSizeX, cellSizeY)
		var elementWidth = 150
		var elementHeight = 150
		var xPosition = player.position.x - (elementWidth * 0.5)
		var yPosition = player.position.y - (elementWidth * 0.5)
		context.drawImage(images.player, xPosition, yPosition, elementWidth, elementHeight)
	}
	
	function drawEnemies(){
		var enemies = saveData.enemies
		var elementWidth = 150
		var elementHeight = 150
		for (indexEnemy = 0; indexEnemy < enemies.length; indexEnemy++){
			if(enemies[indexEnemy] != null){
				var xPosition = enemies[indexEnemy].spawnPoint.x - (elementWidth * 0.5)
				var yPosition = enemies[indexEnemy].spawnPoint.y - (elementHeight * 0.5)
				context.drawImage(images.enemies[enemies[indexEnemy].index], xPosition, yPosition, elementWidth, elementHeight)
			}
		}
	}
	
	function drawObstacles(){
		var obstacles = saveData.obstacles
		var elementWidth = 300
		var elementHeight = 300
		for (indexObstacle = 0; indexObstacle < obstacles.length; indexObstacle++){
			var xPosition = obstacles[indexObstacle].position.x - (elementWidth * 0.5)
			var yPosition = obstacles[indexObstacle].position.y - (elementHeight * 0.5)
			context.drawImage(images.obstacles[obstacles[indexObstacle].index], xPosition, yPosition, elementWidth, elementHeight)
		}
	}
	
	function drawBases(){
		var bases = saveData.bases
		var elementWidth = 300
		var elementHeight = 300
		for (indexBase = 0; indexBase < bases.length; indexBase++){
			var xPosition = bases[indexBase].position.x - (elementWidth * 0.5)
			var yPosition = bases[indexBase].position.y - (elementHeight * 0.5)
			context.drawImage(images.bases[bases[indexBase].index], xPosition, yPosition, elementWidth, elementHeight)
		}
	}
	
	function drawPlanet(){
		var planet = saveData.earth
		var elementWidth = 300
		var elementHeight = 300
		var xPosition = planet.position.x - (elementWidth * 0.5)
		var yPosition = planet.position.y - (elementHeight * 0.5)
		context.drawImage(images.planet, xPosition, yPosition, elementWidth, elementHeight)
	}
	
	function drawAsteroids(){
		var asteroids = saveData.asteroids
		var elementWidth = 100
		var elementHeight = 100
		for (indexAsteroid = 0; indexAsteroid < asteroids.length; indexAsteroid++){
			if (asteroids[indexAsteroid] != null){
				drawLine(asteroids[indexAsteroid].start.x, asteroids[indexAsteroid].start.y, asteroids[indexAsteroid].end.x, asteroids[indexAsteroid].end.y, asteroids[indexAsteroid].easingX.func)
				
				var xPosition = asteroids[indexAsteroid].start.x - (elementWidth * 0.5)
				var yPosition = asteroids[indexAsteroid].start.y - (elementHeight * 0.5)
				context.drawImage(images.asteroids.start, xPosition, yPosition, elementWidth, elementHeight)
				
				var xPosition = asteroids[indexAsteroid].end.x - (elementWidth * 0.5)
				var yPosition = asteroids[indexAsteroid].end.y - (elementHeight * 0.5)
				context.drawImage(images.asteroids.end, xPosition, yPosition, elementWidth, elementHeight)
			}
		}
	}
	
	function drawGridElements(){
		
		drawPlayer()
		drawEnemies()
		drawObstacles()
		drawBases()
		drawPlanet()
		drawAsteroids()
	}
	
	function updateGridVertices(){
		if (!updatedVertices){
			gridVertices = [];
			var currentOffsetX = 0//defaultGrid * 0.5;
			var currentOffsetY = 0//defaultGrid * 0.5;
			
			var totalRows = (defaultWidth / defaultGrid);
			var totalColumns = (defaultHeight / defaultGrid);
			var vertexIndex = 0
				
			for(indexRow = 0; indexRow <= (defaultHeight / defaultGrid); indexRow++){
				for(indexColumn = 0; indexColumn <= (defaultWidth / defaultGrid); indexColumn++){
					gridVertices[vertexIndex] = {
						x: 0,
						y: 0,
					}
					gridVertices[vertexIndex].x = (defaultGrid * indexColumn) + currentOffsetX;
					gridVertices[vertexIndex].y = (defaultGrid * indexRow) + currentOffsetY;
					vertexIndex++;
				}
			}
			updatedVertices = true;
		}
	}
	
	function selectAllText(event){
		document.execCommand('selectAll',false,null)
		console.log("asd")
	}
	
	function enterMainLoop(){
		context.rect(0,0, defaultWidth, defaultHeight);
		context.fillStyle = "rgb(79,58,108)"
		context.fill()
		updateGridVertices();
		drawGrid();
		//drawLine(0, defaultHeight, defaultWidth, 0, easing.linear, currentEasing.func);
		drawGridCursor();
		drawGridElements();
		//requestAnimationFrame(enterMainLoop);
	}
	
	preloadImages();
	initializeEditor();
	initializeEditor();
	enterMainLoop();
}
mainEditor();