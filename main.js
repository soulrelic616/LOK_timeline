//import './style.css';

//https://codepen.io/sbrl/pen/zNdqdd (smoke effect threejs)

//import "./styles/normalize.css";
import "./styles/styles.less";

import $ from 'jquery';

// Attach $ to the window object
window.$ = $;
window.jQuery = $; // Optional, in case you want to access jQuery using jQuery

import * as THREE from 'three';
import {
	OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';
import {
	GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader';
//import { particlesCursor } from 'threejs-toys'

//XLSX
import * as XLSX from 'xlsx';

//Scrollmagic
import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

//Howler
import {
	Howl
} from 'howler';

//test json data for references list
var json;
console.log('Hello');

function loadExcel() { // Removed the reference parameter
	console.log("loaded");

	// Fetch the Excel file
	fetch('./content/timeline.xlsx')
		.then(response => response.arrayBuffer()) // Read it as an ArrayBuffer
		.then(data => {
			// Parse the file
			const workbook = XLSX.read(data, {
				type: 'array'
			});

			// Convert the first sheet to JSON
			const sheetName = workbook.SheetNames[0]; // Get the first sheet's name
			const sheet = workbook.Sheets[sheetName];
			json = XLSX.utils.sheet_to_json(sheet);

			console.log(json); // Log the JSON data

			// Run your existing functions with the JSON data
			createTimeline(json);
			const revealElements = $("ul#timeline li");
			timelineScene();
			revealElems(revealElements);
			handleGames(revealElements);

			clickAnchors();

			return json;
		})
		.catch(error => {
			console.error("Failed to load sheet file:", error);
		});
}

loadExcel();

function createTimeline(json) {
	// Assuming you have a <ul> element with the ID 'milestones' in your HTML
	const $milestones = $("ul#timeline");

	// Clear existing list items (optional)
	$milestones.empty();

	// Iterate over each item in the JSON array
	json.forEach(item => {
		// Create an <li> element
		const $li = $("<li></li>").addClass(item.class); // Assign the classes

		// Check if the item has an ID and assign it to the <li>
		if (item.id) {
			$li.attr("id", item.id);
		}
		if (item.entry) {
			$li.attr("data-entry", item.entry);
			$li.addClass(item.entry);
		}

		// Check if the item has an "image" entry
		if (item.image) {
			// Split the image entry by commas to handle multiple images
			const images = item.image.split(',');
			// Create a div to hold the images
			const $imageContainer = $("<div class='image-container'></div>");

			// Loop over each image and create an <img> element
			images.forEach(imgSrc => {
				const $img = $("<img>").attr("src", imgSrc.trim());
				$imageContainer.append($img);
			});

			// Prepend the image container to the <li> element
			$li.prepend($imageContainer);
		}

		// Check if paradox is true
		if (item.paradox) {
			// If true, wrap the content in an <a> tag
			const $link = $("<a href=" + item.paradox + "></a>").html(item.content);
			$li.append($link);
			$li.addClass("paradox")
		} else if (item.travel) {
			// If true, wrap the content in an <a> tag
			const $link = $("<a href=" + item.travel + "></a>").html(item.content);
			$li.append($link);
			$li.addClass("travel")
		} else if (item.title) {
			const $title = $("<h2></h2>").html(item.content);
			$li.append($title);
		} else if (item.subtitle) {
			const $subtitle = $("<h3></h3>").html(item.content);
			$li.append($subtitle);
		} else {
			// If false, just add the content
			$li.html(item.content);
		}

		// Append the <li> to the <ul>
		$milestones.append($li);
	});
}

// init controller
var mainScene;
var controller = new ScrollMagic.Controller({
	container: "#container",
	loglevel: 1,
});

function timelineScene() {
	//draw visible svgs
	var totalHeight = $("#contents").outerHeight();
	//console.warn(totalHeight);
	mainScene = new ScrollMagic.Scene({
			triggerElement: "#contents",
			duration: totalHeight - 550, //position of the END marker (in pixels),
			triggerHook: -0.1,
		})
		.addTo(controller)
		// .addIndicators({
		//     name: 'line',
		//     indent: 0
		// }) // add indicators (requires plugin)
		.on("update", function (e) {
			//console.log(e.target.controller().info("scrollDirection"));
		})
}

// build scenes
function revealElems(elems) {
	for (var i = 0; i < elems.length; i++) {
		// create a scene for each element
		new ScrollMagic.Scene({
				triggerElement: elems[i], // y value not modified, so we can use element as trigger as well
				offset: 0, // start a little later
				triggerHook: 0.90,
			})
			.setClassToggle(elems[i], "visible") // add class toggle
			// .addIndicators({
			//     name: "digit " + (i + 1)
			// }) // add indicators (requires plugin)
			.addTo(controller)
			.on("enter", function (e) {
				//e.target.triggerElement().classList.add("visible");
				//updateDivHeight("#stream"); // Update height of target div on enter
				drawLine();
			})
			.on("progress", function (e) {
				var scrollDirection = e.target.controller().info("scrollDirection");
			})
			.on("update", function (e) {
				//console.log(e.target.controller().info("scrollDirection"));
			})
	}
}

function handleGames(elems) {
	for (var i = 0; i < elems.length; i++) {
		// create a scene for each element
		new ScrollMagic.Scene({
				triggerElement: elems[i], // y value not modified, so we can use element as trigger as well
				offset: 0, // start a little later
				triggerHook: 0.30,
			})
			//.setClassToggle(elems[i], "visible") // add class toggle
			// .addIndicators({
			//     name: "gameEvent " + (i + 1),
			//     indent: 150,
			//     colorTrigger: "#FFF"
			// }) // add indicators (requires plugin)
			.addTo(controller)
			.on("enter", function (e) {

			})
			.on("progress", function (e) {
				var scrollDirection = e.target.controller().info("scrollDirection");
				//console.log(e)
				//console.log(scrollDirection);
				//console.log(e.progress.toFixed(3));
				if (e.target.triggerElement().getAttribute("data-entry")) {
					var gameEntry = e.target.triggerElement().getAttribute("data-entry");
					//console.log(gameEntry);
					$('nav li').removeClass('active');
					$('nav').find('#' + gameEntry).addClass('active');
				} else {
					$('nav li').removeClass('active');
				}
			})
			.on("update", function (e) {
				//console.log(e.target.controller().info("scrollDirection"));
				//console.log(e);
			})
	}
}

function drawLine() {
	var totalHeight = 0;
	var visibles = $("ul#timeline li.visible").length - 1;


	$("ul#timeline li.visible").each(function (index) {
		if (index == visibles) {
			return false;
		}
		totalHeight += $(this).outerHeight(true);
	});
	//console.log(totalHeight)
	$("#stream .line").css(
		"height",
		totalHeight + 0 + "px"
	);
}

// Select your scrollable div
const scrollableDiv = document.querySelector('.scrollarea');
let scrollPosition = 0;
let isAnimating = false; // Flag to track if an animation is happening

// Listen for wheel events on the window
window.addEventListener('wheel', (event) => {
	// Only allow scrolling if not animating
	if (!isAnimating) {
	  // Update scroll position based on wheel delta
	  scrollPosition += event.deltaY;
	  
	  // Ensure scroll position stays within the bounds of the div
	  scrollPosition = Math.max(0, Math.min(scrollPosition, scrollableDiv.scrollHeight - scrollableDiv.clientHeight));
  
	  // Set the scroll position of the .scrollarea
	  scrollableDiv.scrollTop = scrollPosition;
	} else {
	  // Prevent default scrolling if animating
	  event.preventDefault();
	}
  });
  
  // Update scrollPosition when the user scrolls the .scrollarea
  scrollableDiv.addEventListener('scroll', () => {
	// Update scrollPosition only if not animating
	if (!isAnimating) {
	  scrollPosition = scrollableDiv.scrollTop;
	}
  });
  
  // Scroll to Event
  function scrollToEvent(destination) {
	const offset = 100; // Adjust this value as needed
	const target = $("#" + destination);
	
	if (target.length) {
	  isAnimating = true; // Set animation flag to true
  
	  // Calculate the target scroll position
	  const targetScrollPosition = target.offset().top - $(".scrollarea").offset().top - offset;
	  
	  // Animate scrolling within the scrollarea
	  $(".scrollarea").animate({
		scrollTop: targetScrollPosition + $(".scrollarea").scrollTop() // Add current scroll position
	  }, 1000, function() {
		// Update scrollPosition after animation completes
		scrollPosition = scrollableDiv.scrollTop;
		isAnimating = false; // Reset animation flag when done
	  });
	} else {
	  console.error('Target element not found:', destination);
	}
  }
  
  function clickAnchors() {
  	$('a[href^="#"]').click(function (event) {
  		// Prevent the default action (navigating to the href)
  		event.preventDefault();

  		// Extract the destination from the href
  		var thisHref = this.href.split('#');
  		var destination = thisHref[1];

  		scrollToEvent(destination);

		$('.'+destination).addClass('active');

  	});
  }

$(".scrollarea").scroll(function () {

	drawLine();

	var scrolling = true;
	clearTimeout(scrollTimeout);
	var scrollTimeout = setTimeout(function () {
		drawLine();
		scrolling = false;
		clearTimeout(scrollTimeout);
	}, 500);
});

//Audio

// Create a new Howl instance for the background music
const MAX_VOLUME = 0.2; // Set maximum volume as 0.3

const backgroundMusic = new Howl({
	src: ['/audio/Kain_Encounter.mp3'],
	autoplay: false, // Set to false to prevent autoplay
	loop: true,
	volume: 0 // Start at 0 volume to apply fade-in on first play
});

const toggleButton = document.getElementById('audio-toggle');
let isPlaying = false; // Initial play state is false

// Function to start music and apply fade-in
function startMusic() {
	backgroundMusic.play();
	backgroundMusic.fade(0, MAX_VOLUME, 3000); // Fade in over 3 seconds
	isPlaying = true;
	toggleButton.classList.remove('muted'); // Update button class to show unmuted state
	window.removeEventListener('click', startMusic); // Remove listener after first click
}

window.addEventListener('click', startMusic);

// Toggle button handler to mute/unmute music
toggleButton.addEventListener('click', () => {
	if (isPlaying) {
		backgroundMusic.fade(MAX_VOLUME, 0, 1000); // Fade out over 1 second
		setTimeout(() => backgroundMusic.pause(), 1000); // Pause after fade-out
		toggleButton.classList.add('muted'); // Add muted class
	} else {
		backgroundMusic.play();
		backgroundMusic.fade(0, MAX_VOLUME, 3000); // Fade in over 3 seconds
		toggleButton.classList.remove('muted'); // Remove muted class
	}
	isPlaying = !isPlaying; // Toggle play/pause state
});




// class Smoke {

//     constructor(options) {
//       const defaults = {
//         width: window.innerWidth,
//         height: window.innerHeight
//       };

//       Object.assign(this, options, defaults);
//       this.onResize = this.onResize.bind(this);

//       this.addEventListeners();
//       this.init();
//     }

//     init() {
//       const { width, height } = this;

//       this.clock = new THREE.Clock();

//       const renderer = this.renderer = new THREE.WebGLRenderer();

//       renderer.setSize(width, height);

//       this.scene = new THREE.Scene();

//       const meshGeometry = new THREE.BoxGeometry(200, 200, 200);
//       const meshMaterial = new THREE.MeshLambertMaterial({
//         color: 0xaa6666,
//         wireframe: false
//       });
//       this.mesh = new THREE.Mesh(meshGeometry, meshMaterial);

//       this.cubeSineDriver = 0;

//       this.addCamera();
//       this.addLights();
//       this.addParticles();
//       this.addBackground();

//       document.body.appendChild(renderer.domElement);
//     }

//     evolveSmoke(delta) {
//       const { smokeParticles } = this;

//       let smokeParticlesLength = smokeParticles.length;

//       while(smokeParticlesLength--) {
//         smokeParticles[smokeParticlesLength].rotation.z += delta * 0.2;
//       }
//     }

//     addLights() {
//       const { scene } = this;
//       const light = new THREE.DirectionalLight(0xffffff, 0.75);

//       light.position.set(-1, 0, 1);
//       scene.add(light);
//     }

//     addCamera() {
//       const { scene } = this;
//       const camera = this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 10000);

//       camera.position.z = 1000;
//       scene.add(camera);
//     }

//     addParticles() {
//       const { scene } = this;
//       const textureLoader = new THREE.TextureLoader();
//       const smokeParticles = this.smokeParticles = [];

//       textureLoader.load('https://rawgit.com/marcobiedermann/playground/master/three.js/smoke-particles/dist/assets/images/clouds.png', texture => {
//         const smokeMaterial = new THREE.MeshLambertMaterial({
//           color: 0xffffff,
//           map: texture,
//           transparent: true
//         });
//         smokeMaterial.map.minFilter = THREE.LinearFilter;
//         const smokeGeometry = new THREE.PlaneGeometry(300, 300);

//         const smokeMeshes = [];
//         let limit = 150;

//         while(limit--) {
//           smokeMeshes[limit] = new THREE.Mesh(smokeGeometry, smokeMaterial);
//           smokeMeshes[limit].position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
//           smokeMeshes[limit].rotation.z = Math.random() * 360;
//           smokeParticles.push(smokeMeshes[limit]);
//           scene.add(smokeMeshes[limit]);
//         }
//       });
//     }

//     addBackground() {
//       const { scene } = this;
//       const textureLoader = new THREE.TextureLoader();
//       const textGeometry = new THREE.PlaneGeometry(600, 320);

//       textureLoader.load('https://rawgit.com/marcobiedermann/playground/master/three.js/smoke-particles/dist/assets/images/background.jpg', texture => {
//         const textMaterial = new THREE.MeshLambertMaterial({
//           blending: THREE.AdditiveBlending,
//           color: 0xffffff,
//           map: texture,
//           opacity: 1,
//           transparent: true
//         });
//         textMaterial.map.minFilter = THREE.LinearFilter;
//         const text = new THREE.Mesh(textGeometry, textMaterial);

//         text.position.z = 800;
//         scene.add(text);
//       });
//     }

//     render() {
//       const { mesh } = this;
//       let { cubeSineDriver } = this;

//       cubeSineDriver += 0.01;

//       mesh.rotation.x += 0.005;
//       mesh.rotation.y += 0.01;
//       mesh.position.z = 100 + Math.sin(cubeSineDriver) * 500;

//       this.renderer.render(this.scene, this.camera);
//     }

//     update() {
//       this.evolveSmoke(this.clock.getDelta());
//       this.render();

//       requestAnimationFrame(this.update.bind(this));
//     }

//     onResize() {
//       const { camera } = this;

//       const windowWidth  = window.innerWidth;
//       const windowHeight = window.innerHeight;

//       camera.aspect = windowWidth / windowHeight;
//       camera.updateProjectionMatrix();

//       this.renderer.setSize(windowWidth, windowHeight);
//     }

//     addEventListeners() {
//       window.addEventListener('resize', this.onResize);
//     }

//   }

//   /* app.js */

//   const smoke = new Smoke();

//   smoke.update();


// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const threerenderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
	alpha: true // Enable transparency
});

