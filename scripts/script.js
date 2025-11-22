/**
 * Code sections
 * 1. Global variables
 * 2. Api requests
 * 3. Handling data
 * 4. Content for artist div
 * 5. Content for album div
 * 6. Event listeners
 */


//#region 1. Global variables

// Cleaner display for null values
const nullReplace = 'N/A'

//#endregion

//#region 2. Api request

const getInfo = async (action, params = {}) => {
    const res = await axios.get('/api',{params:{action, ...params}});
    return res.data;
} 

//#endregion

//#region 3. Handling data

//Sanitize user-generated artist descriptions + separate text from other html elements
const formatBio = (text) => {
    const sanitizedText = DOMPurify.sanitize(text, {
        //Only allow certain formatting
        validTags: ['a','b','strong','i','em','u','span','br'],
        validAttr: ['href','title','rel','target']
    });

    const htmlNodes = $.parseHTML(sanitizedText, document, false)

    const textNodes = [];
    const elemNodes = [];

    htmlNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const textElem = node.textContent;
            if (textElem && textElem.trim().length) textNodes.push(textElem);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            elemNodes.push(node.outerHTML)
        }
    })
    
    const plainText = textNodes.join(' ').replace(/\s+/g, ' ').trim();
    const elemTags = elemNodes.join(' ')
    
    return {plainText, elemTags}
}
 
//Handling single track or missing tracks albums
const normaliseTracks = (tracks) => {
    return Array.isArray(tracks) ? tracks
    : tracks == null ? []
    : [tracks]
}

//API data for track duration is in seconds, format to look better 
const durationFormat = (duration) => {
    if (duration === null) return nullReplace; //Consistent display for null values

    const initVal = Math.max(0, Number(duration) || 0);
    const hours = Math.floor(initVal / 3600);
    const mins = Math.floor((initVal % 3600) / 60);
    const secs = Math.floor(initVal % 60);

    //formatting seconds display to either h:mm:ss or m:ss
    return hours > 0  
    ? `${hours}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}` 
    : `${mins}:${String(secs).padStart(2, '0')}`
}

//LastFM data does not offer release year, get it from tags
const yearFromTags = (tags) => {
    //Normalising tags into an array for cleaner handling. Remove falsy values -> empty array
    const tagArr = Array.isArray(tags) ? tags : [tags].filter(Boolean);

    const currentYear = new Date().getFullYear();

        const parseTags = (value) => {
            const text = String(value ?? '').trim();
            if (!/^\d{4}$/.test(text)) return null; //Using regex to only accept 4 digit values
            const releaseYear = Number(text);

            //Limiting the range of accepted years for better results
            if (releaseYear < 1900 || releaseYear > currentYear +1) return null;
            return releaseYear
        };
    
    //Loop through the tags data to find the first valid value
    for (const tag of tagArr) {
        const year = parseTags(tag?.name);
        if (year !== null) return year; //Exit loop early if valid year tag found
    }; return nullReplace;
}

//#endregion

//#region 4. Content for artist div

//Reusable frame for creating artist div elements with given data 
const createArtistInfo = (artist, albums) => {
    let {plainText, elemTags} = formatBio(artist.bio.content)
    const artistInfoFrag = document.createDocumentFragment();
      const $artistHead = $('<h1>');
        $artistHead.addClass('artistName')
        $artistHead.append(artist.name);

    const $artistBio = $('<div>')
    $artistBio.addClass('artistBio')
      
        const $artistText = $('<p>'); 
            $artistText.addClass('artistPara')
            $artistText.append(plainText)

        const $artistTags = $('<div>'); 
            $artistTags.addClass('artistTags')
            $artistTags.append(elemTags);
        
        $artistBio.append($artistText, $artistTags)
        
    const $albumListHead = $('<h2>')
        $albumListHead.addClass('albumListHeading')
        $albumListHead.text('Releases')
    
    //Create album list
    
    const $albumUl = $('<ul>')
        $albumUl.addClass('albumList')
    
    albums.forEach(album => {
        const $albumLi = $('<li>', {
            text: album.name
        })
        $albumUl.append($albumLi)
    })

        //Event listener for all li elements using event delegation
            $albumUl.on('click', (e) => {
            const albumLi = e.target.closest('.albumList > li');
                //if (!albumLi || albumUl.contains(albumLi)) return; //Ignore clicks outside intended elements
                showAlbumInfo(artist.name, albumLi.textContent.trim())
            })

    

    artistInfoFrag.append($artistHead[0], $artistBio[0], $albumListHead[0], $albumUl[0])

    return artistInfoFrag 
    }

//Get artist related data and use it to create the elements
const showArtistInfo = async (artist, targetContainer) => {
        const artistData = await getInfo('artistInfo', {artist: artist});
        const artistAlbums = await getInfo('artistAlbums', {artist: artist})

        const info = artistData?.artist
        const albums = artistAlbums?.topalbums?.album ?? [];

        
        
        $(function() {
            $(targetContainer).fadeOut(700, function() {
                $('.albumInformation').empty().fadeOut(500)
                $(targetContainer).empty().append(createArtistInfo(info, albums))
                .fadeIn(700, function() {
                    $(this).css('display', 'flex')
                })
            })
        })
        
}

