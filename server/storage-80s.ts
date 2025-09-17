// 80s Hits Data for PurpleBeats
export const artists80s = [
  { id: "artist-1", name: "Synth Masters", bio: "80s synthpop legends" },
  { id: "artist-2", name: "New Wave Kings", bio: "New wave pioneers of the 80s" },
  { id: "artist-3", name: "Rock Anthems", bio: "Classic rock from the 80s" },
  { id: "artist-4", name: "Pop Icons", bio: "80s pop sensations" },
  { id: "artist-5", name: "Dance Floor", bio: "80s dance and disco" },
  { id: "artist-6", name: "Electronic Dreams", bio: "Electronic 80s innovators" },
];

export const albums80s = [
  { id: "album-1", title: "80s Synth Classics", artistId: "artist-1", genre: "Synthpop", year: 1983 },
  { id: "album-2", title: "New Wave Hits", artistId: "artist-2", genre: "New Wave", year: 1984 },
  { id: "album-3", title: "Rock Anthems", artistId: "artist-3", genre: "Rock", year: 1985 },
  { id: "album-4", title: "Pop Gold", artistId: "artist-4", genre: "Pop", year: 1986 },
  { id: "album-5", title: "Dance Fever", artistId: "artist-5", genre: "Dance", year: 1987 },
  { id: "album-6", title: "Electronic Voyage", artistId: "artist-6", genre: "Electronic", year: 1988 },
];

export const songs80s = [
  // Synthpop Classics
  { id: "song-1", title: "Take On Me", artistId: "artist-1", albumId: "album-1", duration: 225, genre: "Synthpop", playCount: 3200000 },
  { id: "song-2", title: "Sweet Dreams", artistId: "artist-1", albumId: "album-1", duration: 216, genre: "Synthpop", playCount: 2900000 },
  { id: "song-3", title: "Tainted Love", artistId: "artist-1", albumId: "album-1", duration: 160, genre: "Synthpop", playCount: 2500000 },
  { id: "song-4", title: "Blue Monday", artistId: "artist-1", albumId: "album-1", duration: 450, genre: "Synthpop", playCount: 2300000 },
  { id: "song-5", title: "Girls Just Want to Have Fun", artistId: "artist-1", albumId: "album-1", duration: 238, genre: "Synthpop", playCount: 2800000 },

  // New Wave
  { id: "song-6", title: "Don't You Forget About Me", artistId: "artist-2", albumId: "album-2", duration: 263, genre: "New Wave", playCount: 2700000 },
  { id: "song-7", title: "True", artistId: "artist-2", albumId: "album-2", duration: 265, genre: "New Wave", playCount: 2100000 },
  { id: "song-8", title: "Everybody Wants to Rule the World", artistId: "artist-2", albumId: "album-2", duration: 251, genre: "New Wave", playCount: 2600000 },
  { id: "song-9", title: "Love Is a Battlefield", artistId: "artist-2", albumId: "album-2", duration: 332, genre: "New Wave", playCount: 2200000 },
  { id: "song-10", title: "Hungry Like the Wolf", artistId: "artist-2", albumId: "album-2", duration: 221, genre: "New Wave", playCount: 2400000 },

  // Rock Anthems
  { id: "song-11", title: "Eye of the Tiger", artistId: "artist-3", albumId: "album-3", duration: 246, genre: "Rock", playCount: 3500000 },
  { id: "song-12", title: "Livin' on a Prayer", artistId: "artist-3", albumId: "album-3", duration: 250, genre: "Rock", playCount: 3300000 },
  { id: "song-13", title: "Don't Stop Believin'", artistId: "artist-3", albumId: "album-3", duration: 251, genre: "Rock", playCount: 4000000 },
  { id: "song-14", title: "Pour Some Sugar on Me", artistId: "artist-3", albumId: "album-3", duration: 283, genre: "Rock", playCount: 2800000 },
  { id: "song-15", title: "We're Not Gonna Take It", artistId: "artist-3", albumId: "album-3", duration: 203, genre: "Rock", playCount: 2300000 },

  // Pop Gold
  { id: "song-16", title: "Billie Jean", artistId: "artist-4", albumId: "album-4", duration: 294, genre: "Pop", playCount: 4500000 },
  { id: "song-17", title: "Beat It", artistId: "artist-4", albumId: "album-4", duration: 258, genre: "Pop", playCount: 3800000 },
  { id: "song-18", title: "Like a Virgin", artistId: "artist-4", albumId: "album-4", duration: 219, genre: "Pop", playCount: 3200000 },
  { id: "song-19", title: "Material Girl", artistId: "artist-4", albumId: "album-4", duration: 240, genre: "Pop", playCount: 2700000 },
  { id: "song-20", title: "Purple Rain", artistId: "artist-4", albumId: "album-4", duration: 524, genre: "Pop", playCount: 4200000 },

  // Dance Floor
  { id: "song-21", title: "Flashdance... What a Feeling", artistId: "artist-5", albumId: "album-5", duration: 236, genre: "Dance", playCount: 2600000 },
  { id: "song-22", title: "Maniac", artistId: "artist-5", albumId: "album-5", duration: 244, genre: "Dance", playCount: 2400000 },
  { id: "song-23", title: "Footloose", artistId: "artist-5", albumId: "album-5", duration: 227, genre: "Dance", playCount: 2800000 },
  { id: "song-24", title: "I Wanna Dance with Somebody", artistId: "artist-5", albumId: "album-5", duration: 291, genre: "Dance", playCount: 3100000 },
  { id: "song-25", title: "Dancing Queen", artistId: "artist-5", albumId: "album-5", duration: 231, genre: "Dance", playCount: 3600000 },

  // Electronic Dreams
  { id: "song-26", title: "Blue Monday", artistId: "artist-6", albumId: "album-6", duration: 450, genre: "Electronic", playCount: 2300000 },
  { id: "song-27", title: "Personal Jesus", artistId: "artist-6", albumId: "album-6", duration: 197, genre: "Electronic", playCount: 2100000 },
  { id: "song-28", title: "Enjoy the Silence", artistId: "artist-6", albumId: "album-6", duration: 273, genre: "Electronic", playCount: 2500000 },
  { id: "song-29", title: "Just Can't Get Enough", artistId: "artist-6", albumId: "album-6", duration: 224, genre: "Electronic", playCount: 2200000 },
  { id: "song-30", title: "Cars", artistId: "artist-6", albumId: "album-6", duration: 239, genre: "Electronic", playCount: 1900000 },
];