threerenderer.setPixelRatio(window.devicePixelRatio);
threerenderer.setSize(window.innerWidth, window.innerHeight);
threerenderer.setClearColor(0x000000, 0); // Set clear color to transparent
camera.position.setZ(3);
camera.position.setX(0);
camera.position.setY(0);

// Function to handle resizing
function handleResize() {
	// Update camera aspect ratio and renderer size
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix(); // Update the projection matrix
	threerenderer.setSize(window.innerWidth, window.innerHeight);
}

// Attach the resize event listener
window.addEventListener('resize', handleResize);

// Loading Manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function () {
	// Everything is loaded, start rendering
	document.body.onscroll = moveObjects;
	moveObjects();
	animate();
};

// Lights
//const ambientLight = new THREE.AmbientLight(0xffffff); // Soft white ambient light
//scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10); // Position the light
//scene.add(directionalLight);

// Create a point light with a lower intensity and limited range
const pointLight = new THREE.PointLight(0xffffff, 40, 10.6, 1); // Intensity, range, decay
pointLight.position.set(0, 0, 0); // Position the light near the area you want to highlight
pointLight.castShadow = true; // Enable shadows for a dramatic effect

// Set shadow properties to control shadow quality
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 25;

// Add the point light to the scene
scene.add(pointLight);

