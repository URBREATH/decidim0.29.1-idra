document.addEventListener("DOMContentLoaded", function() {

    function openModal() {
      var modalOverlay = document.querySelector(".modal-overlay");
      if (modalOverlay) {
          modalOverlay.style.display = "block";
      } else {
          console.error("Elemento '.modal-overlay' non trovato.");
      }
  }
  
  function closeModal() {
      var modalOverlay = document.querySelector(".modal-overlay");
      if (modalOverlay) {
          modalOverlay.style.display = "none";
      } else {
          console.error("Elemento '.modal-overlay' non trovato.");
      }
  }
  
  var openModalButton = document.getElementById("openModalButton");
  if (openModalButton) {
      openModalButton.addEventListener("click", openModal);
  }
  
  var closeModalButton = document.getElementById("closeModal");
  if (closeModalButton) {
      closeModalButton.addEventListener("click", closeModal);
  }
  
  // Esporta le funzioni globalmente
  window.openModal = openModal;
  window.closeModal = closeModal;
  
    function filterDatasets() {
      var input = document.getElementById('search-bar');
      var filter = input.value.toLowerCase();
      var datasetsList = document.getElementById("datasets-list");
      var datasetItems = datasetsList.getElementsByClassName('dataset-item');
  
      for (var i = 0; i < datasetItems.length; i++) {
        var a = datasetItems[i].getElementsByTagName("a")[0];
        var txtValue = a.textContent || a.innerText;
        datasetItems[i].style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
      }
    }
  
    function refreshPage() {
      location.reload(); // Preferisci location.reload() per ricaricare la pagina
    }
  
    function closeModalIfEmpty(refreshPageFlag) {
      if (typeof counter !== 'undefined' && counter === 0) { // Assicurati che counter sia definito
        var modalOverlay = document.querySelector(".modal-overlay");
        if (modalOverlay) {
          modalOverlay.style.display = "none";
        }
        updatePartialView(); // Assicurati che questa funzione sia definita
        if (refreshPageFlag) {
          refreshPage();
        }
      }
    }
  
    function deleteDataset(id) {
      var deleted = 0;
      var counterText = document.getElementById("count");
      var button = document.getElementById('buttonId-' + id);
      if (confirm("Are you sure you want to delete this dataset?")) {
        fetch('/idra_delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector("meta[name=csrf-token]").content
          },
          body: JSON.stringify({ selected_dataset_id: id })
        })
        .then(response => {
          if (response.ok) {
            updatePartialView(); // Assicurati che questa funzione sia definita
            button.setAttribute('data-star', '0');
            button.innerHTML = "☆"; // Set the button content to "☆"
            button.style.color = ""; // Reset button text color
            counter--; // Assicurati che counter sia definito
            counterText.innerHTML = counter;
            var deleteEvent = new CustomEvent('datasetDeleted', { detail: { deleted: deleted } });
            document.dispatchEvent(deleteEvent);
            closeModalIfEmpty(true);
          } else {
            // Gestisci gli errori se necessario
          }
        })
        .catch(error => {
          // Gestisci gli errori se necessario
        });
      }
    }
  
    // Rendi filterDatasets e deleteDataset globali
    window.filterDatasets = filterDatasets;
    window.deleteDataset = deleteDataset;
    window.refreshPage = refreshPage;
  
    // Aggiungi listener per l'input di ricerca
    var searchBar = document.getElementById('search-bar');
    if (searchBar) {
      searchBar.addEventListener('input', filterDatasets);
    }
  
    // Aggiungi listener per i pulsanti di eliminazione
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        var datasetId = this.getAttribute('data-dataset-id');
        if (datasetId) {
          deleteDataset(datasetId);
        }
      });
    });
  });