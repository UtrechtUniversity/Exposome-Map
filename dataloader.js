window.dataCataloguePromise = fetch("metadata.json")
  .then(response => response.json())
  .then(data => {
    window.dataCatalogue = data;
    return data;
  });