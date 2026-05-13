// ===== Global state & helpers =====
const ambientAudio = document.getElementById("ambientAudio");
const voiceToggle  = document.getElementById("voiceToggle");
const titleEl      = document.getElementById("title");
const storyEl      = document.getElementById("storyText");
const buttonsEl    = document.getElementById("buttonsContainer");
const gameWrap     = document.getElementById("gameContainer");

let soundEnabled = false;
let narrationUtterance = null;
let currentStage = "intro";
let previousStage = null;

let totalScore = 0; 
let mission1Completed = false;
let mission2Completed = false;
let mission3Completed = false;
const REQUIRED_SCORE = 3;

// ===== Stage data =====
const STAGES = {
  intro: {
    title: "The Craftsmen of Archaic Korkyra",
    text: `Learn about the ancient world of Corfu through the eyes of skilled artisans.<br> Click <b>"continue"</b> once you are ready.`,
    buttons: [
      { label: "Continue", action: () => goTo("role") }
    ]
  },

  role: {
    title: "Your Quest",
    text: `Search and scan the markers scattered, representing different customers.<br> Complete their <b>requests</b> to progress!`,
    buttons: [
      { label: "Continue", action: () => goTo("instructions") },
    ]
  },

Main_Screen: {
    title: "Main Hub",
    text: `Complete all customer requests and finish your quest!<br> Click "Go!" to start scanning for markers!`,
    buttons: [
      { label: "Go!", action: () => enterARMode() },
      { label: "Library", action: () => goTo("library") },
      { label: "Game Instructions", action: () => goTo("instructions") },
      { 
        label: "Finish Task", 
        action: () => {
            if (totalScore >= REQUIRED_SCORE) {
                goTo("end");
            } else {
                alert(`There are 3 customers for you to assist. You have completed: ${totalScore}.`);
            }
        } 
      }
    ]
},

  instructions: {
    title: "How to Play ",
    text: `
      • You play as different types of craftsmen & artisans of the Archaic Era.<br>
      • Explore the Museum, using your device camera to scan AR markers hidden within it.<br>
      • Each marker reflects a different customer, based on the different casts and vocations of the time<br>
      • Complete their requests in any order, by making proper material combinations<br>
      • After you are done, return to the Main Hub to learn more about these items in the library!<br>
    `,
    buttons: [
      { label: "Back", action: () => goTo("Main_Screen") }
    ]
  },

  // ——— Minimal edits so the end "has meaning" ———
  end: {
    title: "Success!",
    text: `You have mastered the crafts of the Archaic Era.<br> Would you like to play again;`,
    buttons: [
      { label: "Play Again", action: () => {
          // Reset score and missions for replay
          totalScore = 0;
          mission1Completed = false;
          mission2Completed = false;
          mission3Completed = false;
          completedMissions = new Set();
          goTo("Main_Screen");
      }}
    ]
  },

  // ——— Library Stage ———
  library: {
    title: "Library",
    text: `
      <div id="library-container">
        <div id="tab-buttons" class="library-tabs">
          <button class="tab-btn active" data-tab="customers">Customers</button>
          <button class="tab-btn" data-tab="artifacts">Artifacts</button>
          <button class="tab-btn" data-tab="materials">Materials</button>
        </div>
        <div id="tab-content" class="library-content">
          <div id="customers" class="tab-content-panel active">
            <h3>Customers</h3>
            <div id="default-customers-msg" class="default-message">
              <p>Complete missions to unlock customer information here.</p>
            </div>
            <div id="mission-1-item" class="library-item hidden">
              <h4>The Peasant</h4>
              <p>In Archaic Korkyra (modern Corfu), peasants formed the backbone of daily life.
               Most lived in small farming communities outside the city walls, working land that
               produced olives, barley, grapes, figs, and vegetables. Life revolved around the
               seasons: ploughing in autumn, sowing in winter, harvesting in summer, and preparing
               stores before the storms of the Ionian winter arrived.</p>
              <p>Although wealthy citizens and merchants controlled trade and politics, peasants
              sustained the island's economy through agriculture and manual labour. Many supplied
              food to sailors, craftsmen, soldiers, and temples. Some peasants also worked as
              woodcutters, fishermen, or seasonal labourers during harvest periods. In a maritime
              city-state like Korkyra, farmers were deeply connected to trade, since olive oil, wine,
              and agricultural goods were exported across the Ionian and Adriatic seas.</p>
            </div>
            <div class="item-separator hidden" id="mission-1-separator"></div>
            <div id="mission-2-item" class="library-item hidden">
              <h4>The Soldier</h4>
              <p>In Archaic Korkyra, soldiers were citizen-warriors expected to defend their polis during war.
              Those who could afford proper equipment fought as hoplites — heavily armed infantry who stood together
              in the phalanx, a dense shield-wall formation that relied on discipline and unity.</p>
              <p>Korkyra's strategic position in the Ionian Sea meant conflict was always a possibility. 
              Rivalries between city-states, pirate raids, and colonial disputes made military readiness essential.
              Soldiers trained with spears and shields, marched in formation, and learned to endure long campaigns
              under harsh conditions. Even simple items like sandals and leather straps could decide whether a warrior
              remained mobile and battle-ready.</p>
            </div>
            <div class="item-separator hidden" id="mission-2-separator"></div>
            <div id="mission-3-item" class="library-item hidden">
              <h4>The Noble</h4>
              <p>In Archaic Korkyra, noblewomen belonged to the wealthiest households of the polis. 
              Their lives were closely tied to family prestige, religious ceremony, and the management of the household.
              While men dominated politics and warfare, elite women played important roles in maintaining family influence 
              through marriage alliances, ritual duties, textile production, and the display of wealth
              during festivals and ceremonies. Fine clothing, jewelry, decorated containers, and imported goods all reflected
              the status of an aristocratic household.</p>
              <p>In island societies such as Korkyra, noble households benefited greatly from maritime trade. Imported gemstones,
              pigments, and luxury materials arrived through merchant ships traveling the Ionian and Adriatic seas. Noblewomen
              often wore jewelry during religious festivals, weddings, and funerary ceremonies, where appearance carried symbolic 
              meaning tied to family honour and divine favour.</p>
            </div>
          </div>
          <div id="artifacts" class="tab-content-panel">
            <h3>Artifacts</h3>
            <div id="default-artifacts-msg" class="default-message">
              <p>Complete missions to unlock artifact information here.</p>
            </div>
            <div id="artifact-1-item" class="library-item hidden">
              <h4>Farm Sickle</h4>
              <p>A curved harvesting tool used for cutting grain, reeds, and grasses. Farmers swung the sickle in short motions to gather barley
              and wheat during harvest season. Bronze blades were common during the earlier Archaic period, though iron slowly became more
              widespread over time. A well-made sickle could last for years when properly maintained.</p>
              <h4>Water Jug</h4>
              <p>Fresh water had to be carried daily from wells, fountains, or springs. Water jugs were usually made from fired clay because pottery kept
              liquids cool in the Mediterranean heat. In rural households, water was essential not only for drinking, but also for cooking, washing, and mixing
              clay or dyes used by craftsmen.</p>
              <h4>Wooden Bowl</h4>
              <p>Wooden bowls were common eating vessels among poorer households because they were easier and cheaper to produce than decorated pottery. 
              They were used for porridge, olives, bread, fish stew, and fruit. Bowls were often carved from a single block of wood and passed down within families.</p>
            </div>
            <div class="item-separator hidden" id="artifact-1-separator"></div>
            <div id="artifact-2-item" class="library-item hidden">
              <h4>Battle Spear</h4>
              <p>The spear, or doru, was the primary weapon of the Greek hoplite. Made from either bronze or iron,
              it allowed soldiers to strike enemies from behind the protection of their shields. Spears were usually between two and three metres
              long and were designed for thrusting rather than throwing.</p>
              <h4>Bronze Shield</h4>
              <p>The large round shield — often called the aspis — was the most important part of a soldier's equipment. It was built with a core of hardwood
              and reinforced with bronze. Heavy but durable, it protected both the bearer and the warrior standing beside him in the phalanx line.
              Losing one's shield was considered deeply shameful in many Greek city-states.</p>
              <h4>Leather Sandals</h4>
              <p>Soldiers marched long distances across rocky ground and uneven terrain, making sturdy sandals essential. Military sandals used thick leather
              soles and straps to secure the foot while allowing movement in heat and dust. Some wealthier warriors reinforced their footwear with hobnails
              for higher durability.</p>
            </div>
            <div class="item-separator hidden" id="artifact-2-separator"></div>
            <div id="artifact-3-item" class="library-item hidden">
              <h4>Wine Container</h4>
              <p>Wine vessels were symbols of hospitality and aristocratic culture. Noble households stored and served wine during feasts and ceremonial gatherings
              using decorated ceramic or wooden containers sealed with resin to preserve flavour. In Greek society, wine drinking was closely connected to social ritual
              and status.</p>
              <h4>Golden Necklace</h4>
              <p>Gold necklaces displayed wealth, craftsmanship, and family prestige. Greek jewelry of the Archaic era often included chains, beads, pendants, and
              imported gemstones worked into intricate designs. Such ornaments were worn during festivals, marriages, and important religious occasions.</p>
              <h4>Decorated Wood Container</h4>
              <p>Finely carved wooden containers stored jewelry, cosmetics, perfumes, or precious fabrics within elite households. Craftsmen polished the wood carefully
              and sometimes decorated it with painted pigments, resin coatings, or inlaid materials such as bone, ivory, or metal pieces.</p>
            </div>
          </div>
          <div id="materials" class="tab-content-panel">
            <h3>Materials</h3>
            <div id="default-materials-msg" class="default-message">
              <p>Complete missions to unlock information about materials used here.</p>
            </div>
            <div id="material-1-item" class="library-item hidden">
              <h4>Water</h4>
              <p>Essential agricultural materials used by peasants in their daily work. Wood for construction and tools, grain as a staple food source.</p>
              <h4>Bronze Fragments</h4>
              <p>Broken bronze pieces were rarely wasted. Old tools, damaged weapons, and scraps of metal were melted down and reforged into new objects, making bronze a valuable recyclable material.</p>
              <h4>Bronze Ingots</h4>
              <p>Bronze ingots were blocks of refined metal prepared for smithing. Craftsmen heated and hammered them into blades, tools, fittings, and household objects.</p>
              <h4>Wood Blocks</h4>
              <p>Wood from olive, oak, pine, and cypress trees was widely used in Korkyra. A simple wood block could become a bowl, handle, tool shaft, or furniture component depending on the craftsman’s skill.</p>
              <h4>Curved Handles</h4>
              <p>Curved handles improved grip and control on tools such as sickles and knives. Their shape reduced strain during long hours of harvesting or carving.</p>
              <h4>Bronze Blade</h4>
              <p>Bronze blades were sharpened for farming and domestic tasks. Though softer than iron, bronze resisted corrosion well in the island's humid sea climate.</p>
              <h4>Wood Chunk</h4>
              <p>Rough wood chunks were raw crafting materials. Carpenters and villagers shaped them into handles, pegs, bowls, and construction parts using axes and knives.</p>
              <h4>Hydrated Wood</h4>
              <p>Freshly cut or soaked wood was easier to carve because moisture softened the fibres. Craftsmen sometimes shaped wood while wet before drying it in the sun.</p>
              <h4>Axe</h4>
              <p>Axes were among the most important tools in ancient daily life. They were used to cut timber, shape beams, clear farmland, and gather firewood needed for cooking and metalworking.</p>
              </div>
            <div class="item-separator hidden" id="material-1-separator"></div>
            <div id="material-2-item" class="library-item hidden">
              <h4>Iron Fragment</h4>
              <p>Broken iron from damaged tools or weapons could be reforged into spearheads, knives, or fittings. Iron became increasingly important during the Archaic period because it was stronger and more available than bronze.</p>
              <h4>Iron Ingot</h4>
              <p>Iron ingots were raw metal bars prepared for smiths. Heating and hammering them required intense fire and skilled craftsmanship.</p>
              <h4>Leather Strip</h4>
              <p>Thin leather strips were used for bindings, fastenings, and weapon grips. They helped secure armour and tools while remaining flexible.</p>
              <h4>Shield Body</h4>
              <p>The wooden core of a shield provided its shape and strength. Bronze facing added protection, but the wood absorbed much of the impact during combat.</p>
              <h4>Hardwood Chunk</h4>
              <p>Dense woods such as ash or oak were valued for weapons because they resisted cracking during battle. Strong wood was essential for spear shafts and shield frames.</p>
              <h4>Leather Straps</h4>
              <p>Leather straps secured shields, sandals, and armour to the body. Poorly made straps could fail during combat, leaving a soldier vulnerable.</p>
              <h4>Cutting Tool</h4>
              <p>Axes, knives, and chisels shaped wood, leather, and metal into military equipment. Every weapon began as carefully worked raw material.</p>
              <h4>Rope</h4>
              <p>Rope was used for transporting supplies, securing equipment, and reinforcing shield interiors. Ships, camps, and armies all depended heavily on rope-making.</p>
              <h4>Raw Hide</h4>
              <p>Fresh animal hide was tough but stiff and difficult to work with. Craftsmen cleaned and treated it before turning it into usable leather.</p>
              <h4>Cured Leather</h4>
              <p>Once treated with oils, salts, or smoke, leather became more durable and resistant to decay. It was widely used in armour, belts, sandals, and shield linings.</p>
              <h4>Leather Soles</h4>
              <p>Thick leather soles protected soldiers' feet from stone roads, mud, and sharp terrain. Good footwear reduced exhaustion during marches and battles.</p>
            </div>
            <div class="item-separator hidden" id="material-2-separator"></div>
            <div id="material-3-item" class="library-item hidden">
              <h4>Gold Fragment</h4>
              <p>Even tiny pieces of gold were valuable. Goldsmiths melted fragments down to create jewelry, decorative fittings, and ceremonial objects.</p>
              <h4>Gold Ingot</h4>
              <p>Gold ingots were refined metal prepared for delicate craftsmanship. Skilled artisans shaped them into thin sheets, chains, and ornaments via hammers and tongs.</p>
              <h4>Gemstone</h4>
              <p>Imported stones such as agate, chalcedony, and amber were prized by wealthy Greeks for jewelry and decoration. Their rarity reflected access to trade and luxury.</p>
              <h4>Golden Chain</h4>
              <p>Fine gold chains required precise metalworking skill. They were worn as necklaces or attached to pendants and decorative ornaments.</p>
              <h4>Tongs</h4>
              <p>Metal tongs allowed craftsmen to hold heated materials safely during casting and forging. Without them, goldsmithing would have been nearly impossible.</p>
              <h4>Pure Clay</h4>
              <p>Refined clay was used to create molds, containers, and decorative coatings. Fine clay produced smoother surfaces suitable for luxury goods.</p>
              <h4>Shaping Lump</h4>
              <p>The workstation of every potter. Through its constant circular movement, it allowed clay to be shaped into functional and artistic forms.</p>
              <h4>Pigment</h4>
              <p>Mineral pigments added colour to containers, furniture, and ceremonial objects. Reds, blacks, whites, and blues were especially valued in decorative art.</p>
              <h4>Resin</h4>
              <p>Tree resin sealed wooden containers and protected surfaces from moisture. It was also used in perfumes, adhesives, and wine storage.</p>
              <h4>Fine Wood</h4>
              <p>High-quality woods such as cypress, olive, or cedar were selected for decorative carving because of their strength, scent, and attractive grain.</p>
              <h4>Inlay</h4>
              <p>Inlay decoration involved embedding metal, bone, ivory, or stone into wood surfaces. Such details transformed ordinary containers into elite possessions.</p>
              <h4>Varnish</h4>
              <p>Protective coatings made from oils, waxes, or resin helped preserve wood and enhance its colour and shine. Luxury furniture and containers were often carefully varnished to display craftsmanship and wealth.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    buttons: [
      { label: "Back", action: () => goTo("Main_Screen") }
    ],
    onLoad: () => initLibraryTabs()
  }
};

// ===== Sound / Narration =====
function enableSound() {
  soundEnabled = true;
  voiceToggle.classList.add("active");
  voiceToggle.textContent = "🔊";
}

function disableSound() {
  soundEnabled = false;
  voiceToggle.classList.remove("active");
  voiceToggle.textContent = "🔇";
  cancelNarration();
  stopAmbient();
}

function playAmbient() {
  if (!soundEnabled) return;
  ambientAudio.volume = 0.4;
  ambientAudio.play().catch(() => {});
}

function stopAmbient() { ambientAudio.pause(); }

function cancelNarration() {
  // Text-to-speech disabled
}

voiceToggle.addEventListener("click", () => {
  if (soundEnabled) {
    disableSound();
  } else {
    enableSound();
    playAmbient();
  }
});
// ===== Navigation =====
function goTo(stage, resetAll = false) {
  // If called as Restart with resetAll=true, do a soft reset so the action έχει νόημα
  if (resetAll === true) {
    cancelNarration();
    stopAmbient();
    disableSound();               // επιστρέφει το σύστημα σε «σίγαση»
    try { history.replaceState({}, "", location.pathname); } catch {}
  }

  previousStage = currentStage;
  currentStage = stage;
  const s = STAGES[stage];
  if (!s) return;

  if (s.bg) gameWrap.style.backgroundImage = `url('${s.bg}')`;
  titleEl.textContent = s.title || "";
  storyEl.innerHTML = s.text || "";

  buttonsEl.innerHTML = "";
  (s.buttons || []).forEach(b => {
    const btn = document.createElement("button");
    let label = b.label;
    if (stage === "instructions" && b.action.toString().includes("Main_Screen")) {
      label = (previousStage === "role") ? "Continue" : "Back";
    }
    btn.textContent = label;
    btn.addEventListener("click", b.action);
    buttonsEl.appendChild(btn);
  });

  // Call onLoad callback if it exists
  if (s.onLoad && typeof s.onLoad === "function") {
    s.onLoad();
  }
}

// ===== Init =====
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");
  if (section && STAGES[section]) {
    goTo(section);
  } else {
    goTo("intro");
  }
});

// ===== Library Tab Management =====
function initLibraryTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const contentPanels = document.querySelectorAll(".tab-content-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");

      // Remove active class from all buttons and panels
      tabButtons.forEach(b => b.classList.remove("active"));
      contentPanels.forEach(p => p.classList.remove("active"));

      // Add active class to clicked button and corresponding panel
      btn.classList.add("active");
      document.getElementById(tabName)?.classList.add("active");

      // Update library content based on selected tab
      if (tabName === "customers") {
        updateCustomersTab();
      } else if (tabName === "artifacts") {
        updateArtifactsTab();
      } else if (tabName === "materials") {
        updateMaterialsTab();
      }
    });
  });

  // Initialize customers tab on load
  updateCustomersTab();
}

function updateCustomersTab() {
  const defaultMsg = document.getElementById("default-customers-msg");
  const mission1Item = document.getElementById("mission-1-item");
  const mission1Sep = document.getElementById("mission-1-separator");
  const mission2Item = document.getElementById("mission-2-item");
  const mission2Sep = document.getElementById("mission-2-separator");
  const mission3Item = document.getElementById("mission-3-item");

  // Hide default message if any mission is completed
  if (mission1Completed || mission2Completed || mission3Completed) {
    defaultMsg.classList.add("hidden");
  } else {
    defaultMsg.classList.remove("hidden");
  }

  // Show/hide mission items
  if (mission1Completed) {
    mission1Item.classList.remove("hidden");
    mission1Sep.classList.remove("hidden");
  } else {
    mission1Item.classList.add("hidden");
    mission1Sep.classList.add("hidden");
  }

  if (mission2Completed) {
    mission2Item.classList.remove("hidden");
    mission2Sep.classList.remove("hidden");
  } else {
    mission2Item.classList.add("hidden");
    mission2Sep.classList.add("hidden");
  }

  if (mission3Completed) {
    mission3Item.classList.remove("hidden");
  } else {
    mission3Item.classList.add("hidden");
  }
}

function updateArtifactsTab() {
  const defaultMsg = document.getElementById("default-artifacts-msg");
  const artifact1Item = document.getElementById("artifact-1-item");
  const artifact1Sep = document.getElementById("artifact-1-separator");
  const artifact2Item = document.getElementById("artifact-2-item");
  const artifact2Sep = document.getElementById("artifact-2-separator");
  const artifact3Item = document.getElementById("artifact-3-item");

  if (mission1Completed || mission2Completed || mission3Completed) {
    defaultMsg.classList.add("hidden");
  } else {
    defaultMsg.classList.remove("hidden");
  }

  if (mission1Completed) {
    artifact1Item.classList.remove("hidden");
    artifact1Sep.classList.remove("hidden");
  } else {
    artifact1Item.classList.add("hidden");
    artifact1Sep.classList.add("hidden");
  }

  if (mission2Completed) {
    artifact2Item.classList.remove("hidden");
    artifact2Sep.classList.remove("hidden");
  } else {
    artifact2Item.classList.add("hidden");
    artifact2Sep.classList.add("hidden");
  }

  if (mission3Completed) {
    artifact3Item.classList.remove("hidden");
  } else {
    artifact3Item.classList.add("hidden");
  }
}

function updateMaterialsTab() {
  const defaultMsg = document.getElementById("default-materials-msg");
  const material1Item = document.getElementById("material-1-item");
  const material1Sep = document.getElementById("material-1-separator");
  const material2Item = document.getElementById("material-2-item");
  const material2Sep = document.getElementById("material-2-separator");
  const material3Item = document.getElementById("material-3-item");

  if (mission1Completed || mission2Completed || mission3Completed) {
    defaultMsg.classList.add("hidden");
  } else {
    defaultMsg.classList.remove("hidden");
  }

  if (mission1Completed) {
    material1Item.classList.remove("hidden");
    material1Sep.classList.remove("hidden");
  } else {
    material1Item.classList.add("hidden");
    material1Sep.classList.add("hidden");
  }

  if (mission2Completed) {
    material2Item.classList.remove("hidden");
    material2Sep.classList.remove("hidden");
  } else {
    material2Item.classList.add("hidden");
    material2Sep.classList.add("hidden");
  }

  if (mission3Completed) {
    material3Item.classList.remove("hidden");
  } else {
    material3Item.classList.add("hidden");
  }
}

// =========================================
// AR & UNITY INTEGRATION LOGIC
// =========================================

const arLayer = document.getElementById('ar-layer');
const gameContainer = document.getElementById('gameContainer');
const arScene = document.querySelector('a-scene');
const unityContainer = document.getElementById('unity-container');
const unityIframe = document.getElementById('unity-iframe');
const statusText = document.getElementById('status-text');

let arSystem = null;
let pendingMissionId = null;

// 1. Enter AR Mode
function enterARMode() {
  // Hide Story, Show AR
  gameContainer.style.display = 'none';
  arLayer.style.display = 'block';

  // Initialize AR System if not ready
  if (!arSystem && arScene.systems['mindar-image-system']) {
      arSystem = arScene.systems['mindar-image-system'];
  }
  
  // Start the Camera
  if (arSystem) {
      arSystem.start(); 
  }
}

// 2. Exit AR Mode (Back to Story)
document.getElementById('ar-back-button').addEventListener('click', () => {
  // Stop Camera
  if (arSystem) {
      arSystem.stop(); 
  }

  // Hide AR, Show Story
  arLayer.style.display = 'none';
  gameContainer.style.display = 'flex'; 
  
  
});

// 3. Unity Logic (Triggered by Targets)
arScene.addEventListener('loaded', () => {
    const t0 = document.getElementById('target-0');
    if(t0) t0.addEventListener('targetFound', () => launchUnity(1));

    const t1 = document.getElementById('target-1');
    if(t1) t1.addEventListener('targetFound', () => launchUnity(2));

    // ADD THIS FOR THE THIRD TARGET
    const t2 = document.getElementById('target-2');
    if(t2) t2.addEventListener('targetFound', () => launchUnity(3));
});

function launchUnity(missionID) {
    statusText.innerText = "Loading Simulation...";
    
    
    // Pause AR processing to save performance
    stopAmbient();
    
    if (arSystem) arSystem.pause();
    
    // Hide AR Camera UI (Video)
    const video = document.querySelector('video');
    if(video) video.style.display = 'none';

    // Show Unity
    unityContainer.style.display = 'block';

    // Send Message
    pendingMissionId = missionID;
    attemptUnityHandshake();
}

function attemptUnityHandshake() {
    if (unityIframe.contentWindow && unityIframe.contentWindow.unityInstance) {
        unityIframe.contentWindow.unityInstance.SendMessage('GameManager', 'LoadMission', pendingMissionId);
    } else {
        setTimeout(attemptUnityHandshake, 500);
    }
}

// 4. Close Unity (Called from Unity Button)
window.closeUnity = function() {
   unityContainer.style.display = 'none';
   
   const video = document.querySelector('video');
   if(video) video.style.display = 'block';
   
   if (arSystem) arSystem.unpause();
   playAmbient();
};

// Also listen for message events just in case
window.addEventListener("message", (event) => {
    if (event.data === "MissionComplete") {
        window.closeUnity();
    }
});

// Listen for the "teleportation" message from the Unity Iframe
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "UNITY_SCORE") {
        console.log("Score received from Unity via PostMessage:", event.data.score);
        
        // Call the score function we wrote earlier
        if (typeof window.handleUnityScore === "function") {
            window.handleUnityScore(event.data.score);
        }
    }
});

// The actual logic to update the coins
let completedMissions = new Set();

window.handleUnityScore = function(amount) {
    // Instead of using 'amount' (which is always 1), 
    // we use the 'pendingMissionId' of the card currently being played.
    if (pendingMissionId) {
        completedMissions.add(pendingMissionId);
        
        if (pendingMissionId === 1) mission1Completed = true;
        else if (pendingMissionId === 2) mission2Completed = true;
        else if (pendingMissionId === 3) mission3Completed = true; 

        // The total score is now the number of UNIQUE cards completed
        totalScore = completedMissions.size; 
        
        console.log("Logged Mission ID:", pendingMissionId, "| Total:", totalScore);
        
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.innerText = `Missions: ${totalScore}/3 complete!`;
        }
    } else {
        console.warn("Unity reported a win, but no pendingMissionId was found.");
    }
};