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

        $('button').on('click', sortAlphabetically);

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

  function sortAlphabetically() {

    let itemsArray = [];
    let sortedArray;
    let btnAttr = ($(this).attr("id"));

    $.each($('.card'), function(i, index){
      var item = {};
      item.name = index.querySelector('h2').innerHTML;
      item.data = index;
      itemsArray.push(item);
    });

    if (btnAttr === "asc") {
      console.log(btnAttr);
      sortedArray = itemsArray.sort(function(a,b){return a.name > b.name});
    } else if (btnAttr === "desc") {
      sortedArray = itemsArray.reverse(function(a,b){return a.name > b.name});
    }

    $('#cards-container').html("");

    console.log(sortedArray);

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
      drawFiveCards();
    } else if ($(clickedEvent).attr('id')==='pokemon-cards') {
      navLinks.removeClass('active');
      $(this).addClass('active');
      getPokemon();
    }
  }

  function isDeckAvailable() {
    if(localStorage.getItem('deckID') === null) {

      let deckURL = "https://deckofcardsapi.com/api/deck/new/";

      $.getJSON(deckURL)
        .then(function(deckData){
          localStorage.setItem('deckID', deckData.deck_id);
          return deckData.deck_id;
        })

    } else {
      return localStorage.getItem('deckID');
    }
  }

  function drawFiveCards() {
    var deckID = isDeckAvailable();
    var deckURL = 'https://deckofcardsapi.com/api/deck/' + deckID + '/draw/';

    var deckOptions = {
      count: 5
    }

    console.log(deckURL);

    $.getJSON(deckURL, deckOptions)
      .then(buildCardsHTML)
  }

  function buildCardsHTML(data){
    let cardHTML ="";
    let numberOfCardLeft = data.remaining;

    var cards = data.cards.map(cardData => [
      cardData.suit,
      cardData.value,
      cardData.image
    ])

    $.each(cards, function(i, index){
      cardHTML += '<div class="card"><img src="' + index[2] + '" /><div class="meta-data">This card is the ' + index[1] + ' of ' + index[0] + '<br>There are ' + numberOfCardLeft + ' cards left in the deck</div></div>'
    })

    $('#cards-container').html(cardHTML);
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
  $('nav a').on('click', processNavLinks)

})
