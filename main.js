//import './style.css';

//https://codepen.io/sbrl/pen/zNdqdd (smoke effect threejs)

//import "./styles/normalize.css";
import "./styles/styles.less";

import $ from 'jquery';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
//import { particlesCursor } from 'threejs-toys'

//XLSX
import * as XLSX from 'xlsx';

//Scrollmagic
import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

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
            const workbook = XLSX.read(data, { type: 'array' });

            // Convert the first sheet to JSON
            const sheetName = workbook.SheetNames[0]; // Get the first sheet's name
            const sheet = workbook.Sheets[sheetName];
            json = XLSX.utils.sheet_to_json(sheet);

            console.log(json); // Log the JSON data

            // Run your existing functions with the JSON data
            createTimeline(json);
            const revealElements = $("ul#timeline li");
            initializeReveal();
            revealElems(revealElements);

            return json;
        })
        .catch(error => {
            console.error("Failed to load sheet file:", error);
        });
}

loadExcel();

// function loadJSON(reference) {
//     console.log("loaded");
//     $.getJSON("./json/timeline.json")
//         .done(function (data) {
//             json = data;
//             console.log(data);
//             createTimeline(json)

//             revealElements = $("ul#timeline li");

//             initializeReveal();
//             revealElems(revealElements);
//             return json;
//         })
//         .fail(function (jqxhr, textStatus, error) {
//             var err = textStatus + ", " + error;
//             console.log("Request Failed: " + err);
//         });
// }

// loadJSON();

function createTimeline(json) {
    // Assuming you have a <ul> element with the ID 'milestones' in your HTML
    const $milestones = $("ul#timeline");

    // Clear existing list items (optional)
    $milestones.empty();

    // Iterate over each item in the JSON array
    json.forEach(item => {
        // Create an <li> element
        const $li = $("<li></li>").addClass(item.class); // Assign the classes

        // Check if paradox is true
        if (item.paradox) {
            // If true, wrap the content in an <a> tag
            const $link = $("<a></a>").html(item.content);
            $li.append($link);
        } else if(item.title){
            const $title = $("<h2></h2>").html(item.content);
            $li.append($title);
        } 
        else if(item.subtitle){
            const $subtitle = $("<h3></h3>").html(item.content);
            $li.append($subtitle);
        } 
        else {
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

function initializeReveal() {
    //draw visible svgs
    var totalHeight = $("main").outerHeight();
    console.warn(totalHeight);
    mainScene = new ScrollMagic.Scene({
        triggerElement: "main",
        duration: totalHeight - 550, //position of the END marker (in pixels),
        triggerHook: -0.1,
    })
    .addTo(controller)
    .addIndicators({
        name: 'line',
        indent: 0
    }) // add indicators (requires plugin)
    .on("update", function (e) {
        //console.log(e.target.controller().info("scrollDirection"));
    })
}

// build scenes
var revealElements;

function revealElems(elems) {
    for (var i = 0; i < elems.length; i++) {
        // create a scene for each element
        new ScrollMagic.Scene({
                triggerElement: elems[i], // y value not modified, so we can use element as trigger as well
                offset: 0, // start a little later
                triggerHook: 0.53,
            })
            //.setClassToggle(elems[i], "visible") // add class toggle
            // .addIndicators({
            //     name: "digit " + (i + 1)
            // }) // add indicators (requires plugin)
            .addTo(controller)
            .on("enter" , function(e){
                e.target.triggerElement().classList.add("visible");
                //updateDivHeight("#stream"); // Update height of target div on enter
                drawLine();
            })
            .on("progress", function (e) {
                var scrollDirection = e.target.controller().info("scrollDirection");
                //console.log(i)
                //console.log(scrollDirection);
                //console.log(e.progress.toFixed(3));
            })
    }
}

// Function to update the height of the target div
function updateDivHeight(targetDiv) {
    var totalHeight = 0;
    
    $("ul#timeline li.visible").each(function() {
        totalHeight += $(this).outerHeight(true); // Add the outer height of each visible item
    });
    console.log(totalHeight);
    // Set the height of the target div
    console.log(targetDiv);
    $(targetDiv).find('.line').css('height', totalHeight + 'px'); // Update height using jQuery
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
        totalHeight + 25 + "px"
    );
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
/* const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const threerenderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true // Enable transparency
});

threerenderer.setPixelRatio(window.devicePixelRatio);
threerenderer.setSize(window.innerWidth, window.innerHeight);
threerenderer.setClearColor(0x000000, 0); // Set clear color to transparent
camera.position.setZ(30);
camera.position.setX(-3);

// Loading Manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function() {
    // Everything is loaded, start rendering
    document.body.onscroll = moveCamera;
    moveCamera();
    animate();
};

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff); // Soft white ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10); // Position the light
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xff0000, 1, 100); // Red point light
pointLight.position.set(0, 0, 10); // Position the light
scene.add(pointLight);

// Helpers
// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)
// const controls = new OrbitControls(camera, renderer.domElement);


// Avatar
const loader = new GLTFLoader(loadingManager);
let classicMac;

function loadMac(){
    loader.load('/models/mac.gltf', function(gltf) {
        classicMac = gltf.scene;
        scene.add(classicMac);
    
        // Set the position and scale of classicMac after it's loaded
        classicMac.position.z = -5;
        classicMac.position.x = 2;
        classicMac.scale.set(10, 10, 10); // Scaling the model
        
        // Make classicMac face the camera
        classicMac.rotation.y = Math.PI; // 180 degrees
    
        // List all meshes
        classicMac.traverse((child) => {
            if (child.isMesh) {
                console.log(`Mesh name: ${child.name}`);
    
                // Make the material more reflective
                child.material.metalness = 0.2;
                child.material.roughness = 0.5;
                //child.material.envMap = envMap; // Apply environment map for reflections
                child.material.needsUpdate = true;
            }
        });
    
        // Add the scroll event listener after classicMac is loaded
        document.body.onscroll = moveCamera;
        moveCamera();
    
        // Call the function to initialize the video texture
        //initVideoTexture();
    }, undefined, function(error) {
        console.error(error);
    });
}
loadMac();

// Scroll Animation
let previousScrollTop = 0; // Track the previous scroll position

function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    // Rotate the moon
    //moon.rotation.y += 0.030;

    // Calculate the change in scroll position
    const scrollDelta = previousScrollTop - t;

    // Rotate classicMac if it's defined
    if (classicMac) {
        classicMac.rotation.z += scrollDelta * 0.001; // Adjust the multiplier as needed for the desired rotation speed
        classicMac.rotation.y += scrollDelta * 0.001; // Adjust the multiplier as needed for the desired rotation speed
    }

    // Update the camera position and rotation based on scroll
    camera.position.z = t * -0.01;
    camera.position.x = t * -0.0002;
    camera.rotation.y = t * -0.0002;

    // Update the previous scroll position
    previousScrollTop = t;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    //moon.rotation.y += 0.0005;

	//classicMac.rotation.z += 0.01/Math.PI; //

    // controls.update();

    threerenderer.render(scene, camera);
} */

// No need to call animate() here, it's called in the loading manager's onLoad callback