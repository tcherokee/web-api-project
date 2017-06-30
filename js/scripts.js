$(document).ready(function() {
  var url = 'http://pokeapi.co/api/v2/pokemon/';

  var pokemonOptions = {
    limit:2
  }

  function getPokemonData(data){
    return Promise.all(data
              .map(url => $.getJSON(url)
                .then(function(data){
                  var p = Promise.resolve(getPokemonAbility(data.abilities));

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
                .then(abilityData => abilityData.name)))
  }

  $.when($.getJSON(url, pokemonOptions))
    .then(data => data.results)
    .then(data => data
      .map(data => data.url))
    .then(getPokemonData)
    .then(function(data){
      var p = Promise.resolve(data);
      p.then(function(v) {
        console.log(v[1]); // 1
      });
    })

})
