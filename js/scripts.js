$(document).ready(function() {
  var url = 'http://pokeapi.co/api/v2/pokemon/';

  var pokemonOptions = {
    limit:5
  }

  function getPokemonData(data){
    return Promise.all(data
              .map(url => $.getJSON(url)
                .then(function(data){
                  let p = Promise.resolve(getPokemonAbility(data.abilities));

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

  function buildHTML(pokemonData) {
      var p = Promise.resolve(pokemonData);
      var imageHTML;
      var nameHTML;
      var statsHTML;
      var abilityHTML;
      var fullHTML;

      p.then(function(v) {
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
          fullHTML += '<div class="poke-skills clearfix"><h3>Skills</h3>';
          fullHTML += statsHTML;
          fullHTML += '</div>'
          fullHTML += '<div class="poke-abilities clearfix"><h3>Abilities</h3><div><ul>';
          fullHTML += abilityHTML;
          fullHTML += '</ul></div></div>';

          $('#cards-container').append(fullHTML);

        })
      })
  }

  $.when($.getJSON(url, pokemonOptions))
    .then(data => data.results)
    .then(data => data
      .map(data => data.url))
    .then(getPokemonData)
    .then(buildHTML)

})
