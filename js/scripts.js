$(document).ready(function() {
  var url = 'http://pokeapi.co/api/v2/pokemon/';

  var pokemonOptions = {
    limit:2
  }

  $.when($.getJSON(url, pokemonOptions))
    .then(function(data){
      return data.results;
    })
    .then(function(data){
      return data.map(data => data.url);
    })
    .then(function(data){
      return $.when(...data.map(url => $.getJSON(url).then(data => [data.name, data.stats, data.abilities])));

      // return $.when(...data.map(function(url){
      //   $.getJSON(url).then(function(poke){
      //       poke.name;
      //     })//End Then
      //   })//End Map
      // )// End When
    })
    .then(function(data){
      // data.map()
    })

})