//#endregion

//#region 5. Content for album div

const createTracklist = (tracks) => {
    const tracklist = normaliseTracks(tracks)
    if (tracklist.length === 0) {
        const noTracks = document.createElement('p');
            noTracks.textContent = 'Tracks not available';
            return noTracks;
    }

    const tbl = document.createElement('table')
    tbl.classList.add('tracklistTbl')
    
    const songListFrag = document.createDocumentFragment();
    //colgroup and col elements for the table for styling
    
    const colGr = document.createElement('colgroup');
    const colClasses = ['numCol', 'titleCol', 'durationCol']
    colClasses.forEach(className => {
        const colElem = document.createElement('col');
            $(colElem).addClass(className);
            colGr.appendChild(colElem)
    }); tbl.appendChild(colGr)

    const [tHead, tBody, tFoot] = [tbl.createTHead(), tbl.createTBody(), tbl.createTFoot()];

    const slHeadRow = tHead.insertRow();
    
    
    ['#', 'Title', 'Duration'].forEach(label => {
      const songListHead = Object.assign(document.createElement('th'), {
        scope: 'col',
        textContent: label
      })
        $(songListHead).addClass(`track${label}`);
        songListFrag.appendChild(songListHead);
    }); slHeadRow.append(songListFrag)
    
    //Looping tracks info into the table
    tracklist.forEach(track => { 
      const albumDuration = durationFormat(track.duration)
      const trackInfo = tBody.insertRow();
      [track['@attr'].rank, track.name, albumDuration].forEach(value => {
        const trackData = trackInfo.insertCell();
        trackData.textContent = value;
      })
    })
    
    //Create table footer for displaying total album runtime
    const songListFooter = tFoot.insertRow();
    const slFooterHead = Object.assign(document.createElement('th'), {
        scope: 'row',
        colSpan: '2',
        textContent: 'Total runtime'
    })
    songListFooter.appendChild(slFooterHead)
    
    //Calculate total album runtime from duration array, starting sum at 0
    let total = tracklist.reduce((sum, track) => sum + Number(track.duration || 0), 0)


    // Display runtime in the footer
    const albumRuntime = document.createElement('td');
    albumRuntime.textContent = durationFormat(total);
    songListFooter.appendChild(albumRuntime);

    
    //albumDiv.appendChild(tbl);
    songListFrag.append(tbl)
    return songListFrag
  }


// Create the basic album info table
const createAlbumInfo = (album) => {
    const albumInfoFrag = document.createDocumentFragment();
    //Album cover
    const albumCover = document.createElement('img');
        $(albumCover).addClass('albumCover');
        albumCover.src = albumData.album.image[3]['#text'];
    
    // Album information
    const albumInfoTbl = document.createElement('table');
        $(albumInfoTbl).addClass('albumInfoTbl');
  
    //Track list title
    const trackListHeading = document.createElement('h2')
        $(trackListHeading).addClass('tracklistHeading');
        trackListHeading.textContent = 'Tracklist';

        const albumInfoRows = (title, value) => {
            const row = document.createElement('tr');
            const heading = Object.assign(document.createElement('th'), {
                scope: 'row',
                textContent: title
            }); 
            

            const info = document.createElement('td');
                info.textContent = value;

            row.append(heading, info);
            return row
        }
    albumInfoTbl.append(
        albumInfoRows('Artist', album?.artist),
        albumInfoRows('Album', album?.name),
        albumInfoRows('Release', yearFromTags(album?.tags?.tag))
    )
   albumInfoFrag.append(albumCover, albumInfoTbl, trackListHeading)
   return albumInfoFrag
}

const showAlbumInfo = async (artist, album) => {
    try {
        albumData = await getInfo('albumInfo', {artist: artist, album: album})
        const albumInfo = albumData?.album
        const albumTracks = albumInfo?.tracks?.track;
        
        $(function() {
            $('.albumInformation').slideUp(850, function() {
                $('.albumInformation').empty().append(createAlbumInfo(albumInfo), createTracklist(albumTracks))
                .slideDown(850, function() {
                    $(this).css('display', 'flex')
                })
            });
        
        })

    } catch(err) {
        console.log(err);
    }
  }

//#endregion

//#region 6. Event Listeners

//Event listener for li elements using event delegation
$(function() {
    $('.artistList').on('click', (e) => {
        const artistLi = e.target.closest('li');
        //$('.albumInformation').empty();
        if (!artistLi || !this.contains(artistLi)) return; //Ignore clicks outside intended elements
        showArtistInfo(artistLi.textContent.trim(), $('.artistInformation'))
    })
})

$(function() {
    $('.artistSearch').on('submit', (e) => {
        //$('.albumInformation').empty();
        e.preventDefault();
        showArtistInfo(artistInput.value.trim(), $('.artistInformation'))
        $('.artistSearch').get(0).reset()
    });
});

//#endregion