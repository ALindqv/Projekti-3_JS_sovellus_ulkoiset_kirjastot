# Projektin nimi ja tekijät
Projektin nimi on MusicLore ja tekijä on Arttu Lindqvist.

## Verkkolinkit:
Pääset julkaistuun sovellukseen käsiksi osoitteessa [netlify.app](linkki)

Linkki projektin videoesittelyyn osoitteessa [video.laurea.fi](linkki)

## Työn jakautuminen 
Työmäärä jakautui noin kahden viikon päivittäiseen työstämiseen. Kokonaisaika projektin valmistumiselle oli noin 75 tuntia.


## Oma arvio työstä ja oman osaamisen kehittymisestä
Mielestäni onnistuin hyödyntämään erilaisia kirjastoja parantamaan sovelluksen toimintaa ja ulkonäköä.

Parantamista olisi vielä css-osaamisessa ja eri esimerkiksi Axios-kirjaston laajemmassa hyödyntämisessä.

Sovelluksesta jäivät puuttumaan muun muassa:  

- Sivulla käyttäjälle näkyvät virheilmoitukset esimerkiksi epäonnistuneista AJAX-pyynnöistä. 
- Sovelluksen responsivisuus pienille näytöille.
- Sivulla näkyvä ilmoitus, jos AJAX-kutsu kestää poikkeellisen kauan.

Koen, että sain laajennettua osaamistani AJAX-kutsujen käyttämisessä. Sain myös melko hyvän käsityksen jQueryn käyttämisestä ja opin uusia css-tekniikoita.

Epäselväksi jäi muut tavat säilyttää API-avainta turvallisesti, mutta tulen tutustumaan niihin tulevaisuuden projekteissa. Lisäksi en saanut paljon kokemusta XML-kutsuista, koska käytin datan hakemiseen vain fetchiä ja JSON-dataa.

Antaisin itselleni pisteitä seuraavasti: 9/10 p

## Palaute opettajalle kurssista sekä itse opetuksesta tähän saakka
Kurssi sekä lähiopetus ovat tuntuneet hyödylliseltä ja sain tarvittaessa tarpeeksi tukea.

Oppimistani tukisi mahdollisesti lisää jos kävisin useammin lähiopetuksessa.


## Sisällysluettelo:

- [Tietoja sovelluksesta](#tietoja-sovelluksesta)
- [Tunnetut virheet/bugit](#unnetut-virheet/bugit)
- [Kuvakaappaukset](#kuvakaappaukset)
- [Teknologiat](#teknologiat)
- [Asennus](#asennus)
- [Lähestymistapa](#lähestymistapa)
- [Kiitokset](#kiitokset)
- [Lisenssi](#lisenssi)

## Tietoja sovelluksesta
MusicLore 2.0 on parannelty versio aikaisemmasta sovelluksestani MusicLore. Sovellus joka tarjoaa käyttäjälle tietoa erilaisista musiikkartisteista ja heidän julkaisuistaan. Sovellus tarjoaa valmiiksi muutaman artistin mutta hän voi myös vapaasti hakea artistia nimellä hakukentän avulla.

Sovellus hakee LastFM:stä dataa ja esittää ne sivulla. Käyttäjä saa seuraavaa tietoa:

Artisti:
- Kuvaus artistista
- Lista julkaisuista
- Käyttäjä voi hakea omavalintaisia artisteja

Albumi:
- Albumin esittäjä
- Albumin nimi
- Albumin julkaisuvuosi
- Albumin kappalelista

Jos näitä tietoja ei ole saatavilla, sovellus kertoo käyttäjälle.

2.0-version uusia ominaisuuksia:

- Sovellus ehdottaa käyttäjälle artisteja hakukenttää käyttäessä
- Artistikuvausta on paranneltu read more/read less napilla sekä sanitoidulla html:llä
- Tumma teema ja teeman vaihto

## Tunnetut virheet/bugit
- Pitkät artistien/albumien/kappalaiden nimet katkeavat eikä niitä pysty katsoa kokonaan. Tekstin vierittäsanimaatio tai tooltip-ratkaisu on yksi suunnitelluista ominaisuuksista.

## Kuvakaappaukset
Lisää tähän vähintään yksi kuvakaappaus toimivasta sovelluksesta  
`![Kirjoittaminen](https://unsplash.com/photos/VBPzRgd7gfc)`

## Teknologiat 
Käytin seuraavia teknologioita: 

- Sovelluksen rakenne: `html`, 
- Omat tyylit: `css`, 
- Toiminnot: `Javascript`

Ulkoiset kirjastot

- Yksinkertaisemmat API-kutsut: `Axios`
- Turvallisempaa dynaamista html:ää: `dompurify`
- Helpompaa DOM-koodia : `jQuery`
- Valmiita tyylikomponentteja omien tyylien kanssa: `Pure CSS`


## Asennus
Jos haluat käyttää sovellusta paikallisesti, tarvitset oman API-avaimen [LastFM-sivustolta](https://www.last.fm/api)
- Luo root-hakemistoon .env-tiedosto ja luo muuttuja `LASTFM_API_KEY = 'API-Avain tänne'`

Sen jälkeen:
- Lataa kaikki tiedostot/lataa tai kloonaa repositorio  
- Asenna netlify: Suorita `npm i -g netlify-cli`  
- Suorite terminaalissa `netlify dev`

## Kiitokset
Lista lähteistä ja esimerkeistä, joita käytit projektin aikana. Mainitse myös, jos käytit ChatGPT:tä tai muita tekoälytyökaluja koodauksen aikana ja kerro, miten ne auttoivat sinua.  

Käytin projektia tehdessä CoPilot-tekoälysovellusta. Käyttötarkoituksia olivat:
- Javascript-toimintojen ja css-attribuuttien selityksiä selvennystä varten.
- Apua ja ehdotuksia kommentointiin ja koodin luettavuuden parantamiseen.
- Ehdotuksia, mitä ominaisuuksia käyttää erilaisten toimintojen toteuttamiseen.
- Niissä tapauksissa, joissa käytin tekoälyn tarjoamia toimintoja tai koodia, kysyin aina tarvittaessa selityksen, miten koko koodi toimii.
- Lisäapua jQueryn käyttämiseen, erityisesti miten tutut JavaScript toiminnot voidaan tehdä jQuerylla.

Muita lähteitä:  
- [MDN Web Docs](https://developer.mozilla.org/en-US/)
- [jquery](https://jquery.com/)
- [W3Schools](https://www.w3schools.com/)

## Lisenssi
Valitse projektille lisenssi seuraamalla tätä [opasta](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository).

Esimerkki: MIT-lisenssi @ [tekijä](author.com)