
var ret = '';

var alreadyChosen = false;

async function getUserTaste(spotifyApi) {
  var data = await spotifyApi.getMyTopTracks({ limit: 100 })

  ids = Array()
  names = Array()
  if (data.body.total < 50) {
    let data = await spotifyApi.getPlaylistTracks('37i9dQZEVXbMDoHDwVN2tF', { limit: 50 })
    for (let track of data.body.items) {
      ids.push(track.track.id);
      names.push(track.track.name);
    }

  }
  if (data.body.total != 0) {
    for (let track of data.body.items) {
      ids.push(track.id);
      names.push(track.name);
    }
  }

  var data = await spotifyApi.getAudioFeaturesForTracks(ids)
  ret = Array()

  //parse dei parametri utili
  var index = 0
  for (let track of data.body.audio_features) {
    ret.push(
      {
        uri: ('spotify:track:' + track.id),
        name: names[index],
        danceability: track.danceability * 255,
        energy: track.energy * 255,
        acousticness: track.acousticness * 255,
      });
    index++
  }
  return ret
}


async function getSongFromColors(colors, songs, songsChosen) {
  var colors = await colors 
  var max = null
  var red = 0;
  var green = 0;
  var blue = 0;

  for (colorIndex = 0; colorIndex < colors.length; colorIndex++) {
    red += colors[colorIndex].red
    green += colors[colorIndex].green
    blue += colors[colorIndex].blue
  }
  red = red / colors.length
  green = green / colors.length
  blue = blue / colors.length

  var averageColor = {
    r: red,
    g: green,
    b: blue,
  }

  for (songIndex = 0; songIndex < songs.length; songIndex++) {
    //controllo se è stata già scelta la stessa canzone
    for(chosenIndex = 0; chosenIndex < songsChosen.length; chosenIndex++){
      if (songs[songIndex].uri == songsChosen[chosenIndex].uri) {
        alreadyChosen = true;
        break;
      }
    }
    if (alreadyChosen == true){
      alreadyChosen = false;
      continue;
    } 

    if(max == null) max = songs[songIndex]

    //rosso
    if (averageColor.r > averageColor.b && averageColor.r > averageColor.g) {
      if (songs[songIndex].energy > max.energy) {
        max = songs[songIndex]
      }
    }
    //arancione
    else if (averageColor.r > averageColor.g && averageColor.r > averageColor.b && averageColor.r / averageColor.g < averageColor.r / averageColor.b && averageColor.r / averageColor.g > 1.25) {
      if (songs[songIndex].energy > max.energy && songs[songIndex].acousticness > max.acousticness) {
        max = songs[songIndex]
      }
    }

    //giallo
    else if (averageColor.r > averageColor.g && averageColor.g > averageColor.b && averageColor.r / averageColor.g <= 1.25 && averageColor.r / averageColor.g >= 0.75 && averageColor.r / averageColor.g < averageColor.r / averageColor.b) {
      if (songs[songIndex].energy > max.energy && songs[songIndex].acousticness > max.acousticness) {
        max = songs[songIndex]
      }
    }

    //verde
    else if (averageColor.g > averageColor.r && averageColor.g > averageColor.b) {
      if (songs[songIndex].acousticness > max.acousticness) {
        max = songs[songIndex]
      }
    }

    //blu
    else if (averageColor.b > averageColor.r && averageColor.b > averageColor.g) {
      if (songs[songIndex].danceability > max.danceability) {
        max = songs[songIndex]
      }
    }

    //viola
    else if (averageColor.b > averageColor.r && averageColor.b > averageColor.g && averageColor.b / averageColor.r > averageColor.b / averageColor.g) {
      if (songs[songIndex].danceability > max.danceability && songs[songIndex].energy > max.energy) {
        max = songs[songIndex]
      }
    }

    //bianco,grigio,nero
    else if (averageColor.r == averageColor.g && averageColor.r == averageColor.b) {
      if (songs[songIndex].acousticness <= max.acoustiness && songs[songIndex].energy <= max.energy && songs[songIndex.danceability] <= max.danceability) {
        max = songs[songIndex]
      }
    }
  }

  //scegli una foto per i colori
  ret = {
    uri: max.uri,
    name: max.name
  }

  alreadyChosen = false

  return ret
}

async function analyzePlaylist(spotifyApi, playlistId) {

  var data = await spotifyApi.getPlaylistTracks(playlistId, { limit: 100 })
  var ids = Array()

  for (let item of data.body.items) {
    ids.push(item.track.id);
  }

  let averageAcousticness = 0, countAcousticness = 0
  let averageDanceability = 0, countDanceability = 0
  let averageEnergy = 0, countEnergy = 0
  let averageInstrumentalness = 0, countInstrumentalness = 0
  let averageLiveness = 0, countLiveness = 0
  let averageLoudness = 0, countLoudness = 0
  let averageSpeechiness = 0, countSpeechiness = 0
  let averageTempo = 0, countTempo = 0

  var data2 = await spotifyApi.getAudioFeaturesForTracks(ids)

  for (let track of data2.body.audio_features) {
    if (track !== undefined && track != null) {
      if (track.acousticness !== undefined && track.acousticness != null) {
        averageAcousticness += track.acousticness * 100
        countAcousticness++
      }
      if (track.danceability !== undefined && track.danceability != null) {
        averageDanceability += track.danceability * 100
        countDanceability++
      }
      if (track.energy !== undefined && track.energy != null) {
        averageEnergy += track.energy * 100
        countEnergy++
      }
      if (track.instrumentalness !== undefined && track.instrumentalness != null) {
        averageInstrumentalness += track.instrumentalness * 100
        countInstrumentalness++
      }
      if (track.liveness !== undefined && track.liveness != null) {
        averageLiveness += track.liveness * 100
        countLiveness++
      }
      if (track.loudness !== undefined && track.loudness != null) {
        averageLoudness += track.loudness
        countLoudness++
      }
      if (track.speechiness !== undefined && track.speechiness != null) {
        averageSpeechiness += track.speechiness * 100
        countSpeechiness++
      }
      if (track.tempo !== undefined && track.tempo != null) {
        averageTempo += track.tempo
        countTempo++
      }
    }
  }


  var ret = {
    Acousticness: (averageAcousticness / (countAcousticness)).toFixed(2),
    Danceability: (averageDanceability / (countDanceability)).toFixed(2),
    Energy: (averageEnergy / (countEnergy)).toFixed(2),
    Instrumentalness: (averageInstrumentalness / (countInstrumentalness)).toFixed(2),
    Liveness: (averageLiveness / (countLiveness)).toFixed(2),
    Loudness: (averageLoudness / (countLoudness)).toFixed(2),
    Speechiness: (averageSpeechiness / (countSpeechiness)).toFixed(2),
    Tempo: (averageTempo / (countTempo)).toFixed(2)
  }

  console.log(countAcousticness)
  console.log(countDanceability)
  console.log(countEnergy)
  console.log(countInstrumentalness)
  console.log(countLiveness)
  console.log(countLoudness)
  console.log(countSpeechiness)
  console.log(countTempo)

  console.log(ret)

  return ret
}


module.exports = {
  getUserTaste,
  getSongFromColors,
  analyzePlaylist
}

