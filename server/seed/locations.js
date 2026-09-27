// Comprehensive Tamil Nadu location dataset grouped by district.
// Used to seed the Location collection. Add more towns here as needed -
// nothing in the frontend or backend needs to change.

const regions = {
  Chennai: ["Chennai", "Tambaram", "Avadi", "Ambattur", "Guindy", "Velachery", "Porur", "Sholinganallur"],
  Coimbatore: ["Coimbatore", "Pollachi", "Mettupalayam", "Sulur", "Annur", "Kinathukadavu"],
  Madurai: ["Madurai", "Melur", "Thirumangalam", "Usilampatti", "Peraiyur"],
  Tiruchirappalli: ["Tiruchirappalli", "Srirangam", "Manapparai", "Thuraiyur", "Musiri", "Lalgudi"],
  Salem: ["Salem", "Attur", "Mettur", "Sankari", "Edappadi"],
  Tirunelveli: ["Tirunelveli", "Palayamkottai", "Ambasamudram", "Tenkasi", "Sengottai"],
  Virudhunagar: [
    "Virudhunagar",
    "Sivakasi",
    "Aruppukkottai",
    "Rajapalayam",
    "Srivilliputhur",
    "Sattur",
  ],
  Thoothukudi: ["Thoothukudi", "Kovilpatti", "Tiruchendur", "Vilathikulam"],
  Dindigul: ["Dindigul", "Palani", "Oddanchatram", "Kodaikanal", "Vedasandur"],
  Thanjavur: ["Thanjavur", "Kumbakonam", "Pattukkottai", "Papanasam", "Peravurani"],
  Erode: ["Erode", "Bhavani", "Gobichettipalayam", "Perundurai", "Sathyamangalam"],
  Tiruppur: ["Tiruppur", "Dharapuram", "Kangeyam", "Palladam", "Udumalpet"],
  Vellore: ["Vellore", "Gudiyatham", "Katpadi", "Pernambut"],
  Ranipet: ["Ranipet", "Arcot", "Walajapet", "Arakkonam"],
  Kanchipuram: ["Kanchipuram", "Sriperumbudur", "Uthiramerur", "Walajabad"],
  Tiruvannamalai: ["Tiruvannamalai", "Arani", "Polur", "Cheyyar"],
  Cuddalore: ["Cuddalore", "Chidambaram", "Neyveli", "Panruti", "Virudhachalam"],
  Villupuram: ["Villupuram", "Tindivanam", "Gingee", "Kallakurichi", "Ulundurpet"],
  Namakkal: ["Namakkal", "Rasipuram", "Tiruchengode", "Paramathi Velur"],
  Karur: ["Karur", "Kulithalai", "Aravakurichi", "Pugalur"],
  Krishnagiri: ["Krishnagiri", "Hosur", "Denkanikottai", "Bargur"],
  Dharmapuri: ["Dharmapuri", "Harur", "Palacode", "Pennagaram"],
  Nagapattinam: ["Nagapattinam", "Mayiladuthurai", "Vedaranyam", "Sirkazhi", "Tharangambadi"],
  Ramanathapuram: ["Ramanathapuram", "Rameswaram", "Paramakudi", "Kamuthi", "Mudukulathur"],
  Sivaganga: ["Sivaganga", "Karaikudi", "Devakottai", "Manamadurai"],
  Pudukkottai: ["Pudukkottai", "Aranthangi", "Alangudi", "Keeranur"],
  Perambalur: ["Perambalur", "Veppanthattai", "Kunnam"],
  Ariyalur: ["Ariyalur", "Jayankondam", "Andimadam"],
  "The Nilgiris": ["Ooty", "Coonoor", "Gudalur", "Kotagiri"],
};

const locations = Object.entries(regions).flatMap(([district, towns]) =>
  towns.map((name) => ({ name, district, state: "Tamil Nadu", isActive: true }))
);

module.exports = locations;