// Optional: Add a very dim ambient light for slight visibility in shadowed areas
const ambientLight = new THREE.AmbientLight(0x000000, 0.05);
scene.add(ambientLight);

// Helpers
// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)
// const controls = new OrbitControls(camera, renderer.domElement);


// Avatar
const loader = new GLTFLoader(loadingManager);
let soulReaver;


//Look here: https://stackoverflow.com/questions/63347147/gltf-exported-from-blender-with-metallic-texture-and-no-roughness-texture-is-loa
function loadReaver() {
	loader.load('/model/reaver-3.gltf', function (gltf) {
		soulReaver = gltf.scene;

		// Load the texture using TextureLoader
		const textureLoader = new THREE.TextureLoader();
		const texture = textureLoader.load('/model/combined_texture.png'); // Adjust the path as necessary

		//Set the initial opacity of the model's material to 0
		soulReaver.traverse((child) => {
			if (child.isMesh) {
				child.material.transparent = true;
				child.material.opacity = 0;
			}
		});


		scene.add(soulReaver);

		// Set the position and scale of soulReaver after it's loaded
		soulReaver.position.z = -8;
		soulReaver.position.x = 6;
		soulReaver.position.y = 0;
		soulReaver.scale.set(15, 15, 15); // Scaling the model

		// Make soulReaver face the camera
		//soulReaver.rotation.y = -44.313;
		soulReaver.rotation.y = -44.43399999999994;

		// Fade-in animation
		let opacity = 0;
		const fadeIn = () => {
			opacity += 0.01; // Adjust speed by changing the increment
			soulReaver.traverse((child) => {
				if (child.isMesh) {
					child.material.opacity = Math.min(opacity, 1);
				}
			});
			if (opacity < 1) {
				requestAnimationFrame(fadeIn);
			}
		};
		fadeIn();

		// Reference the scrollable div using querySelector
		const scrollableDiv = document.querySelector('.scrollarea');
		if (!scrollableDiv) {
			console.error('Scrollable element .scrollarea not found');
			return;
		}

		// Confirm scrollableDiv is scrollable
		scrollableDiv.style.overflowY = 'scroll';
		scrollableDiv.style.height = '500px'; // Set appropriate height for scrolling

		// Add the scroll event listener to the scrollable div
		scrollableDiv.addEventListener('scroll', moveObjects);
		moveObjects();

	}, undefined, function (error) {
		console.error(error);
	});
}
loadReaver();

