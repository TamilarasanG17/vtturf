// Demo/development turf dataset spread across major Tamil Nadu cities.
// Images use picsum.photos seeded placeholders so every turf has a distinct,
// stable image without requiring real uploaded files. Swap these for real
// uploads (served from /uploads/turfs/...) in production.

const CITY_DISTRICT = {
  Chennai: "Chennai",
  Coimbatore: "Coimbatore",
  Madurai: "Madurai",
  Tiruchirappalli: "Tiruchirappalli",
  Salem: "Salem",
  Tirunelveli: "Tirunelveli",
  Tiruppur: "Tiruppur",
  Erode: "Erode",
  Vellore: "Vellore",
  Thoothukudi: "Thoothukudi",
  Virudhunagar: "Virudhunagar",
  Sivakasi: "Virudhunagar",
  Dindigul: "Dindigul",
  Thanjavur: "Thanjavur",
  Tiruvannamalai: "Tiruvannamalai",
  Cuddalore: "Cuddalore",
  Kanchipuram: "Kanchipuram",
  Hosur: "Krishnagiri",
  Ooty: "The Nilgiris",
  Ramanathapuram: "Ramanathapuram",
  Karaikudi: "Sivaganga",
};

const NAME_PREFIXES = [
  "VT",
  "Green Field",
  "Champions",
  "Victory",
  "Arena",
  "Elite",
  "Sportzone",
  "Kickoff",
  "Legends",
  "Play Zone",
];

const NAME_SUFFIXES = ["Turf", "Sports Arena", "Football Ground", "Cricket Ground", "Play Arena"];

const ALL_FACILITIES = [
  "Parking",
  "Changing Room",
  "Drinking Water",
  "Flood Lights",
  "Washroom",
  "Seating Area",
  "Cafeteria",
  "First Aid",
];

const DAILY_SLOTS = [
  "06:00-07:00",
  "07:00-08:00",
  "08:00-09:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00",
  "20:00-21:00",
  "21:00-22:00",
];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Simple deterministic pseudo-random generator so re-running the seed
// script (before a fresh wipe) produces the same dataset.
function mulberry32(seed) {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const TURF_IMAGES = [
  "/uploads/turfs/turf-1.png",
  "/uploads/turfs/turf-2.png",
  "/uploads/turfs/turf-3.png",
  "/uploads/turfs/turf-4.png",
];

function buildTurfs() {
  const turfs = [];
  let seedCounter = 1;

  Object.entries(CITY_DISTRICT).forEach(([city, district]) => {
    const turfsPerCity = 3 + (seedCounter % 2); // 3 or 4 turfs per city
    const rand = mulberry32(seedCounter * 7919);

    for (let i = 0; i < turfsPerCity; i++) {
      const prefix = pick(rand, NAME_PREFIXES);
      const suffix = pick(rand, NAME_SUFFIXES);
      const name = `${prefix} ${suffix}`;
      const price = 500 + Math.floor(rand() * 10) * 50; // 500 - 950 in steps of 50
      const facilityCount = 4 + Math.floor(rand() * 4);
      const facilities = shuffledSubset(rand, ALL_FACILITIES, facilityCount);
      const sports = rand() > 0.5 ? ["Football", "Cricket"] : rand() > 0.5 ? ["Football"] : ["Cricket"];
      const rating = Math.round((3.5 + rand() * 1.5) * 10) / 10;
      const slug = `${slugify(city)}-${slugify(name)}-${i}`;

      turfs.push({
        name,
        location: city,
        district,
        description: `${name} in ${city} offers a well-maintained ${sports
          .join(" & ")
          .toLowerCase()} playing surface with modern amenities, ideal for casual games and tournaments alike.`,
        images: [
          TURF_IMAGES[i % TURF_IMAGES.length],
          TURF_IMAGES[(i + 1) % TURF_IMAGES.length],
        ],
        pricePerHour: price,
        additionalMemberFee: 50,
        baseMembersIncluded: 10,
        facilities,
        sports,
        availableTimings: DAILY_SLOTS,
        rating,
        numReviews: 0,
        status: "ACTIVE",
      });

      seedCounter++;
    }
  });

  return turfs;
}

function shuffledSubset(rand, arr, count) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

module.exports = buildTurfs();
