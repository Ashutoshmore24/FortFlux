import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAP_FILE_PATH = path.resolve(__dirname, "../data/cloudinaryLandmarksMap.json");
const LANDMARKS_DIR = path.resolve(__dirname, "../../../frontend/public/Landmark");
const HISTORY_DATA_PATH = path.resolve(__dirname, "../../../frontend/src/data/fortHistoryData.js");

const FORT_LANDMARK_DIRS = {
    ajinkyatara: "Ajinkyatara Fort",
    harishchandragad: "Harishchandragad",
    korigad: "Korigad Fort",
    lohagad: "Lohagad Fort",
    "murud-janjira": "Murud-Janjira Fort",
    panhala: "Panhala Fort",
    purandar: "Purandar Fort",
    raigad: "Raigad Fort",
    rajgad: "Rajgad Fort",
    rajmachi: "Rajmachi Fort",
    shivneri: "Shivneri Fort",
    sindhudurg: "Sindhudurg Fort",
    sinhagad: "Sinhagad Fort",
    tikona: "Tikona Fort",
    torna: "Torna Fort",
    vijaydurg: "Vijaydurg Fort",
    visapur: "Visapur Fort",
};

async function uploadLandmarks() {
    try {
        console.log("🚀 Starting Landmark images Cloudinary upload...");

        let landmarksMap = {};
        if (fs.existsSync(MAP_FILE_PATH)) {
            try {
                landmarksMap = JSON.parse(fs.readFileSync(MAP_FILE_PATH, "utf-8"));
            } catch (e) {
                landmarksMap = {};
            }
        }

        // Pre-seed Pratapgad authentic Cloudinary images from verified community evidence
        if (!landmarksMap["pratapgad"]) {
            landmarksMap["pratapgad"] = {
                "Bhavani Mata Temple": {
                    url: "https://res.cloudinary.com/dvx9cw0sy/image/upload/v1788948985/fortflux/community_evidence/pratapgad/xms1hinmojrhivewi2pf.jpg",
                    public_id: "fortflux/community_evidence/pratapgad/xms1hinmojrhivewi2pf"
                },
                "Afzal Tower & Meeting Site": {
                    url: "https://res.cloudinary.com/dvx9cw0sy/image/upload/v1788948985/fortflux/community_evidence/pratapgad/n444lkulv0b97lppwimw.jpg",
                    public_id: "fortflux/community_evidence/pratapgad/n444lkulv0b97lppwimw"
                },
                "Upper Citadel (Balekilla)": {
                    url: "https://res.cloudinary.com/dvx9cw0sy/image/upload/v1788948991/fortflux/community_evidence/pratapgad/qvzbqnoep2we2obop3vm.jpg",
                    public_id: "fortflux/community_evidence/pratapgad/qvzbqnoep2we2obop3vm"
                }
            };
        }

        const toUpload = [];

        for (const [slug, folderName] of Object.entries(FORT_LANDMARK_DIRS)) {
            const fortFolder = path.join(LANDMARKS_DIR, folderName);
            if (!fs.existsSync(fortFolder)) continue;

            const files = fs.readdirSync(fortFolder);
            for (const file of files) {
                if (!file.match(/\.(jpg|jpeg|png|webp|avif)$/i)) continue;
                if (!landmarksMap[slug]?.[file]?.url) {
                    toUpload.push({
                        slug,
                        file,
                        filePath: path.join(fortFolder, file)
                    });
                }
            }
        }

        console.log(`📸 Found ${toUpload.length} landmark images to upload.`);

        const BATCH_SIZE = 4;
        for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
            const batch = toUpload.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (item) => {
                try {
                    const uploadRes = await cloudinary.uploader.upload(item.filePath, {
                        folder: `fortflux/landmarks/${item.slug}`,
                        transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }]
                    });
                    if (!landmarksMap[item.slug]) landmarksMap[item.slug] = {};
                    landmarksMap[item.slug][item.file] = {
                        url: uploadRes.secure_url,
                        public_id: uploadRes.public_id
                    };
                    console.log(`☁️ [${i + 1}/${toUpload.length}] Uploaded: [${item.slug}] ${item.file}`);
                } catch (uploadErr) {
                    console.error(`❌ Failed to upload ${item.file}:`, uploadErr.message);
                }
            }));

            // Save progress
            fs.writeFileSync(MAP_FILE_PATH, JSON.stringify(landmarksMap, null, 2), "utf-8");
        }

        console.log("✅ All landmark uploads completed. Saved map to:", MAP_FILE_PATH);

        // Now update fortHistoryData.js with real Cloudinary URLs
        updateFortHistoryData(landmarksMap);

    } catch (err) {
        console.error("Error in uploadLandmarks:", err);
    }
}

