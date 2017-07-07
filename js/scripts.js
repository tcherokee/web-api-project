$(document).ready(function() {
  var url = 'https://pokeapi.co/api/v2/pokemon/';

  var pokemonOptions = {
    limit:8
  }

  function mobileNavToggle() {
    $(this).toggleClass('open');
    $('nav ul').toggleClass('open');

    if($('nav ul').hasClass('open')){
      $('nav ul').slideDown();
    } else {
      $('nav ul').slideUp();
    }
  }

  function loadingOverlay() {
    $('main').append('<div id="loading"><div class="wrap"><div class="bounceball"></div><div class="text">NOW LOADING</div></div></div>');
  }

  function removeLoadingOverlay() {
    $('#loading .wrap').fadeOut('slow');
    setTimeout(function(){ $('#loading').fadeOut('slow'); }, 1000);
    setTimeout(function(){ $('#loading').remove(); }, 2000);
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
        $('#cards-container').html("");

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
          fullHTML += '</div>';
          fullHTML += '<div class="poke-abilities clearfix"><h3>Abilities</h3><div><ul>';
          fullHTML += abilityHTML;
          fullHTML += '</ul></div></div></div>';

          $('#cards-container').append(fullHTML);
          removeLoadingOverlay();

        })

        $('.card').on("click", function(e){
          bindOnClickEvent(e.currentTarget)
        });

        $(document).on("keyup", toggleOverlay);

        buttons += '<button id="asc" class="btn-blue">Sort Pokemon Alphabetically (Ascending)</button>';
        buttons += '<button id="desc" class="btn-red">Sort Pokemon Alphabetically (Descending)</button>';

        $('h1').html('Pokemon Trading Cards');
        $('#btn-container').html(buttons);

        $('button').on('click', buttonHandler);

      })
  }

  function bindOnClickEvent(cardDiv) {
    let overlay = '<div id="overlay"></div>';
    let card = $(cardDiv).clone();
    let previousCard = $(cardDiv).prev();
    let nextCard = $(cardDiv).next();
    let previousCardClone = previousCard.clone();
    let nextCardClone = nextCard.clone();


    if(previousCard.length > 0){
      card = card.append('<a href="#" class="arrow-left"><</a>')
    }

    if(nextCard.length > 0) {
      card = card.append('<a href="#" class="arrow-right">></a>')
    }

    overlay = $(overlay).append(card);

    $('main').append(overlay);

    $('#overlay .meta-data').removeClass("hidden")

    $('#overlay .arrow-left').on("click", function(){
      $('#overlay').remove();
      bindOnClickEvent(previousCard)
    })

    $('#overlay .arrow-right').on("click", function(){
      $('#overlay').remove();
      bindOnClickEvent(nextCard)
    })

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
      loadingOverlay();
      drawFiveCards('new');
    } else if (btnAttr === "shuffle-cards") {
      loadingOverlay();
      drawFiveCards('shuffle');
    } else if (btnAttr === "draw-cards") {
      loadingOverlay();
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
      sortedArray = itemsArray.sort(
                                  function(a,b){
                                    if(a.name < b.name) {
                                      return -1;
                                    } else if (a.name > b.name) {
                                      return 1;
                                    } else {
                                      return 0;
                                    }
                                  });
    } else if (sort === 'reverse') {
      sortedArray = itemsArray.reverse(
                                  function(a,b){
                                    if(a.name < b.name) {
                                      return -1;
                                    } else if (a.name > b.name) {
                                      return 1;
                                    } else {
                                      return 0;
                                    }
                                  });
    }

    $('#cards-container').html("");

    $.each(sortedArray, function(i, index){
      $('#cards-container').append(index.data);
    })

    $('.card').on("click", function(e){
      bindOnClickEvent(e.currentTarget)
    });

  }

  function processNavLinks(event) {
    var clickedEvent = event.target;
    var navLinks = $('nav a');

    if ($(clickedEvent).attr('id')==='playing-cards') {
      loadingOverlay();
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
    return $.getJSON("https://deckofcardsapi.com/api/deck/new/")
      .then(function(deckData){
        if(localStorage.getItem('deckID') === null) {
          localStorage.setItem('deckID', deckData.deck_id);
          return deckData.deck_id;
        } else {
          return localStorage.getItem('deckID')
        }
    })
  }

  function drawFiveCards(apiCall) {
    let deckID;
    let deckURL;
    let deckOptions = {
      count: 5
    }

    deckID = isDeckAvailable();

    deckID.then(function(data){

      deckURL = 'https://deckofcardsapi.com/api/deck/' + data + '/' + apiCall + '/';

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
    })
  }

  function showPopupThenDraw(message) {
    // alert('this is a test');
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
      cardHTML += '<div class="card playing"><img src="' + index[2] + '" /><div class="meta-data hidden">This card is the ' + index[1] + ' of ' + index[0] + '<br>There are ' + numberOfCardLeft + ' cards left in the deck</div></div>'
    })

    $('#cards-container').html(cardHTML);

    buttons += '<button id="new-cards" class="btn-blue">New Card Deck</button>';
    buttons += '<button id="shuffle-cards" class="btn-red">Shuffle Deck</button>';
    buttons += '<button id="draw-cards" class="btn-yellow">Draw Five Cards</button>';

    $('#btn-container').html(buttons);

    $('button').on('click', buttonHandler);

    $('h1').html('Playing Cards');

    $('.card').on("click", function(e){
      bindOnClickEvent(e.currentTarget)
    });

    removeLoadingOverlay();
  }

  function getPokemon() {
    loadingOverlay();

    $.getJSON(url, pokemonOptions)
      .then(data => data.results)
      .then(data => data
        .map(data => data.url))
      .then(getPokemonData)
      .then(buildPokemonHTML)
  }

  getPokemon();
  $('nav a').on('click', processNavLinks);
  $('#mobile-btn').on('click', mobileNavToggle);

})
