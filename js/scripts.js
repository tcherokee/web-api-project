$(document).ready(function() {
  var url = 'http://pokeapi.co/api/v2/pokemon/';

  var pokemonOptions = {
    limit:2
  }

  function getPokemonData(data){
    return Promise.all(data
              .map(url => $.getJSON(url)
                .then(function(data){
                  let p = getPokemonAbility(data.abilities);

                  return p.then(pokemonAbilities => [
                    data.sprites.front_shiny,
                    data.name,
                    data.stats
                      .map(statistic => statistic.stat.name + ':' + statistic.base_stat),
                    pokemonAbilities
                  ])
                })
              ))
  }

  function getPokemonAbility(ability){
    return Promise.all(ability
              .map(pokemonAbility => $.getJSON(pokemonAbility.ability.url)
                .then(abilityData => [
                  abilityData.name,
                  abilityData.effect_entries[0].effect
                ])))
  }

  function buildPokemonHTML(pokemonData) {
      var imageHTML;
      var nameHTML;
      var statsHTML;
      var abilityHTML;
      var fullHTML;

      pokemonData.then(function(v) {
        let buttons = "";

        $.each(v, function(i, index){

          //Build Image HTML
          imageHTML = '<img src="' + index[0] + '"/>';

          //Build Name HTML
          nameHTML = '<h2>' + index[1] + '</h2>';

          //Build Stats HTML
          let stats1 = '<div class="col-66-l"><ul>';
          let stats2 = '<div class="col-33-l"><ul>';

          $.each(index[2], function(p, pokeStats){
            let splitStats = pokeStats.split(':');

            if (p < 3) {
              stats1 += '<li><span>' + splitStats[0] + '</span>' + splitStats[1] + '</li>';
            } else {
              stats2 += '<li><span>' + splitStats[0] + '</span>' + splitStats[1] + '</li>';
            }

          })

          stats1 += '</ul></div>';
          stats2 += '</ul></div>';

          statsHTML = stats2 + stats1;

          //Build Abilities HTML
          abilityHTML = "";
          $.each(index[3], function(a, ability){
            abilityHTML += '<li><span>' + ability[0] + ':</span>' + ability[1] + '</li>';
          })

          //Build Full HTML
          fullHTML = "";
          fullHTML += '<div class="card"><img src="images/pokemon-logo.png" class="img-r" /><div class="poke-name">';
          fullHTML += imageHTML;
          fullHTML += nameHTML;
          fullHTML += '</div><div class="meta-data hidden"><div class="poke-skills clearfix"><h3>Skills</h3>';
          fullHTML += statsHTML;
          fullHTML += '</div>'
          fullHTML += '<div class="poke-abilities clearfix"><h3>Abilities</h3><div><ul>';
          fullHTML += abilityHTML;
          fullHTML += '</ul></div></div></div>';

          $('#cards-container').append(fullHTML);

        })

        $('.card').on("click", bindOnClickEvent);

        $(document).on("keyup", toggleOverlay);

        buttons += '<button id="asc">Sort Pokemon Alphabetically (Ascending)</button>';
        buttons += '<button id="desc">Sort Pokemon Alphabetically (Descending)</button>'

        $('#btn-container').html(buttons);

        $('button').on('click', buttonHandler);

      })
  }

  function bindOnClickEvent() {
    var overlay = '<div id="overlay"></div>';
    var card = $(this).clone();

    overlay = $(overlay).append(card);

    $('main').append(overlay);

    $('#overlay')
      .on("click", toggleOverlay)
  }

  function toggleOverlay(e){
    if(e.target === this || e.which === 27) {
      $("#overlay").remove();
    } else {
      $('#overlay .meta-data').toggleClass('hidden');
    }
  }

  function buttonHandler() {

    let btnAttr = ($(this).attr("id"));

    if (btnAttr === "asc") {
      sortAlphabetically('sort');
    } else if (btnAttr === "desc") {
      sortAlphabetically('reverse');
    } else if (btnAttr === "new-cards") {
      console.log('new');
      drawFiveCards('new');
    } else if (btnAttr === "shuffle-cards") {
      console.log('shuffle');
      drawFiveCards('shuffle');
    } else if (btnAttr === "draw-cards") {
      console.log('draw');
      drawFiveCards('draw');
    }


  }

  function sortAlphabetically(sort) {


    let itemsArray = [];
    let sortedArray;

    $.each($('.card'), function(i, index){
      var item = {};
      item.name = index.querySelector('h2').innerHTML;
      item.data = index;
      itemsArray.push(item);
    });

    if (sort === 'sort') {
      sortedArray = itemsArray.sort(function(a,b){return a.name > b.name});
    } else if (sort === 'reverse') {
      sortedArray = itemsArray.reverse(function(a,b){return a.name > b.name});
    }

    $('#cards-container').html("");

    $.each(sortedArray, function(i, index){
      $('#cards-container').append(index.data);
    })

  }

  function processNavLinks() {
    var clickedEvent = event.target;
    var navLinks = $('nav a');

    if ($(clickedEvent).attr('id')==='playing-cards') {
      navLinks.removeClass('active');
      $(this).addClass('active')
      drawFiveCards('draw');
    } else if ($(clickedEvent).attr('id')==='pokemon-cards') {
      navLinks.removeClass('active');
      $(this).addClass('active');
      getPokemon();
    }
  }

  function isDeckAvailable() {
    if(localStorage.getItem('deckID') === null) {

      let newDeckURL = "https://deckofcardsapi.com/api/deck/new/";

      return $.getJSON(newDeckURL)
        .then(deckData => deckData.deck_id)

    } else {
      return localStorage.getItem('deckID');
    }
  }

  function drawFiveCards(apiCall) {
    var deckID;
    var deckURL;

    deckID = isDeckAvailable();
    deckURL = 'https://deckofcardsapi.com/api/deck/' + deckID + '/' + apiCall + '/';
    console.log(deckID);

    var deckOptions = {
      count: 5
    }

    if (apiCall === 'draw') {
      $.getJSON(deckURL, deckOptions)
        .then(buildCardsHTML)
    } else if (apiCall === 'shuffle') {
      $.getJSON(deckURL)
        .then(showPopupThenDraw)
    } else if (apiCall === 'new') {
      localStorage.removeItem('deckID');
      showPopupThenDraw();
    }
  }

  function showPopupThenDraw(message) {
    alert('this is a test');
    drawFiveCards('draw');
  }

  function buildCardsHTML(data){
    let cardHTML ="";
    let numberOfCardLeft = data.remaining;
    let buttons = "";

    var cards = data.cards.map(cardData => [
      cardData.suit,
      cardData.value,
      cardData.image
    ])

    $.each(cards, function(i, index){
      cardHTML += '<div class="card"><img src="' + index[2] + '" /><div class="meta-data">This card is the ' + index[1] + ' of ' + index[0] + '<br>There are ' + numberOfCardLeft + ' cards left in the deck</div></div>'
    })

    $('#cards-container').html(cardHTML);

    buttons += '<button id="new-cards">New Card Deck</button>';
    buttons += '<button id="shuffle-cards">Shuffle Deck</button>';
    buttons += '<button id="draw-cards">Draw Five Cards</button>';

    $('#btn-container').html(buttons);

    $('button').on('click', buttonHandler);
  }

  function getPokemon() {
    $.getJSON(url, pokemonOptions)
      .then(data => data.results)
      .then(data => data
        .map(data => data.url))
      .then(getPokemonData)
      .then(buildPokemonHTML)
  }

  getPokemon();
  $('nav a').on('click', processNavLinks);

})