function updateFortHistoryData(landmarksMap) {
    if (!fs.existsSync(HISTORY_DATA_PATH)) {
        console.warn("fortHistoryData.js not found at:", HISTORY_DATA_PATH);
        return;
    }

    let code = fs.readFileSync(HISTORY_DATA_PATH, "utf-8");

    // Mapping rules from landmark names in fortHistoryData.js to file keys in landmarksMap
    const LANDMARK_NAME_TO_FILE = {
        // Sinhagad
        "Pune Darwaja": "Pune Darwaja.jpg",
        "Tanaji Malusare Samadhi & Memorial": "Tanaji Malusare Samadhi & Memorial.jpg",
        "Kalyan Darwaja & Western Bastions": "Kalyan Darwaja & Western Bastions.jpg",

        // Rajgad
        "Suvela Machi & Nedhe (Needle Hole)": "Suvela Machi & Nedhe.jpg",
        "Balekilla (Highest Citadel)": "Balekilla - Highest Citadel.jpg",
        "Padmavati Temple & Royal Lake": "Padmavati Temple &.jpg",

        // Torna
        "Zunjar Machi & Cliff Steps": "Zunjar Machi.jpg",
        "Budhla Machi (Rock Monolith Spur)": "Budhla Machi & Rock Monolith.jpg",
        "Menghai Devi Temple": "Mengai Devi Temple.jpg",

        // Raigad
        "Maha Darwaza (Grand Portal)": "Maha_Darwaza_(Grand_Gate),_Raigad_Fort.jpg",
        "Rajya Sabha (Royal Throne Room)": "Rajya Sabha.jpg",
        "Takmak Tok (Punishment Cliff)": "Takmak Tok.jpg",

        // Harishchandragad
        "Harishchandreshwar Temple Complex": "Harishchandreshwar Temple Complex.jpg",
        "Kedareshwar Cave & Giant Shiva Linga": "Kedareshwar Cave & Giant Shiva Linga.jpg",
        "Kokan Kada (Cliff Face)": "Kokan Kada.jpg",

        // Purandar
        "Bini Darwaja & Khadaklat Bastion": "Bini Darwaja & Khankada.jpg",
        "Kedareshwar Mahadev Temple": "Kedareshwar Mahadev Temple.jpg",
        "Murarbaji Deshpande Memorial": "Murarbaji Deshpande Memorial.jpg",

        // Lohagad
        "Vinchukata (Scorpion's Tail)": "Vinchukata (Scorpion's Tail).jpg",
        "Maha Darwaja & Ganesh Gates": "Maha Darwaja.jpg",
        "Laxmi Kothi & Ancient Granaries": "Laxmi Kothi & Ancient Granaries.jpg",

        // Visapur
        "Waterfall Rock Staircase Trail": "Waterfall Staircase Trail.jpg",
        "Peshwa Palace & Stone Flour Mill Ruins": "Peshwa Palace Ruins & Stone Grinders.jpg",
        "Plateau Perimeter Bastions & Cannon Mounts": "Western Fortified Ramparts.jpg",

        // Korigad
        "2 km Intact Perimeter Wall": "2 km Intact Perimeter Wall.jpg",
        "Korai Devi Temple": "Korai Devi Temple.jpg",
        "Twin Freshwater Plateau Lakes": "Twin Freshwater Plateau Lakes.jpg",

        // Tikona
        "Trimbakeshwar Mahadev Temple & Water Tanks": "Trimbakeshwar Mahadev Temple.jpg",
        "Rock-Cut Vertical Staircase": "Rock-Cut Near-Vertical Steps.jpg",
        "Pawna Lake Overlook Bastion": "Pawna Lake Viewpoint.jpg",

        // Rajmachi
        "Shrivardhan Peak & Citadel": "Shrivardhan Citadel.jpg",
        "Manaranjan Machi": "Manaranjan Citadel.jpg",
        "Kalbhairavnath Temple & Shravan Talav": "Kalbhairavnath Temple.jpg",

        // Panhala
        "Teen Darwaja": "Teen Darwaja.jpg",
        "Sajja Kothi (Punishment Tower)": "Sajja Kothi.jpg",
        "Ambarkhana (Royal Granaries)": "Ambarkhana (Royal Granaries).jpg",

        // Shivneri
        "Shivaji Maharaj Janmasthan (Birthplace)": "Shivaji Maharaj Janmasthan Palace.jpg",
        "Seven Monumental Defense Gates": "Seven Sequential Defense Gates.jpg",
        "Badami Talao & Ganga-Jamuna Cisterns": ". Badami Talao & Ganga-Jamuna Cisterns.jpg",

        // Ajinkyatara
        "Mangalai Devi Temple": "Mangaladevi Mandir.jpg",
        "Southern Bastion & Satara Overlook": "Southern Bastion-Satara View.jpg",
        "Tara Rani Palace Ruins": "Tara Rani Palace Rajwada Ruins Ajinkyatara fort.jpg",

        // Sindhudurg
        "Chhatrapati Shivaji Maharaj Temple & Footprints": "Chhatrapati Shivaji Maharaj Temple & Footprints.jpg",
        "Dilli Darwaja (Concealed Main Entrance)": "Dilli Darwaja.jpg",
        "Ocean Ramparts & Sweet Water Wells": "Ocean Ramparts & Sweet Water Wells.jpg",

        // Vijaydurg
        "Triple Concentric Fortification Walls": "Triple Fortified Sea Walls.jpg",
        "Undersea Submerged Defense Wall": "Submerged Defense Wall (Undersea Wall).jpg",
        "Naval Dockyard & Drydock Ruins": "Flag Bastion & Naval Shipyard Docks.jpg",

        // Murud-Janjira
        "22 Rounded Ocean Bastions & Palace Ruins": "22 Rounded Ocean Bastions & Palace Ruins.jpg",
        "Kalal Bangadi 22-Ton Bronze Cannon": "Kalal Bangadi 22-Ton Bronze Cannon.jpg",
        "Submarine Sweetwater Reservoir": "Submarine Sweetwater Reservoir.jpg",
    };

    let updatedCount = 0;

    for (const [fortSlug, filesMap] of Object.entries(landmarksMap)) {
        for (const [fileOrName, data] of Object.entries(filesMap)) {
            if (!data?.url) continue;

            // Find matching landmark name
            let matchedName = null;
            for (const [lmName, mappedFile] of Object.entries(LANDMARK_NAME_TO_FILE)) {
                if (mappedFile === fileOrName || lmName === fileOrName) {
                    matchedName = lmName;
                    break;
                }
            }

            if (matchedName) {
                // Regex to find landmark block by name and replace its imageUrl
                const escapedName = matchedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(name:\\s*["']${escapedName}["'][\\s\\S]*?imageUrl:\\s*["'])([^"']+)(["'])`, 'g');

                if (regex.test(code)) {
                    code = code.replace(regex, `$1${data.url}$3`);
                    updatedCount++;
                }
            }
        }
    }

    fs.writeFileSync(HISTORY_DATA_PATH, code, "utf-8");
    console.log(`✨ Successfully updated ${updatedCount} landmarks in fortHistoryData.js with authentic Cloudinary URLs!`);
}

uploadLandmarks();