// Scroll Animation
let previousScrollTop = 0; // Track the previous scroll position

function moveObjects() {
	const scrollableDiv = document.querySelector('.scrollarea');
	const scrollTop = scrollableDiv.scrollTop;

	//console.log("Scroll Top:", scrollTop); // Debugging: check scroll position

	// Calculate the change in scroll position
	const scrollDelta = previousScrollTop - scrollTop;

	// Rotate soulReaver if it's defined
	if (soulReaver) {
		//soulReaver.rotation.z += scrollDelta * 0.001;
		soulReaver.rotation.y += scrollDelta * 0.001;
		soulReaver.position.y -= scrollDelta * 0.004;
		//console.log(soulReaver.rotation.y);
	}

	// Update camera position and rotation based on scroll
	// camera.position.z = scrollTop * -0.01;
	// camera.position.x = scrollTop * -0.0002;
	//camera.rotation.y = scrollTop * -0.0002;

	// Update the previous scroll position
	previousScrollTop = scrollTop;
}

// Animation Loop
function animate() {
	requestAnimationFrame(animate);

	//moon.rotation.y += 0.0005;

	//soulReaver.rotation.z += 0.01/Math.PI; //

	// controls.update();

	threerenderer.render(scene, camera);
}
// No need to call animate() here, it's called in the loading manager's onLoad callback
