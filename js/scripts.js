$(document).ready(function() {

  var pokemonURL = "http://pokeapi.co/api/v2/pokemon/"
  var pokemonOptions = {
    limit:1
  }
  function getJSONData(data) {
    var nameHTML;
    var imageHTML;
    var statsHTML;
    var abilityHTML;

    $.each(data.results, function(i, pokemon){
      var name = '<h2>' + pokemon.name + '</h2>';

      $.getJSON(pokemon.url, function(embeddedData){

        var image = '<img src="' + embeddedData.sprites.front_shiny + '" class="img-r" />'

        var reversedStats = $(embeddedData.stats).get().reverse();

        statsHTML = '<div class="col-33-l"><ul>';
        $.each(reversedStats, function(j, stats){
            statsHTML += '<li><span>' + stats.stat.name + '</span>'  + stats.base_stat + '</li>';
        }) //End Each for Stats
        statsHTML +='</ul></div>'

        console.log(statsHTML);

        $.each(embeddedData.abilities, function(j, ability){
            console.log(ability);
        }) //End Each for Abilities
      }); //End GetJSON
    }); //End Each for Pokemon
  }; // End Function

  $.getJSON(pokemonURL, pokemonOptions, getJSONData);
})
