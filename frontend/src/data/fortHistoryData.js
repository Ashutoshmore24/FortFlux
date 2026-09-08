// Comprehensive historical, landmarks, route directions, and photo spot data for all 18 Maharashtra forts.

export const FORT_HISTORY_DETAILS = {
    sinhagad: {
        name: "Sinhagad Fort",
        heroSubtitle: "Lion's Fort — The Legendary Battleground of Tanaji Malusare",
        overview: "Originally known as Kondhana, Sinhagad stands atop an isolated cliff of the Bhuleshwar range 1,312 meters above sea level. It served as a strategic military outpost commanding the trade routes across the Sahyadris. In 1670, Maratha warrior Tanaji Malusare led a daring night assault scaling the sheer vertical western cliff using monitor lizards, recapturing the fortress from the Mughal garrison. Upon learning of Tanaji's martyrdom in the fierce battle, Chhatrapati Shivaji Maharaj famously lamented: 'Gad aala, pan Sinha gela' (The fort is won, but the Lion is lost).",
        landmarks: [
            {
                name: "Fort Walls & Ramparts",
                description: "360° panoramic views, best photography spot",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Pune Darwaja",
                description: "Main entrance gate facing Pune city",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Pune_darwaja.jpg/800px-Pune_darwaja.jpg",
            },
            {
                name: "Tanaji Malusare Memorial",
                description: "Tribute to the Maratha warrior hero",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Tanaji_Malusare_Memorial%2C_Sinhagad_fort.jpg/800px-Tanaji_Malusare_Memorial%2C_Sinhagad_fort.jpg",
            }
        ],
        mustSeeLandmarks: [
            "Tanaji Malusare Memorial (20-30 min)",
            "Kaundinyeshwar Temple (15-20 min)",
            "Rajaram's Tomb (15 min)",
            "Kalyan Darwaja & Pune Darwaja (30 min)"
        ],
        photoSpots: [
            "Fort walls for panoramic views",
            "Pune Darwaja at sunrise",
            "Valley overlook near Kalyan Darwaja",
            "Temple courtyard"
        ],
        routeInfo: {
            summary: "This route takes you via Donje Village - the most popular and well-maintained route to Sinhagad Fort",
            motorable: "The road is motorable up to the parking area near the fort",
            transport: "Shared jeeps available from base village (₹20-30 per person)",
            parking: "Parking available at the top (₹50-100)"
        },
        directions: [
            { step: 1, title: "Start at Donje / Atkarwadi base village trailhead", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Ascend the initial gravel path past local village stalls", distance: "450 m", duration: "12 min", type: "turn-right" },
            { step: 3, title: "Climb the rocky stairway section through shaded tree canopy", distance: "850 m", duration: "25 min", type: "turn-left" },
            { step: 4, title: "Reach midpoint resting plateau with fresh buttermilk stalls", distance: "1.4 km", duration: "40 min", type: "straight" },
            { step: 5, title: "Navigate steeper scree slope toward the outer fortification wall", distance: "2.1 km", duration: "65 min", type: "straight" },
            { step: 6, title: "Enter through the historic Kalyan Darwaja stone archway", distance: "2.7 km", duration: "80 min", type: "turn-right" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", user: "Rohan Deshmukh", caption: "Sunrise over Pune Darwaja ramparts" },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Pune_darwaja.jpg/800px-Pune_darwaja.jpg", user: "Vikram Patil", caption: "Historic Pune Darwaja arch in mist" },
            { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Tanaji_Malusare_Memorial%2C_Sinhagad_fort.jpg/800px-Tanaji_Malusare_Memorial%2C_Sinhagad_fort.jpg", user: "Aditi Shinde", caption: "Tanaji Malusare Samadhi shrine" },
            { url: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=600&q=80", user: "Amit Kadam", caption: "Cliffside stone bastion and valley view" }
        ]
    },

    rajgad: {
        name: "Rajgad Fort",
        heroSubtitle: "The King of Forts — Sovereign Capital of Hindavi Swarajya for 26 Years",
        overview: "Rajgad, meaning the 'Royal Fort', served as the capital of the Maratha Empire under Chhatrapati Shivaji Maharaj for over 26 years before the capital was moved to Raigad. Perched at an elevation of 1,376 meters, the fort features a grand tripartite plateau design comprising Padmavati Machi, Suvela Machi, and Sanjeevani Machi, crowned by the virtually impregnable Balekilla citadel.",
        landmarks: [
            {
                name: "Suvela Machi & Nedhe",
                description: "Natural rock eyelet with double-layered bastions",
                imageUrl: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Balekilla Citadel",
                description: "Highest pinnacle reached via thrilling rock-cut stairway",
                imageUrl: "https://images.unsplash.com/photo-1582299863456-6205bd0c1cc5?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Padmavati Machi & Lake",
                description: "Central administrative plateau with temple and royal lake",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Suvela Machi & Nedhe needle-hole (45-60 min)",
            "Balekilla Supreme Citadel & Throne site (1-1.5 hrs)",
            "Padmavati Temple & Royal Lake (30 min)",
            "Sanjeevani Machi defensive ramparts (45 min)"
        ],
        photoSpots: [
            "Nedhe natural rock eyelet framing the rising sun",
            "Sanjeevani Machi serpentine ramparts winding along the ridge",
            "Near-vertical rock steps leading to Balekilla Maha Darwaja",
            "Padmavati Lake reflection during golden hour"
        ],
        routeInfo: {
            summary: "Two main routes available: via Gunjavane Village (adventurous rock trail) or Pali Village (gradual paved stone steps)",
            motorable: "The road is motorable up to Pali and Gunjavane base village parking areas",
            transport: "Direct state transport buses and shared jeeps connect Nasrapur Phata to base villages (₹40-50 per person)",
            parking: "Dedicated base parking available at both Pali and Gunjavane schools (₹50)"
        },
        directions: [
            { step: 1, title: "Start from Gunjavane base village temple ground", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Walk along the farming bunds toward the northern spur", distance: "600 m", duration: "15 min", type: "turn-left" },
            { step: 3, title: "Ascend steep scree trail through scrub towards the rock wall", distance: "1.5 km", duration: "45 min", type: "turn-right" },
            { step: 4, title: "Negotiate exposed rock traverse using steel safety railings", distance: "2.4 km", duration: "75 min", type: "straight" },
            { step: 5, title: "Enter via Chor Darwaja directly onto Padmavati Machi plateau", distance: "3.2 km", duration: "105 min", type: "turn-right" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=600&q=80", user: "Siddharth More", caption: "View from Suvela Machi ridge" },
            { url: "https://images.unsplash.com/photo-1582299863456-6205bd0c1cc5?auto=format&fit=crop&w=600&q=80", user: "Pooja Sawant", caption: "Balekilla summit against monsoon mist" },
            { url: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=600&q=80", user: "Gaurav Joshi", caption: "Padmavati Temple lake reflection" },
            { url: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=600&q=80", user: "Snehal Rane", caption: "Sanjeevani Machi fortifications" }
        ]
    },

    torna: {
        name: "Torna Fort",
        heroSubtitle: "Prachandagad — The First Fort Captured by Shivaji Maharaj in 1646",
        overview: "Towering at 1,403 meters, Torna is the highest hill fort in the Pune district. At the tender age of 16, Chhatrapati Shivaji Maharaj captured Torna, naming it Prachandagad (the Massive Fort). The fort contains the ferocious Budhla Machi and the dramatic Zunjar Machi, a razor-sharp ridge jutting out into sheer abysses.",
        landmarks: [
            {
                name: "Zunjar Machi",
                description: "Dramatic narrow cliff ridge with sheer drops on both sides",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Mengai Devi Temple",
                description: "Historic temple on the plateau used as trekker shelter",
                imageUrl: "https://images.unsplash.com/photo-1637775510619-a1b7e28f3289?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Budhla Machi",
                description: "Monolithic rock formation shaped like an inverted earthen pot",
                imageUrl: "https://images.unsplash.com/photo-1620619864275-520e722650ee?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Mengai Devi Temple & Plateau (30 min)",
            "Zunjar Machi cliff ridge (45 min)",
            "Budhla Machi monolith (45 min)",
            "Bidi & Kothi Darwaja gateways (20 min)"
        ],
        photoSpots: [
            "Zunjar Machi ridge walk with panoramic valley drops",
            "Budhla Machi silhouette at dawn in sea of clouds",
            "Mengai Devi Temple courtyard with saffron flag",
            "Spectacular view of neighboring Rajgad and Bhatghar reservoir"
        ],
        routeInfo: {
            summary: "Trek begins from Velhe village, located 65 km southwest of Pune city",
            motorable: "Motorable asphalt road up to Velhe village base trailhead",
            transport: "Direct MSRTC buses ply from Swargate (Pune) to Velhe every 60 minutes",
            parking: "Safe village parking area managed by Gram Panchayat (₹40-60)"
        },
        directions: [
            { step: 1, title: "Start at Velhe base village near the police chowki", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Ascend along the rocky hillside through open meadows", distance: "800 m", duration: "25 min", type: "turn-left" },
            { step: 3, title: "Reach the ridge trail with heavy iron safety railings", distance: "2.2 km", duration: "70 min", type: "straight" },
            { step: 4, title: "Scramble up the stone-cut staircase to Bidi Darwaja", distance: "3.5 km", duration: "110 min", type: "turn-right" },
            { step: 5, title: "Pass Kothi Darwaja entering Mengai temple plateau", distance: "4.1 km", duration: "130 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=600&q=80", user: "Karan Jagtap", caption: "Climbing toward Bidi Darwaja" },
            { url: "https://images.unsplash.com/photo-1637775510619-a1b7e28f3289?auto=format&fit=crop&w=600&q=80", user: "Neha Salunke", caption: "Zunjar Machi ridge view" },
            { url: "https://images.unsplash.com/photo-1620619864275-520e722650ee?auto=format&fit=crop&w=600&q=80", user: "Sameer Naik", caption: "Budhla Machi in the clouds" },
            { url: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=600&q=80", user: "Rajesh Gaikwad", caption: "Mengai temple courtyard" }
        ]
    },

    purandar: {
        name: "Purandar Fort",
        heroSubtitle: "Birthplace of Chhatrapati Sambhaji Maharaj and Epic Stand of Murarbaji",
        overview: "Rising 1,387 meters high, Purandar played a decisive role in Maratha history. It is the revered birthplace of Chhatrapati Sambhaji Maharaj. In 1665, the fort witnessed the immortal defense by Murarbaji Deshpande against Diler Khan's massive Mughal army, leading to the signing of the historic Treaty of Purandar.",
        landmarks: [
            {
                name: "Murarbaji Deshpande Statue",
                description: "Bronze memorial honoring the valiant defender of the fort",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Kedareshwar Temple",
                description: "Ancient Shiva shrine on the highest Balekilla summit",
                imageUrl: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Bini Darwaja",
                description: "Formidable arched main entrance portal",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Murarbaji Deshpande Memorial (30 min)",
            "Kedareshwar Temple Balekilla (45 min)",
            "Vajragad Twin Fort viewpoint (30 min)",
            "Purandareswar 11th-century Temple (20 min)"
        ],
        photoSpots: [
            "Kedareshwar summit looking down directly onto Vajragad twin fort",
            "Bini Darwaja arched gateway with stone carvings",
            "Western bastion cliffs catching warm golden evening light",
            "Panoramic view of Saswad plains and ancient temple ponds"
        ],
        routeInfo: {
            summary: "Access route goes through the Army Cantonment area near Saswad (approx 45 km from Pune)",
            motorable: "Motorable asphalt road leads right up to the cantonment checkpost and lower gate",
            transport: "Direct PMT and MSRTC buses connect Pune to Saswad, followed by shared cabs to base",
            parking: "Designated army parking area available near lower checkpost (₹30-50, ID proof mandatory)"
        },
        directions: [
            { step: 1, title: "Report at Military Cantonment entry gate with valid ID", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Walk along paved serpentine road to Bini Darwaja", distance: "700 m", duration: "15 min", type: "turn-right" },
            { step: 3, title: "Visit Murarbaji memorial and Purandareswar temple complex", distance: "1.3 km", duration: "35 min", type: "straight" },
            { step: 4, title: "Ascend steep stone stairway towards upper Balekilla", distance: "2.0 km", duration: "60 min", type: "turn-left" },
            { step: 5, title: "Reach Kedareshwar Temple summit at 1387m elevation", distance: "2.6 km", duration: "80 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", user: "Nitin Bhalerao", caption: "Bini Darwaja entrance" },
            { url: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=600&q=80", user: "Pravin Kulkarni", caption: "Kedareshwar temple top view" },
            { url: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=600&q=80", user: "Shruti Mane", caption: "Vajragad fort as seen from Purandar" }
        ]
    },

    lohagad: {
        name: "Lohagad Fort",
        heroSubtitle: "The Iron Fortress Guarding the Historic Borghat Trade Route",
        overview: "Lohagad (Iron Fort) rises 1,033 meters above sea level near Lonavala. Under Chhatrapati Shivaji Maharaj, it served as a treasury for surplus wealth acquired during the raid of Surat. The fort is renowned for its spectacular 1.5 km long defensive ridge called 'Vinchukata' (Scorpion's Tail), resembling a scorpion ready to strike.",
        landmarks: [
            {
                name: "Vinchukata (Scorpion's Tail)",
                description: "1.5 km long narrow fortified spur jutting into the valley",
                imageUrl: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Maha Darwaja",
                description: "Monumental arched entrance gate with ancient carvings",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Laxmi Kothi & Water Tanks",
                description: "Ancient 16th-century stone granaries and cisterns",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Vinchukata Ridge walk (45 min)",
            "Four Consecutive Historic Gates (Ganesh, Narayan, Hanuman, Maha) (30 min)",
            "Laxmi Kothi Vaults (20 min)",
            "Trimbak Lake on plateau (15 min)"
        ],
        photoSpots: [
            "The spine of Vinchukata surrounded by rolling monsoon clouds",
            "Maha Darwaja arched gateway looking outward to Pavana lake",
            "View across the saddle to Visapur fort ramparts",
            "Reflections in Trimbak Lake on the summit"
        ],
        routeInfo: {
            summary: "Route goes via Malavali to Lohagadwadi base village near Lonavala",
            motorable: "Motorable paved road reaches right up to Lohagadwadi village steps",
            transport: "Local suburban trains run from Pune/Lonavala to Malavali Station, followed by shared autos (₹40-50)",
            parking: "Organized village parking at Lohagadwadi plateau (₹50-100)"
        },
        directions: [
            { step: 1, title: "Start at Lohagadwadi base parking lot", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Climb broad stone stairs to Ganesh Darwaja", distance: "250 m", duration: "10 min", type: "turn-left" },
            { step: 3, title: "Pass Narayan Darwaja and Hanuman bastion", distance: "450 m", duration: "18 min", type: "straight" },
            { step: 4, title: "Enter the summit via monumental Maha Darwaja", distance: "650 m", duration: "25 min", type: "turn-right" },
            { step: 5, title: "Walk along flat plateau to Vinchukata spur", distance: "1.8 km", duration: "50 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=600&q=80", user: "Akash Shinde", caption: "Vinchukata ridge shrouded in mist" },
            { url: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=600&q=80", user: "Deepak Pawar", caption: "Maha Darwaja stone gateway" },
            { url: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=600&q=80", user: "Rashmi More", caption: "View of Pawna dam from fort walls" }
        ]
    },

    visapur: {
        name: "Visapur Fort",
        heroSubtitle: "Higher Twin of Lohagad — Famed for its Cascading Waterfall Staircase",
        overview: "Perched higher than neighboring Lohagad at 1,084 meters, Visapur was built between 1713 and 1720 by Balaji Vishwanath, the first Peshwa. During the monsoon, the ancient stone staircase transforms into a natural gushing waterfall trail, making it one of the most thrilling and scenic treks in the Western Ghats.",
        landmarks: [
            {
                name: "Waterfall Staircase Trail",
                description: "Thrilling stone steps with gushing water in monsoon",
                imageUrl: "https://images.unsplash.com/photo-1582299863456-6205bd0c1cc5?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Peshwa Palace Ruins",
                description: "Stone arches, carved stone grinding wheels, and royal rooms",
                imageUrl: "https://images.unsplash.com/photo-1637775510619-a1b7e28f3289?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Perimeter Bastions",
                description: "Imposing ramparts offering direct aerial view of Lohagad",
                imageUrl: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Waterfall rock climb section (45 min)",
            "Peshwa Palace remains and grinding mills (30 min)",
            "Water Cistern network (20 min)",
            "Plateau ramparts overlooking Lohagad (40 min)"
        ],
        photoSpots: [
            "Trekking up the gushing water stairs during active monsoon",
            "Perimeter wall corner with Lohagad fort in the backdrop",
            "Large stone flour grinding mill ruins on plateau",
            "Dense mist and lush green flora across the summit"
        ],
        routeInfo: {
            summary: "Trail starts from Bhaje Village near the famous 2nd-century BCE Bhaja rock caves",
            motorable: "Motorable road to Bhaje base village; forest trek to fort top",
            transport: "Local trains from Pune and Lonavala stop at Malavali station (2.5 km from Bhaje)",
            parking: "Designated base parking at Bhaje village parking ground (₹50)"
        },
        directions: [
            { step: 1, title: "Depart Bhaje village near the historic rock caves", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Take the forest trail toward Patan village diversion", distance: "800 m", duration: "20 min", type: "turn-left" },
            { step: 3, title: "Enter the rocky stream bed and waterfall staircase", distance: "1.7 km", duration: "50 min", type: "straight" },
            { step: 4, title: "Scramble through broken gateway onto plateau rim", distance: "2.5 km", duration: "80 min", type: "turn-right" },
            { step: 5, title: "Explore expansive palace ruins across the summit", distance: "3.5 km", duration: "110 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1582299863456-6205bd0c1cc5?auto=format&fit=crop&w=600&q=80", user: "Kunal Tambe", caption: "Ascending the waterfall stairs" },
            { url: "https://images.unsplash.com/photo-1637775510619-a1b7e28f3289?auto=format&fit=crop&w=600&q=80", user: "Tanvi Dixit", caption: "Lohagad view from Visapur walls" },
            { url: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=600&q=80", user: "Swapnil S.", caption: "Peshwa palace ruins in fog" }
        ]
    },

    tikona: {
        name: "Tikona Fort",
        heroSubtitle: "Vitandgad — The Triangular Watchtower Overlooking Pawna Lake",
        overview: "Tikona (meaning triangular) stands at 1,066 meters as a distinct pyramidal fortress overlooking Pawna Lake. It was captured by Malik Ahmad Nizam Shah I in 1585 and later incorporated into the Maratha Empire by Shivaji Maharaj in 1657. The fort features thrilling near-vertical steps carved into the rock face and panoramic 360° views of neighboring Tung, Lohagad, and Visapur.",
        landmarks: [
            {
                name: "Rock-Cut Near-Vertical Steps",
                description: "Thrilling stone staircase carved into the sheer rock pinnacle",
                imageUrl: "https://images.unsplash.com/photo-1620619864275-520e722650ee?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Trimbakeshwar Mahadev Temple",
                description: "Ancient rock-hewn Shiva shrine crowning the summit",
                imageUrl: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Pawna Lake Viewpoint",
                description: "Unobstructed bird's-eye view of turquoise Pawna reservoir",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Trimbakeshwar Mahadev Temple (20 min)",
            "Seven Cave Water Cistern Complex (25 min)",
            "Balekilla Pinnacle Viewpoint (30 min)",
            "Defensive Bastion ruins (20 min)"
        ],
        photoSpots: [
            "Looking straight down the cliff-cut stairs with railing",
            "Panoramic wide-angle view of Pawna Dam and Tung Fort",
            "Trimbakeshwar temple stone threshold with prayer flags",
            "Pyramidal triangular silhouette from the approach road"
        ],
        routeInfo: {
            summary: "Easily accessible via Kamshet or Paud road to Tikona Peth village",
            motorable: "Motorable road leads right up to Tikona Peth village trailhead",
            transport: "Direct road connectivity from Lonavala and Pune via Pavana dam",
            parking: "Ample vehicle parking available at Tikona Peth base parking lot (₹30-50)"
        },
        directions: [
            { step: 1, title: "Start at Tikona Peth base village parking lot", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Follow gentle dirt trail through agricultural fields", distance: "500 m", duration: "15 min", type: "turn-right" },
            { step: 3, title: "Reach lower bastion and cave of seven saints", distance: "1.1 km", duration: "35 min", type: "straight" },
            { step: 4, title: "Ascend steep rock-cut stairs with steel safety cables", distance: "1.5 km", duration: "55 min", type: "turn-left" },
            { step: 5, title: "Arrive at Trimbakeshwar Mahadev summit point", distance: "1.9 km", duration: "70 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1620619864275-520e722650ee?auto=format&fit=crop&w=600&q=80", user: "Harish Jadhav", caption: "Climbing the steep rock-cut stairs" },
            { url: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=600&q=80", user: "Manasi Kulkarni", caption: "Pawna lake panorama from top" }
        ]
    },

    raigad: {
        name: "Raigad Fort",
        heroSubtitle: "Gibraltar of the East — Grand Coronation Capital of Chhatrapati Shivaji Maharaj",
        overview: "Known as the capital of the Maratha Empire, Raigad was chosen by Chhatrapati Shivaji Maharaj in 1674 for his grand formal coronation as Chhatrapati. Rising 820 meters with sheer 1,000-foot drops on all sides, the fort was rebuilt by master architect Hiroji Indulkar. It houses the sacred royal coronation throne, the Jagdishwar Temple, Shivaji Maharaj's Samadhi, and the fearsome Takmak Tok cliff.",
        landmarks: [
            {
                name: "Meghdambari & Royal Throne",
                description: "Sacred site of Chhatrapati Shivaji Maharaj's 1674 coronation",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Takmak Tok (Execution Point)",
                description: "Terrifying 1,200-foot sheer vertical cliff overlooking Konkan",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Jagdishwar Temple & Samadhi",
                description: "Royal temple preserving the Samadhi of Shivaji Maharaj",
                imageUrl: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Coronation Throne (Rajsabha) (30 min)",
            "Shivaji Maharaj's Samadhi & Waghya Dog Statue (30 min)",
            "Takmak Tok cliff lookout (40 min)",
            "Maha Darwaja & Queen's Chambers (45 min)"
        ],
        photoSpots: [
            "Takmak Tok sheer vertical precipice against rolling clouds",
            "The iconic statue under the Meghdambari throne canopy",
            "Maha Darwaja massive zig-zag entrance bastions",
            "Jagdishwar Temple reflection in Ganga Sagar Lake"
        ],
        routeInfo: {
            summary: "Raigad Ropeway available from Pachad village to the top in just 4 minutes (₹350 return)",
            motorable: "Motorable highway from Mahad (24 km) up to the ropeway base station",
            transport: "Direct MSRTC buses connect Mumbai, Pune, and Mahad to Raigad base station",
            parking: "Huge multi-level parking complex at the ropeway base station (₹50-100)"
        },
        directions: [
            { step: 1, title: "Board the Raigad Ropeway at Pachad base station", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Exit upper ropeway terminal onto Mena Darwaja plateau", distance: "800 m", duration: "5 min", type: "turn-left" },
            { step: 3, title: "Walk through Rajsabha royal court and coronation throne", distance: "1.2 km", duration: "20 min", type: "straight" },
            { step: 4, title: "Pay respects at Jagdishwar Temple and the royal Samadhi", distance: "1.8 km", duration: "40 min", type: "turn-right" },
            { step: 5, title: "Hike across to the thrilling cliff of Takmak Tok", distance: "2.6 km", duration: "75 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", user: "Ajay Ghorpade", caption: "Meghdambari coronation throne" },
            { url: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=600&q=80", user: "Pratiksha Raut", caption: "Takmak Tok cliff drop" },
            { url: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=600&q=80", user: "Vinay Patil", caption: "Jagdishwar temple facade" }
        ]
    },

    pratapgad: {
        name: "Pratapgad Fort",
        heroSubtitle: "Valour of the Sahyadris — The Historic Triumph Over Afzal Khan in 1659",
        overview: "Built in 1656 by Moropant Trimbak Pingle under the direction of Chhatrapati Shivaji Maharaj, Pratapgad commands the Radtondi Pass near Mahabaleshwar. In 1659, it became the battlefield for the legendary confrontation between Shivaji Maharaj and Adilshahi general Afzal Khan, which cemented Maratha independence.",
        landmarks: [
            {
                name: "Shivaji Maharaj Equestrian Statue",
                description: "Majestic bronze statue unveiled by Pt. Jawaharlal Nehru in 1957",
                imageUrl: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Bhavani Mata Temple",
                description: "Sacred temple preserving the Bhavani idol brought by Shivaji Maharaj",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Afzal Khan's Tomb",
                description: "Historical tomb monument at the base of the fort",
                imageUrl: "https://images.unsplash.com/photo-1637775510619-a1b7e28f3289?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Bhavani Mata Temple & Deepmala (30 min)",
            "Equestrian Statue & Balekilla (30 min)",
            "Afzal Khan Monument (20 min)",
            "Double Ramparts overlooking Konkan (30 min)"
        ],
        photoSpots: [
            "Bronze Shivaji Maharaj statue framed against blue skies",
            "Bhavani temple stone lamp tower (Deepmala)",
            "Lookout over the dense green Jawali forest and Radtondi Ghat",
            "Fort bastions draped in monsoon mist"
        ],
        routeInfo: {
            summary: "Situated 24 km from Mahabaleshwar along the scenic Poladpur road",
            motorable: "Smooth asphalt road leads right up to the base ticket counter and bazaar",
            transport: "Tourist taxis and state transport buses run frequently from Mahabaleshwar and Satara",
            parking: "Spacious tourist parking area with local eateries and shops (₹50)"
        },
        directions: [
            { step: 1, title: "Start at Pratapgad base parking lot and bazaar", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Climb the broad stone staircase past the ticket gate", distance: "200 m", duration: "10 min", type: "turn-right" },
            { step: 3, title: "Enter lower fort through the massive Maha Darwaja", distance: "450 m", duration: "20 min", type: "straight" },
            { step: 4, title: "Visit Bhavani Mata Temple and royal administrative hall", distance: "750 m", duration: "35 min", type: "turn-left" },
            { step: 5, title: "Reach upper citadel Balekilla and the bronze statue", distance: "1.1 km", duration: "50 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=600&q=80", user: "Hemant Mohite", caption: "Bhavani Temple and Deepmala" },
            { url: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=600&q=80", user: "Shweta Kadam", caption: "Statue on the Balekilla" }
        ]
    },

    ajinkyatara: {
        name: "Ajinkyatara Fort",
        heroSubtitle: "The Impregnable Star — Maratha Capital Under Chhatrapati Shahu Maharaj",
        overview: "Overlooking Satara city at 1,006 meters, Ajinkyatara ('The Impregnable Star') was constructed by Raja Bhoj II of the Shilahara dynasty in the 12th century. It later served as the capital of the Maratha Empire during the reign of Chhatrapati Shahu Maharaj and was defended heroically by Queen Tara Rani.",
        landmarks: [
            {
                name: "Mangalai Devi Temple",
                description: "Centuries-old sanctuary atop the historic plateau",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Tara Rani Palace Ruins",
                description: "Stone royal residence ruins of the brave Maratha queen",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Southern Bastion Point",
                description: "High stone bastion offering spectacular views of Satara",
                imageUrl: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Mangalai Devi Shrine (20 min)",
            "Tara Rani Palace Foundations (25 min)",
            "Broad Plateau Bastion Walk (45 min)",
            "Freshwater Cistern Complex (15 min)"
        ],
        photoSpots: [
            "Twilight skyline of Satara city from the southern bastion",
            "Ancient stone gate carved with Maratha lotus motifs",
            "Expansive grassy plateau with TV tower in distance",
            "Fort wall perimeter looking toward Sajjangad"
        ],
        routeInfo: {
            summary: "Motorable asphalt road winds all the way from Satara city up to the main fort gate",
            motorable: "Completely motorable road right up to the fort summit gate",
            transport: "City buses and auto-rickshaws available from Satara Central Bus Stand (₹40-60)",
            parking: "Free vehicle parking area inside the outer entrance gate"
        },
        directions: [
            { step: 1, title: "Drive or walk up the serpentine road from Satara city", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Pass through the main entrance gate onto plateau", distance: "300 m", duration: "8 min", type: "turn-left" },
            { step: 3, title: "Visit Mangalai Temple and freshwater cisterns", distance: "600 m", duration: "18 min", type: "straight" },
            { step: 4, title: "Walk along royal residence ruins of Tara Rani", distance: "1.0 km", duration: "30 min", type: "turn-right" },
            { step: 5, title: "Reach southern perimeter bastion overlooking Satara", distance: "1.6 km", duration: "45 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=600&q=80", user: "Sachin Babar", caption: "Satara city lights from Ajinkyatara" }
        ]
    },

    panhala: {
        name: "Panhala Fort",
        heroSubtitle: "The Largest Hill Fort in Deccan — Witness to the Great Escape to Vishalgad",
        overview: "With a perimeter of 14 kilometers, Panhala is the largest fort in the Deccan. Perched 845 meters high in the Kolhapur district, it is celebrated for Shivaji Maharaj's thrilling escape through Siddi Johar's torrential monsoon siege in 1660, aided by the supreme sacrifices of Shiva Kashid and Baji Prabhu Deshpande at Ghodkhind (Pavan Khind).",
        landmarks: [
            {
                name: "Teen Darwaza (Three Gates)",
                description: "Intricate double-gated defensive portal with ornate carvings",
                imageUrl: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Sajja Kothi",
                description: "Two-storeyed royal viewing pavilion where Sambhaji Maharaj stayed",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Ambarkhana (Granary)",
                description: "Monumental stone granary capable of storing 25,000 khandis of grain",
                imageUrl: "https://images.unsplash.com/photo-1620619864275-520e722650ee?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Teen Darwaza Defensive Complex (30 min)",
            "Sajja Kothi & Valley View (30 min)",
            "Ambarkhana Grain Vaults (25 min)",
            "Shiva Kashid Statue & Memorial (20 min)"
        ],
        photoSpots: [
            "Sajja Kothi balconies framing lush green Kolhapur valleys",
            "Teen Darwaza monumental arched stone facade",
            "Ambarkhana massive architectural vault chambers",
            "Sunset over the western perimeter battlements"
        ],
        routeInfo: {
            summary: "Located 20 km northwest of Kolhapur, connected by smooth 4-lane highway",
            motorable: "Fully motorable roads connect all major historical monuments across the plateau",
            transport: "State transport buses run every 15 minutes from Kolhapur Central Bus Stand",
            parking: "Multiple parking bays available across the fort hill station (₹30-50)"
        },
        directions: [
            { step: 1, title: "Arrive at Panhala town center near bus station", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Walk to Teen Darwaza fortified gateway", distance: "350 m", duration: "8 min", type: "turn-right" },
            { step: 3, title: "Proceed along heritage promenade to Ambarkhana granary", distance: "850 m", duration: "20 min", type: "straight" },
            { step: 4, title: "Visit Sajja Kothi two-storeyed royal pavilion", distance: "1.4 km", duration: "35 min", type: "turn-left" },
            { step: 5, title: "Tour the Tabak Udyan garden and Shiva Kashid memorial", distance: "2.1 km", duration: "55 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=600&q=80", user: "Mahesh Patil", caption: "Teen Darwaza gateway in morning sun" }
        ]
    },

    shivneri: {
        name: "Shivneri Fort",
        heroSubtitle: "The Cradle of Swarajya — Sacred Birthplace of Chhatrapati Shivaji Maharaj",
        overview: "Shivneri is revered across Maharashtra as the sacred birthplace of Chhatrapati Shivaji Maharaj, born here on 19 February 1630. Rising 1,067 meters in Junnar, the triangular hill fort is defended by a formidable sequence of seven consecutive gates, sheer rock scarps, and freshwater rock cisterns like Ganga and Jamuna.",
        landmarks: [
            {
                name: "Shiv Janmasthan Memorial",
                description: "Sacred room where Shivaji Maharaj was born on 19 Feb 1630",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Chain of Seven Fortified Gates",
                description: "Impregnable chain of 7 stone defense portals (Maha, Pir, etc.)",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Badami Talav & Kadelot Point",
                description: "Lush freshwater lotus pond and sheer vertical execution cliff",
                imageUrl: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Shiv Janmasthan & Cradle Room (30 min)",
            "Shivai Devi Temple (20 min)",
            "Chain of Seven Defensive Gates (45 min)",
            "Badami Talav & Kadelot Cliff (30 min)"
        ],
        photoSpots: [
            "Statue of young Shivaji Maharaj with Jijabai inside the memorial",
            "The grand arches of the 7 consecutive stone gates",
            "Badami Talav water mirror reflecting the sky",
            "Panoramic view of Junnar grape vineyards from Kadelot point"
        ],
        routeInfo: {
            summary: "Situated 3 km from Junnar bus station in Pune district (approx 90 km from Pune)",
            motorable: "Motorable road to base parking; clean paved steps with railings to top (1-1.5 hrs)",
            transport: "Direct MSRTC buses connect Pune (Shivajinagar) and Mumbai (Kalyan) to Junnar",
            parking: "Spacious tourism parking with garden and visitor facilities at base (₹50)"
        },
        directions: [
            { step: 1, title: "Begin at the tourist reception garden at Junnar base", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Pay respects at ancient Shivai Devi temple on the lower slope", distance: "300 m", duration: "10 min", type: "turn-right" },
            { step: 3, title: "Ascend through the sequence of 7 historic stone gates", distance: "900 m", duration: "30 min", type: "straight" },
            { step: 4, title: "Reach the royal palace and Shiv Janmasthan memorial chamber", distance: "1.6 km", duration: "55 min", type: "turn-left" },
            { step: 5, title: "Walk past Badami Talav to the precipice of Kadelot Point", distance: "2.2 km", duration: "75 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", user: "Suresh Tambe", caption: "Shiv Janmasthan memorial chamber" }
        ]
    },

    harishchandragad: {
        name: "Harishchandragad",
        heroSubtitle: "The Ancient Citadel of the Sahyadris — Famed for the Colossal Konkan Kada",
        overview: "Dating back to the 6th-century Kalachuri dynasty, Harishchandragad is an awe-inspiring fort at 1,424 meters in Ahmednagar district. It is famous worldwide for Konkan Kada, a colossal concave cliff dropping 2,000 feet that creates mystical circular rainbow phenomena, and Kedareshwar Cave holding a monolithic Shiva Linga surrounded by icy water.",
        landmarks: [
            {
                name: "Konkan Kada (Cliff of the Gods)",
                description: "Colossal 2,000-foot concave overhang cliff creating circular rainbows",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Kedareshwar Cave",
                description: "Mystical cave with monolithic Shiva Linga standing in icy water",
                imageUrl: "https://images.unsplash.com/photo-1582299863456-6205bd0c1cc5?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Harishchandreshwar Temple",
                description: "6th-century rock-hewn Hemadpanthi temple with Pushkarani tank",
                imageUrl: "https://images.unsplash.com/photo-1637775510619-a1b7e28f3289?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Konkan Kada cliff viewpoint at sunset (1 hr)",
            "Kedareshwar Cave & Water Shrine (30 min)",
            "Harishchandreshwar Ancient Temple (30 min)",
            "Taramati Peak summit (1,424m) at sunrise (1 hr)"
        ],
        photoSpots: [
            "Sunset clouds rolling over the semi-circular overhang of Konkan Kada",
            "The massive lone pillar supporting Kedareshwar Cave roof",
            "Pushkarani water cistern with ornate stone carved niches",
            "Dramatic morning sunrise from Taramati Peak"
        ],
        routeInfo: {
            summary: "Paachnai Route is the easiest family route (2.5 hrs); Khireshwar is the scenic mountain route via Tolar Khind (4-5 hrs)",
            motorable: "Motorable road connects up to Paachnai and Khireshwar base villages",
            transport: "State transport buses connect Kalyan and Kasara to base villages",
            parking: "Safe village parking available at Paachnai and Khireshwar (₹50)"
        },
        directions: [
            { step: 1, title: "Start at Paachnai base village near the stream crossing", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Ascend iron-railed rock steps through mountain ravines", distance: "1.2 km", duration: "40 min", type: "turn-left" },
            { step: 3, title: "Reach the upper plateau meadows near village campsites", distance: "2.5 km", duration: "80 min", type: "straight" },
            { step: 4, title: "Visit Harishchandreshwar Temple and Kedareshwar Cave", distance: "3.1 km", duration: "100 min", type: "turn-right" },
            { step: 5, title: "Hike across to the edge of the breathtaking Konkan Kada", distance: "4.2 km", duration: "130 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=600&q=80", user: "Yogesh Shirole", caption: "Sunset from the edge of Konkan Kada" }
        ]
    },

    rajmachi: {
        name: "Rajmachi Fort",
        heroSubtitle: "The Twin Fortresses (Shrivardhan & Manaranjan) Overlooking Borghat Pass",
        overview: "Rajmachi consists of twin fortified citadels: Shrivardhan (825m) and Manaranjan, strategically guarding the ancient Borghat trade route connecting Mumbai and Pune. Located near Lonavala, Rajmachi is celebrated for the magical pre-monsoon Fireflies Festival in June, dramatic waterfalls, and dense Sahyadri rainforests.",
        landmarks: [
            {
                name: "Shrivardhan Fort",
                description: "Higher citadel standing at 825m with dual watch bastions",
                imageUrl: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Manaranjan Fort",
                description: "Twin fortified citadel with intact battlements and water tanks",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Kal Bhairav Temple & Lake",
                description: "Ancient village temple and stone-lined lake in Udhewadi valley",
                imageUrl: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Shrivardhan Balekilla apex (45 min)",
            "Manaranjan Ramparts (35 min)",
            "Kal Bhairav Temple & Camping Valley (30 min)",
            "Kondhane Caves on Karjat route (45 min)"
        ],
        photoSpots: [
            "Shrivardhan apex looking directly across at Manaranjan",
            "Kataldhar waterfall plunge into the gorge during monsoons",
            "Magical fireflies illuminating the forest canopy in pre-monsoon June",
            "Lush green Borghat railway switchbacks far below"
        ],
        routeInfo: {
            summary: "Lonavala Route: 16 km off-road trail motorable by SUV or bike up to Udhewadi village; Karjat Route: 3.5 hr trek from Kondivade",
            motorable: "Motorable 4x4 dirt trail from Lonavala up to Udhewadi village",
            transport: "Shared 4x4 jeeps ply between Lonavala railway station and Udhewadi village (₹150-200)",
            parking: "Safe village parking available at Udhewadi village (₹50-100)"
        },
        directions: [
            { step: 1, title: "Start at Udhewadi central village plateau between twin forts", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Take eastern trail ascending through trees to Shrivardhan", distance: "400 m", duration: "15 min", type: "turn-left" },
            { step: 3, title: "Climb carved rock stairs to main gate of Shrivardhan", distance: "800 m", duration: "30 min", type: "straight" },
            { step: 4, title: "Return to village saddle and ascend opposite trail to Manaranjan", distance: "1.6 km", duration: "60 min", type: "turn-right" },
            { step: 5, title: "Walk perimeter walls of Manaranjan overlooking Ulhas river", distance: "2.2 km", duration: "80 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=600&q=80", user: "Tushar Chikhale", caption: "Shrivardhan peak from the valley" }
        ]
    },

    sindhudurg: {
        name: "Sindhudurg Fort",
        heroSubtitle: "The Ocean Sovereign — Masterpiece Island Fortress Built by Shivaji Maharaj in 1664",
        overview: "Commissioned by Chhatrapati Shivaji Maharaj in 1664 on Kurte Island off Malvan, Sindhudurg is an architectural wonder of marine engineering. Over 70,000 kg of lead was used in casting its foundations. The fortress features 42 rounded bastions, 3 kilometers of outer sea walls, freshwater wells amidst saltwater, and the sacred footprints and handprints of Shivaji Maharaj.",
        landmarks: [
            {
                name: "Shivaji Maharaj Footprint Shrine",
                description: "Sacred shrine preserving the physical footprints and palm impression",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Concealed Dilli Darwaja",
                description: "Hidden sea gate invisible to incoming enemy warships from the open ocean",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Sweet Water Wells in Sea",
                description: "Freshwater wells (Dudh Baav & Sakhar Baav) thriving in ocean",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Chhatrapati Shivaji Maharaj Temple (30 min)",
            "Footprint and Handprint Shrine (20 min)",
            "Concealed Dilli Darwaja Portal (25 min)",
            "Walk on the 3 km perimeter sea wall (1 hr)"
        ],
        photoSpots: [
            "Waves crashing against the 30-foot black stone sea ramparts",
            "The inner shrine of Shivaji Maharaj decorated with traditional flowers",
            "Boat view of Kurte island emerging from the Arabian Sea",
            "Aerial view of the 42 rounded ocean bastions"
        ],
        routeInfo: {
            summary: "Located 1 km offshore from Malvan Beach in coastal Konkan",
            motorable: "Motorable highway to Malvan jetty; 15-minute ferry boat to the fort",
            transport: "Tourist ferry boats operate from Malvan jetty (₹90 return per person)",
            parking: "Ample vehicle parking available at Malvan Dandi beach parking grounds (₹50)"
        },
        directions: [
            { step: 1, title: "Board ferry boat at Malvan Dandi Jetty", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Disembark onto stone jetty at concealed Dilli Darwaja", distance: "1.0 km", duration: "15 min", type: "turn-right" },
            { step: 3, title: "Enter concealed sea gate into the fort interior", distance: "1.2 km", duration: "20 min", type: "straight" },
            { step: 4, title: "Visit Shivaji Maharaj Temple and sacred footprint shrine", distance: "1.6 km", duration: "40 min", type: "turn-left" },
            { step: 5, title: "Climb onto 3 km wide defensive wall overlooking crashing surf", distance: "2.5 km", duration: "75 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", user: "Chetan Redkar", caption: "Sea bastion surrounded by Arabian Sea" }
        ]
    },

    vijaydurg: {
        name: "Vijaydurg Fort",
        heroSubtitle: "The Eastern Gibraltar — Formidable Naval Headquarters of Kanhoji Angre",
        overview: "Projecting into the Arabian Sea at the mouth of Waghotan river, Vijaydurg is one of the oldest forts on the Konkan coast. Re-fortified by Shivaji Maharaj with triple concentric ramparts and an underwater defense wall, it became the impregnable naval headquarters of Maratha Grand Admiral Kanhoji Angre. In 1868, English scientist Sir Norman Lockyer observed a solar eclipse from its ramparts and discovered the element Helium.",
        landmarks: [
            {
                name: "Triple Concentric Ramparts",
                description: "Layered defense with 29 bastions, pride of Kanhoji Angre's fleet",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Helium Discovery Platform",
                description: "Historic site where Helium was first discovered during the 1868 solar eclipse",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Underwater Defense Wall",
                description: "Underwater stone barrier built 200m offshore to wreck enemy ships",
                imageUrl: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Triple Protective Ramparts & Sea Bastions (45 min)",
            "Helium Discovery Monument (20 min)",
            "Secret Escape Tunnel mouth (20 min)",
            "Maratha Naval Dockyard Ruins (30 min)"
        ],
        photoSpots: [
            "Arabian Sea sunset framed by black basalt sea bastions",
            "Ancient cannons facing out into Waghotan creek",
            "The sweeping arc of the triple walls from the highest lookout",
            "Traditional fishing boats passing the sea gate"
        ],
        routeInfo: {
            summary: "Well connected by asphalt highway from Rajapur (60 km) and Kankavli",
            motorable: "Motorable road reaches directly to the main entrance ticket booth",
            transport: "Direct state transport buses connect from Mumbai, Pune, and Ratnagiri",
            parking: "Designated visitor parking outside the main fortification entrance (₹40)"
        },
        directions: [
            { step: 1, title: "Arrive at the Vijaydurg entrance archway", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Pass through outer gate across ancient dry moat", distance: "200 m", duration: "5 min", type: "turn-left" },
            { step: 3, title: "Tour ammunition storage vaults and ancient grain rooms", distance: "600 m", duration: "20 min", type: "straight" },
            { step: 4, title: "Visit the historic solar eclipse Helium platform", distance: "1.1 km", duration: "40 min", type: "turn-right" },
            { step: 5, title: "Walk seaside ramparts overlooking Waghotan estuary", distance: "1.8 km", duration: "65 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", user: "Sanket Parab", caption: "Vijaydurg triple ramparts at sunset" }
        ]
    },

    "murud-janjira": {
        name: "Murud-Janjira Fort",
        heroSubtitle: "The Undefeated Marine Stronghold — The Impregnable Sea Citadel of the Siddis",
        overview: "Surrounded completely by the Arabian Sea off the coast of Murud, Janjira is famously known as the only unconquered marine fortress on the western coast. Defended by 22 rounded bastions, towering 40-foot ramparts, and formidable cannons like the legendary 22-ton Kalal Bangadi, Janjira repelled repeated sieges by the Portuguese, British, and Marathas.",
        landmarks: [
            {
                name: "Kalal Bangadi Giant Cannon",
                description: "Third largest cannon in India, forged from 5 metals to resist rust",
                imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "22 Rounded Sea Bastions",
                description: "Imposing circular bastions rising directly from the ocean waves",
                imageUrl: "https://images.unsplash.com/photo-1623351980312-326938dc40d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Royal Palace & Freshwater Tank",
                description: "Surul Khan's palace ruins and large freshwater pond in the ocean",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Kalal Bangadi & Landa Kasam Cannons (30 min)",
            "Surul Khan's Three-Story Palace Ruins (30 min)",
            "Freshwater Royal Lake amidst the sea (20 min)",
            "Shesh Darwaja (Secret Escape Gate) (20 min)"
        ],
        photoSpots: [
            "Approaching the towering stone walls on traditional wooden sailboats",
            "The giant Kalal Bangadi cannon muzzle pointed toward the horizon",
            "Arched palace windows framing the blue ocean",
            "The hidden main gate that only reveals itself when boat is 40 feet away"
        ],
        routeInfo: {
            summary: "Located near Murud town in Raigad district, 150 km south of Mumbai",
            motorable: "Motorable road to Rajapuri jetty; traditional sailboats to fort",
            transport: "Non-motorized traditional sailboats operate from Rajapuri Jetty (₹100-150 round trip)",
            parking: "Parking lot available at Rajapuri village jetty with paid parking (₹50)"
        },
        directions: [
            { step: 1, title: "Board the wooden sailboat at Rajapuri Jetty", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Sail across the waves toward the fortress entrance", distance: "1.5 km", duration: "20 min", type: "straight" },
            { step: 3, title: "Step onto wet stone steps of concealed main gate", distance: "1.6 km", duration: "25 min", type: "turn-right" },
            { step: 4, title: "Explore royal palace courtyards and sweet water tank", distance: "2.1 km", duration: "50 min", type: "turn-left" },
            { step: 5, title: "Inspect legendary Kalal Bangadi cannon on west bastion", distance: "2.6 km", duration: "75 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", user: "Faizan Sayyed", caption: "Sailboat approach to Murud-Janjira" }
        ]
    },

    korigad: {
        name: "Korigad Fort",
        heroSubtitle: "The Sprawling Plateau Fortress Guarding the Sahyadri Ridges of Aamby Valley",
        overview: "Standing at 923 meters near Lonavala and Aamby Valley, Korigad is famous for its completely intact, unbroken 2-kilometer perimeter wall that visitors can walk entirely around. Incorporated into Swarajya by Chhatrapati Shivaji Maharaj in 1657 alongside Lohagad and Tikona, the fort boasts large perennial ponds, beautiful stepwells, and ancient cannons overlooking scenic valleys.",
        landmarks: [
            {
                name: "Intact 2 km Perimeter Wall",
                description: "Complete, unbroken stone fortification wall you can walk all around",
                imageUrl: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Koraidevi Temple",
                description: "Vibrant hilltop temple dedicated to the patron goddess Korai Devi",
                imageUrl: "https://images.unsplash.com/photo-1620833118683-16a300a0fc15?auto=format&fit=crop&w=800&q=80",
            },
            {
                name: "Twin Freshwater Plateau Lakes",
                description: "Two serene mountain lakes that remain full throughout the year",
                imageUrl: "https://images.unsplash.com/photo-1574768396263-d4d16d001de1?auto=format&fit=crop&w=800&q=80",
            }
        ],
        mustSeeLandmarks: [
            "Koraidevi Temple & Courtyard (25 min)",
            "2 km Perimeter Wall Walk (45 min)",
            "Twin Mountain Lakes (20 min)",
            "Ganesh Darwaja & Bastion Cannons (20 min)"
        ],
        photoSpots: [
            "Unobstructed walk along the clean stone battlements",
            "Clouds reflecting on the still waters of the hilltop lake",
            "Aerial view of Aamby Valley city and airfield from eastern wall",
            "Sunset from the south bastion overlooking Sahyadri ranges"
        ],
        routeInfo: {
            summary: "Located 20 km from Lonavala, just beyond the Aamby Valley city entrance",
            motorable: "Motorable road to Peth Shahpur base village; gentle stone steps to top",
            transport: "Taxis and private vehicles easily accessible from Lonavala railway station",
            parking: "Ample vehicle parking available at Peth Shahpur base village (₹50)"
        },
        directions: [
            { step: 1, title: "Start at Peth Shahpur base village near the temple school", distance: "0 m", duration: "0 min", type: "straight" },
            { step: 2, title: "Walk through shaded forest trail to the base of steps", distance: "400 m", duration: "10 min", type: "straight" },
            { step: 3, title: "Ascend gentle stone staircase with handrails", distance: "900 m", duration: "25 min", type: "turn-left" },
            { step: 4, title: "Enter through Ganesh Darwaja onto the wide grassy plateau", distance: "1.3 km", duration: "40 min", type: "turn-right" },
            { step: 5, title: "Complete the scenic 2 km loop along intact perimeter wall", distance: "3.3 km", duration: "75 min", type: "straight" }
        ],
        communityPhotos: [
            { url: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=600&q=80", user: "Akshay Deshpande", caption: "Walking along Korigad perimeter wall" }
        ]
    }
};

/**
 * Helper to get merged fort historical details by slug.
 */
export function getFortHistoricalDetails(slug, backendData) {
    const defaultData = FORT_HISTORY_DETAILS[slug?.toLowerCase()] || FORT_HISTORY_DETAILS.sinhagad;
    
    // Merge backend data if present
    const fortId = backendData?.fortId || {};
    
    return {
        ...defaultData,
        fortId: {
            name: fortId.name || defaultData.name,
            description: fortId.description || defaultData.overview,
            imageUrl: fortId.imageUrl || defaultData.landmarks[0]?.imageUrl,
            location: fortId.location,
            sections: fortId.sections || [],
            region: fortId.region || "Sahyadri",
            district: fortId.district || "Maharashtra",
            baseVillage: fortId.baseVillage || defaultData.routeInfo.summary.split("via ")[1]?.split(" ")[0] || "Base Village",
            elevation: fortId.elevation || 1100,
        },
        timeline: backendData?.timeline && backendData.timeline.length > 0 ? backendData.timeline : [
            { year: 1647, title: "Captured by Shivaji Maharaj", description: "Strategic inclusion into Hindavi Swarajya." },
            { year: 1670, title: "Fortification Upgrades", description: "Reinforcement of bastions and defense walls." },
            { year: 1818, title: "British Takeover", description: "Captured by British East India Company forces." }
        ],
        erosionTrends: backendData?.erosionTrends && backendData.erosionTrends.length > 0 ? backendData.erosionTrends : [
            { year: 2010, severityIndex: 2, notes: "Minor surface wear on main entry stairs." },
            { year: 2015, severityIndex: 4, notes: "Increased footfall along ridge trails." },
            { year: 2020, severityIndex: 6, notes: "Monsoon weathering on western bastions." },
            { year: 2024, severityIndex: 7, notes: "Active preservation and masonry restoration." }
        ],
        photoComparisons: backendData?.photoComparisons || []
    };
}
