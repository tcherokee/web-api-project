$(document).ready(function() {
  var url = 'http://pokeapi.co/api/v2/pokemon/';
  var pokemonOptions = {
    limit:2
  }
  var pokemonName;
  var pokemonURLs = [];
  var pokemons = [];

  function getPokemon(data) {
    var pokemonResults = data.results;

    $.each(pokemonResults, function(i, index){
      // console.log(index);
      pokemonURLs.push(index.url);
    });

    $.when(...pokemonURLs).done(function(){
      getPokemonDetails(arguments);
    })
  }

  function getPokemonDetails(url){
    var promises = [];
    $.each(url, function(i, index){

      $.getJSON(index, function(data){
        var pokemon = [data.name, data.stats];
        var abilityURLs = [];
        $.each(data.abilities, function(a, abilities){
          abilityURLs.push(abilities.ability.url)
        });

        pokemon.push(abilityURLs);

        $.when(...pokemon).done(function(){
          pokemons.push(arguments);
        });
      }).done(function(){promises.push(pokemons)});

    });

    $.when(...promises).done(function(){
      console.log(arguments);
    });
  }

  $.getJSON(url, pokemonOptions, getPokemon);
})
