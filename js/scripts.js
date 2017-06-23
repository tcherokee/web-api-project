$(document).ready(function() {
  var nameHTML;
  var statsHTML;
  var abilityHTML;
  var buildHTML;
  var pokemonURL = "http://pokeapi.co/api/v2/pokemon/"
  var pokemonOptions = {
    limit:2
  }

  function getJSONData(data) {

    $.each(data.results, function(i, pokemon){;

      $.getJSON(pokemon.url, pokemonProfile).done(function(){});


    }); //End Each for Pokemon
  }; // End Function

  function pokemonProfile(profileData) {
    nameHTML = '';
    statsHTML = '';

    nameHTML += '<img src="' + profileData.sprites.front_shiny + '"/>';
    nameHTML += '<h2>' + profileData.name + '</h2>'

    //Reversing Stats to fit with the design
    var reversedStats = $(profileData.stats).get().reverse();
    var divOne = '<div class="col-33-l"><ul>';
    var divTwo = '<div class="col-66-l"><ul>'

    $.each(reversedStats, function(i, index){
      if (i < reversedStats.length/2) {
          divOne += '<li><span>' + index.stat.name + '</span>'  + index.base_stat + '</li>';
      } else {
          divTwo += '<li><span>' + index.stat.name + '</span>'  + index.base_stat + '</li>';
      }
    });

    divOne += '</ul></div>';
    divTwo += '</ul></div>';

    statsHTML = divOne + divTwo;

    // // console.log(statsHTML);
    // var promises = [];
    //
    // // console.log(...profileData.abilities);
    //
    // // promises.push(...profileData.abilities);
    // // console.log(promises[0].ability.url);
    // var test;
    // $.each(profileData.abilities, function(i, index){
    //   promises.push($.getJSON(index.ability.url, pokemonAbilities));
    // });
    // $.when(...promises).then(function(...args){
    //   console.log(nameHTML);
    // });

    // console.log(...promises);
    // $.when(...promises)
    //   .then(function(x,y){
    //   // console.log(nameHTML);
    //     test = $.getJSON(x, pokemonAbilities);
    //   })
    //   test.done(function(test){
    //     console.log(abilityHTML);
    //     console.log(nameHTML);
    //   })

    // console.log(abilityHTML);

    // console.log(promises);

    abilityHTML = '';
    pokemonAbilities(profileData.abilities);
  }

  function pokemonAbilities(data){
    var ability = [];

    $.each(data, function(i, index) {
      $.getJSON(index.ability.url, function(abilityData){
        var abilityObj = abilityData.effect_entries[0];
        ability.push('<li><span>' + abilityData.name + '</span>' + abilityObj.effect + '</li>');
      });
    });
    $.when.apply($,ability).done(function(){
      console.log(arguments);
    })
  }

  function buildFullHTML(pokeName, pokeStats, pokeAbility) {
    buildHTML = '';
    buildHTML += '<div class="card"><img src="images/pokemon-logo.png" class="img-r" />';
    buildHTML += '<div class="poke-name">' + pokeName + '</div>';
    buildHTML += '<div class="poke-skills clearfix"><h3>Stats</h3>' + pokeStats + '</div>';
    buildHTML += '<div class="poke-abilities clearfix"><h3>Abilities</h3><div><ul>' + pokeAbility + '</ul></div></div>';
    buildHTML += '</div>';

    $('#cards-container').append(buildHTML);
  }

  $.getJSON(pokemonURL, pokemonOptions, getJSONData);
})
