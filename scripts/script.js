/**
 * Code sections
 * 1. Global variables
 * 2. Api related functions
 * 3. Handling data
 * 4. Content for artist div
 * 5. Content for album div
 * 6. Search functions
 * 7. Event listeners
 */


//#region 1. Global variables
const nullReplace = 'N/A'; // Cleaner display for null values

//#endregion

//#region 2. Api related functions

const getInfo = async (action, params = {}) => {
    const res = await axios.get('/api',{params:{action, ...params}});
    return res.data;
} 

//Reduce excessive API calls
const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay)
    }
}

//#endregion

//#region 3. Handling data

//Sanitize user-generated artist descriptions + separate text from other html elements
const formatBio = (text) => {
    const sanitizedText = DOMPurify.sanitize(text, {
        //Only allow certain formatting
        ALLOWED_TAGS: ['a','b','strong','i','em','u','span','br'],
        ALLOWED_ATTR: ['href','title','rel','target']
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
    
    //Whitespace normalizing
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
    const $artistInfoFrag = $(document.createDocumentFragment());
      const $artistHead = $('<h1>', {
        class: 'artistName',
        text: artist.name
      });

    const $artistBio = $('<div>', { class: 'artistBio', id: 'artist' }).append(
        $('<p>', { class: 'artistPara', text: plainText }), 
        $('<div>', { class: 'artistTags', html: elemTags}) 
    )   
    const $albumListHead = $('<h2>', { class: 'albumListHeading', text: 'Releases' })
    
    const $artistInfo = $('<div>', { class: '.artistInfo' }).append($artistHead, $artistBio, $albumListHead)

    //Create album list
    const $albumUl = $('<ul>', { class: 'albumList' });
        albums.forEach(album => {
            const $albumLi = $('<li>').append(
                $($('<span>', { text: album.name }))
            )
            $albumUl.append($albumLi)
    })
    
        //Event listener for all li elements using event delegation
            $albumUl.on('click', (e) => {
            const albumLi = e.target.closest('.albumList > li');
                //if (!albumLi || albumUl.contains(albumLi)) return; //Ignore clicks outside intended elements
                showAlbumInfo(artist.name, albumLi.textContent.trim())
            })

    $artistInfoFrag.append($artistInfo, $albumUl)

    return $artistInfoFrag 
    }

//Get artist related data and use it to create the elements
const showArtistInfo = async (artist, targetContainer) => {
        const artistData = await getInfo('artistInfo', {artist: artist});
        const artistAlbums = await getInfo('artistAlbums', {artist: artist})

        const info = artistData?.artist
        const albums = artistAlbums?.topalbums?.album ?? [];

        
        (function($) {
            $(function() {
                (targetContainer).fadeOut(700, function() {
                    $('.albumInformation').empty().fadeOut(500)
                    $(targetContainer).empty().append(createArtistInfo(info, albums))
                    .fadeIn(700, function() {
                        $(this).css('display', 'flex') //Animation changes display to block, change it back to flex
                    })
                })
                $('.artistBio').find('.artistTags a').each(function() {
                        const href = $(this).attr('href') || '';
                        if (!/^https?:\/\//i.test(href)) $(this).removeAttr('href');
                        $(this).attr('rel', 'noopener noreferrer')
                        $(this).attr('target', '_blank');
                }); 
            });
        })(jQuery)
}

//#endregion

//#region 5. Content for album div

const createTracklist = (tracks) => {
    const tracklist = normaliseTracks(tracks)
    if (tracklist.length === 0) {
        const $noTracks = $('<p>');
            $noTracks.text('Tracks not available');
            return $noTracks;
    }

    const $tbl = $('<table>');
    $tbl.addClass('pure-table-horizontal')
    $tbl.attr('id', 'tracklistTbl')
    
    const songListFrag = document.createDocumentFragment();
    //colgroup and col elements for the table for styling
    const $colGr = $('<colgroup>');
    ['numCol', 'titleCol', 'durationCol'].forEach(className => {
        const $colElem = $('<col>');
            $colElem.addClass(className);
            $colGr.append($colElem)
    }); $tbl.append($colGr)

    const tbl = $tbl[0]
    const [tHead, tBody, tFoot] = [tbl.createTHead(), tbl.createTBody(), tbl.createTFoot()];

    //Title row
    const slHeadRow = tHead.insertRow();
    ['#', 'Title', 'Duration'].forEach(label => {
      const $songListHead = $('<th>', {
        scope: 'col',
        text: label,
        class: `track${label}`
      }); songListFrag.append($songListHead[0]);
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
    const $slFooterHead = $('<th>', {
        scope: 'row',
        colSpan: '2',
        text: 'Total runtime'
    }); songListFooter.append($slFooterHead[0])
    
    //Calculate total album runtime from duration array, starting sum at 0
    let total = tracklist.reduce((sum, track) => sum + Number(track.duration || 0), 0)

    // Display runtime in the footer
    const $albumRuntime = $('<td>', { text: durationFormat(total) });
    songListFooter.append($albumRuntime[0]);

    
    //albumDiv.appendChild(tbl);
    songListFrag.append(tbl)
    return songListFrag
  }


// Create the basic album info table
const createAlbumInfo = (album) => {
    const $albumInfoFrag = $(document.createDocumentFragment());
    //Album cover
    const $albumCover = $('<img>', { class: 'albumCover', src: albumData.album.image[3]['#text'] });
    
    // Album information
    const $albumInfoTbl = $('<table>', { class: 'albumInfoTbl' });
  
    //Track list title
    const $trackListHeading = $('<h2>', { class: 'tracklistHeading', text: 'Tracklist' });

        const albumInfoRows = (title, value) => {
            const $row = $('<tr>');
            const $heading = $('<th>', { scope: 'row', text: title }); 
        
            const $info = $('<td>', { text: value });

            $row.append($heading, $info);
            return $row
        }
    $albumInfoTbl.append(
        albumInfoRows('Artist', album?.artist),
        albumInfoRows('Album', album?.name),
        albumInfoRows('Release', yearFromTags(album?.tags?.tag))
    )
   $albumInfoFrag.append($albumCover, $albumInfoTbl, $trackListHeading)
   return $albumInfoFrag
}

const showAlbumInfo = async (artist, album) => {
    try {
        albumData = await getInfo('albumInfo', {artist: artist, album: album})
        const albumInfo = albumData?.album
        const albumTracks = albumInfo?.tracks?.track;
        const $albumDiv = $('.albumInformation');
        
        $(function() {
            $albumDiv.slideUp(850, function() {
                $albumDiv.empty().append(createAlbumInfo(albumInfo), createTracklist(albumTracks))
                .slideDown(850, function() {
                    $(this).css('display', 'flex') //Animation changes display to block, change it back to flex
                })
            });
        })

    } catch(err) {
        console.log(err);
    }
  }

//#endregion

//#region 6. Search functions

//Render artist search suggestions while typing
/*const showSearchSuggestions = async () => {
    const input = document.querySelector('.searchInput');
    const searchQuery = input.value.trim();
    if (searchQuery.length < 2) {
        $('.searchSuggestions').html('');
        return;
    };

    const artistResults = await getInfo('artistSearch', {artist: searchQuery}); 
    const artists = artistResults.results.artistmatches.artist.map(artist => artist.name);

    $('.searchSuggestions').empty();
    artists.forEach(artist => {
        const $suggestions = $('<div>', { text: artist });

        $suggestions.on('click', (() => {
            showArtistInfo(artist, $('.artistInformation'));
            $('.searchSuggestions').empty();
        }))
        $(input).on('blur', (() => {
            $('.searchSuggestions').empty()
        }))
        $('.searchSuggestions').append($suggestions)
    })
}*/

//#endregion

//#region 7. Event Listeners

//Event listener for li elements using event delegation
(function($) {
    $(function() {
        $('.artistList').on('click', (e) => {
            const artistLi = e.target.closest('li');
            if (!artistLi || !this.contains(artistLi)) return; //Ignore clicks outside intended elements
            showArtistInfo(artistLi.textContent.trim(), $('.artistInformation'))
        
        })
        $('.artistSearch').on('submit', (e) => {
            e.preventDefault();
            showArtistInfo($('.searchInput').val().trim(), $('.artistInformation'))
            $('.artistSearch').get(0).reset();
            $('.searchInput').get(0).blur();
            
        });

        $('.searchInput').on('input', (() => {
            if ($('.searchInput').val().trim() !== '') {
                $('.searchInput').get(0).focus()
            }
        }));

        $('.searchInput').on('focus', (() => {
            $('.searchBtn').prop('disabled', false)
        }));

        $('.searchInput').on('blur', (() => {
            if ($('.searchInput').val().trim() === '') {
                $('.searchBtn').prop('disabled', true)
            }
            
        }));

        //$('.artistSearch').on('input', debounce(showSearchSuggestions, 400))
    })
})(jQuery)

//#endregion