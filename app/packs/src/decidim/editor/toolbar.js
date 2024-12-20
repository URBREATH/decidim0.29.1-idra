import { getDictionary } from "src/decidim/i18n";
import html from "src/decidim/editor/utilities/html";

import iconsUrl from "images/decidim/remixicon.symbol.svg";

const createIcon = (iconName) => {
  return `<svg class="editor-toolbar-icon" role="img" aria-hidden="true">
    <use href="${iconsUrl}#ri-${iconName}" />
  </svg>`;
};

const createEditorToolbarGroup = () => {
  return html("div").dom((el) => el.classList.add("editor-toolbar-group"));
};

const createEditorToolbarToggle = (editor, { type, label, icon, action, activatable = true, text ='' }) => {
  return html("button").dom((ctrl) => {
    ctrl.classList.add("editor-toolbar-control");
    ctrl.dataset.editorType = type;
    if (activatable) {
      ctrl.dataset.editorSelectionType = type;
    }
    ctrl.type = "button";
    ctrl.ariaLabel = label;
    ctrl.title = label;
    if (icon) {
      ctrl.innerHTML = createIcon(icon);
    }
    else if (text) {
      ctrl.innerHTML = `<span class="toolbar-text">${text}</span>`;
    };
    ctrl.addEventListener("click", (ev) => {
      ev.preventDefault();
      editor.commands.focus();
      action();
    })
  });
};

const createEditorToolbarSelect = (editor, { type, label, options, action, activatable = true }) => {
  return html("select").dom((ctrl) => {
    ctrl.classList.add("editor-toolbar-control", "!pr-8");
    ctrl.dataset.editorType = type;
    if (activatable) {
      ctrl.dataset.editorSelectionType = type;
    }
    ctrl.ariaLabel = label;
    ctrl.title = label;
    options.forEach(({ label: optionLabel, value }) => {
      const option = document.createElement("option");
      option.setAttribute("value", value);
      option.textContent = optionLabel;
      ctrl.appendChild(option);
    });
    ctrl.addEventListener("change", () => {
      editor.commands.focus();
      action(ctrl.value);
    });
  })
};

/**
 * Creates the editor toolbar for the given editor instance.
 *
 * @param {Editor} editor An instance of the rich text editor.
 * @returns {HTMLElement} The toolbar element
 */
export default function createEditorToolbar(editor) {
  const i18n = getDictionary("editor.toolbar");

  const supported = { nodes: [], marks: [], extensions: [] };
  editor.extensionManager.extensions.forEach((ext) => {
    if (ext.type === "node") {
      supported.nodes.push(ext.name);
    } else if (ext.type === "mark") {
      supported.marks.push(ext.name);
    } else if (ext.type === "extension") {
      supported.extensions.push(ext.name);
    }
  });

  // Create the toolbar element
  const toolbar = html("div").
    dom((el) => el.classList.add("editor-toolbar")).
    append(
      // Text style controls
      createEditorToolbarGroup(editor).append(
        createEditorToolbarSelect(editor, {
          type: "heading",
          label: i18n["control.heading"],
          options: [
            { value: "normal", label: i18n["textStyle.normal"] },
            { value: 2, label: i18n["textStyle.heading"].replace("%level%", 2) },
            { value: 3, label: i18n["textStyle.heading"].replace("%level%", 3) },
            { value: 4, label: i18n["textStyle.heading"].replace("%level%", 4) },
            { value: 5, label: i18n["textStyle.heading"].replace("%level%", 5) },
            { value: 6, label: i18n["textStyle.heading"].replace("%level%", 6) }
          ],
          action: (value) => {
            if (value === "normal") {
              editor.commands.setParagraph();
            } else {
              editor.commands.toggleHeading({ level: parseInt(value, 10) });
            }
          }
        }).render(supported.nodes.includes("heading"))
      )
    ).
    append(
      // Basic styling controls
      createEditorToolbarGroup(editor).append(
        createEditorToolbarToggle(editor, {
          type: "bold",
          icon: "bold",
          label: i18n["control.bold"],
          action: () => editor.commands.toggleBold()
        }).render(supported.marks.includes("bold")),
        createEditorToolbarToggle(editor, {
          type: "italic",
          icon: "italic",
          label: i18n["control.italic"],
          action: () => editor.commands.toggleItalic()
        }).render(supported.marks.includes("italic")),
        createEditorToolbarToggle(editor, {
          type: "underline",
          icon: "underline",
          label: i18n["control.underline"],
          action: () => editor.commands.toggleUnderline()
        }).render(supported.marks.includes("underline")),
        createEditorToolbarToggle(editor, {
          type: "hardBreak",
          icon: "text-wrap",
          label: i18n["control.hardBreak"],
          activatable: false,
          action: () => editor.commands.setHardBreak()
        }).render(supported.nodes.includes("hardBreak"))
      )
    ).
    append(
      // List controls
      createEditorToolbarGroup(editor).append(
        createEditorToolbarToggle(editor, {
          type: "orderedList",
          icon: "list-ordered",
          label: i18n["control.orderedList"],
          action: () => editor.commands.toggleOrderedList()
        }).render(supported.nodes.includes("orderedList")),
        createEditorToolbarToggle(editor, {
          type: "bulletList",
          icon: "list-unordered",
          label: i18n["control.bulletList"],
          action: () => editor.commands.toggleBulletList()
        }).render(supported.nodes.includes("bulletList"))
      )
    ).
    append(
      // Link and erase styles
      createEditorToolbarGroup(editor).append(
        createEditorToolbarToggle(editor, {
          type: "link",
          icon: "link",
          label: i18n["control.link"],
          action: () => editor.commands.linkDialog()
        }).render(supported.marks.includes("link")),
        createEditorToolbarToggle(editor, {
          type: "common:eraseStyles",
          icon: "eraser-line",
          label: i18n["control.common.eraseStyles"],
          activatable: false,
          action: () => {
            if (editor.isActive("link") && editor.view.state.selection.empty) {
              const originalPos = editor.view.state.selection.anchor;
              editor.chain().focus().extendMarkRange("link").unsetLink().setTextSelection(originalPos).run();
            } else {
              editor.chain().focus().clearNodes().unsetAllMarks().run();
            }
          }
        }).render(
          supported.nodes.includes("heading") ||
          supported.marks.includes("bold") ||
          supported.marks.includes("italic") ||
          supported.marks.includes("underline") ||
          supported.nodes.includes("hardBreak") ||
          supported.nodes.includes("orderedList") ||
          supported.nodes.includes("bulletList") ||
          supported.marks.includes("link")
        )
      )
    ).
    append(
      // Block styling
      createEditorToolbarGroup(editor).append(
        createEditorToolbarToggle(editor, {
          type: "codeBlock",
          icon: "code-line",
          label: i18n["control.codeBlock"],
          action: () => editor.commands.toggleCodeBlock()
        }).render(supported.nodes.includes("codeBlock")),
        createEditorToolbarToggle(editor, {
          type: "blockquote",
          icon: "double-quotes-l",
          label: i18n["control.blockquote"],
          action: () => editor.commands.toggleBlockquote()
        }).render(supported.nodes.includes("blockquote"))
      )
    ).
    append(
      // Indent and outdent
      createEditorToolbarGroup(editor).append(
        createEditorToolbarToggle(editor, {
          type: "indent:indent",
          icon: "indent-increase",
          label: i18n["control.indent.indent"],
          activatable: false,
          action: () => editor.commands.indent()
        }).render(supported.extensions.includes("indent")),
        createEditorToolbarToggle(editor, {
          type: "indent:outdent",
          icon: "indent-decrease",
          label: i18n["control.indent.outdent"],
          activatable: false,
          action: () => editor.commands.outdent()
        }).render(supported.extensions.includes("indent"))
      )
    ).
    append(
      // Multimedia
      createEditorToolbarGroup(editor).append(
        createEditorToolbarToggle(editor, {
          type: "videoEmbed",
          icon: "video-line",
          label: i18n["control.videoEmbed"],
          action: () => editor.commands.videoEmbedDialog()
        }).render(supported.nodes.includes("videoEmbed")),
        createEditorToolbarToggle(editor, {
          type: "image",
          icon: "image-line",
          label: i18n["control.image"],
          action: () => editor.commands.imageDialog()
        }).render(supported.nodes.includes("image"))
      )
    ).append(
      // SavedDatasets
      createEditorToolbarGroup(editor).append(
        createEditorToolbarToggle(editor, {
          type: "customButton",
          text: "<span style='color: #f1c232; display: inline-block; transform: translateY(-4px);'>★</span>",
          label: "Saved Datasets",
          action: () => openModal(editor)
        })
      )
    ).
    render()
  ;

  let modalData = [];
  let hasFetched = false; // Flag to check if data has been fetched

  function fetchData() {
    return new Promise((resolve, reject) => {
      if (!hasFetched) { // Check if fetch hasn't been performed yet
        fetch('/idra_modal_editor', {
          method: 'GET',
        })
          .then((response) => {
            if (response.ok) {
              return response.text(); // Assuming the response is HTML
            } else {
              throw new Error('Failed to fetch the updated content');
            }
          })
          .then((data) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const datasetElements = doc.querySelectorAll('#datasets-list a');
            
            // Parse the datasets
            modalData = Array.from(datasetElements).map((dataset) => {
              return {
                title: dataset.textContent,
                url: dataset.getAttribute('href'),
              };
            });
  
            hasFetched = true; // Set the flag to indicate that fetch has been performed
            resolve();
          })
          .catch((error) => {
            console.error('Error updating partial view:', error);
            reject(error);
          });
      } else {
        resolve();
      }
    });
  }
  
  async function openModal() {
    try {
      await fetchData(); // Assicurati che i dati siano stati recuperati
  
      // Crea e stila il contenitore del modal
      const modalContainer = document.createElement('div');
      modalContainer.style.position = 'fixed';
      modalContainer.style.top = '0';
      modalContainer.style.left = '0';
      modalContainer.style.width = '100%';
      modalContainer.style.height = '100%';
      modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      modalContainer.style.display = 'flex';
      modalContainer.style.justifyContent = 'center';
      modalContainer.style.alignItems = 'center';
      modalContainer.style.zIndex = '1000';
  
      // Crea e stila l'elemento modal con dimensioni fisse
      const modal = document.createElement('div');
      modal.style.backgroundColor = '#fff';
      modal.style.borderRadius = '8px';
      modal.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.3)';
      modal.style.width = '800px'; // Larghezza fissa
      modal.style.minHeight = '80vh'; // Altezza minima
      modal.style.maxHeight = '80vh'; // Altezza massima
      modal.style.position = 'relative';
      modal.style.overflowY = 'auto'; // Previene lo scroll nel modal
      modal.style.padding = '1em'; // Aggiungi padding per estetica
      modal.style.boxSizing = 'border-box'; // Include padding nel calcolo dell'altezza
  
      // Crea e stila il contenuto del modal
      const modalContent = document.createElement('div');
      modalContent.id = 'modalContent';
      modalContent.style.overflow = 'initial'
      modalContent.style.maxHeight = '50vh'
  
      // Crea e stila la barra di ricerca
      const searchBar = document.createElement('input');
      searchBar.type = 'text';
      searchBar.placeholder = 'Search...';
      searchBar.style.width = '100%';
      searchBar.style.padding = '10px';
      searchBar.style.boxSizing = 'border-box';
      searchBar.style.border = '1px solid #ccc';
      searchBar.style.borderRadius = '5px';
      searchBar.style.marginBottom = '10px';
      searchBar.addEventListener('input', filterResults);
  
      // Crea e stila il contenitore dei link
      const linksDiv = document.createElement('div');
      linksDiv.id = 'linksContainer';
      linksDiv.style.display = 'flex';
      linksDiv.style.flexDirection = 'column';
      linksDiv.style.gap = '10px'; // Aggiusta lo spazio tra gli elementi
  
      // Crea e stila il titolo del modal
      const titleElement = document.createElement('h1');
      titleElement.textContent = "Saved Datasets";
      titleElement.style.textAlign = 'center';
      modal.appendChild(titleElement);
  
      // Memorizza gli item originali della lista
      const listItems = modalData.map(element => {
        const listItem = document.createElement('div');
        listItem.classList.add('list-item');
        listItem.style.display = 'flex';
        listItem.style.justifyContent = 'space-between';
        listItem.style.alignItems = 'center';
  
        const link = document.createElement('a');
        link.href = element.url;
        link.textContent = element.title;
        link.target = "_blank"; // Apri in una nuova finestra
  
        var disabled = false;
  
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Add';
        copyButton.style.marginLeft = '10px';
        copyButton.style.borderRadius = '5px';
        copyButton.style.padding = '5px 10px';
        copyButton.style.color = 'white';
        copyButton.style.cursor = 'pointer'; // Imposta il cursore a mano
        copyButton.style.backgroundColor = '#2F4EA1'; // Imposta il colore di sfondo
  
        // Gestisci il click sul bottone per copiare e incollare il link nell'editor
        copyButton.addEventListener('click', () => {
          copyButton.textContent = 'Done';
          copyButton.disabled = true;
          copyButton.style.color = 'grey';
          copyButton.style.cursor = "not-allowed";
          copyButton.style.opacity = "0.6";
          copyButton.style.border = '1px solid grey';
          copyButton.style.backgroundColor = 'transparent';
          disabled = true;
        
          // Inserisci il link nell'editor
          const linkHTML = `<a href="${element.url}" target="_blank">${element.title}</a>`;
          editor.commands.insertContent(linkHTML);
        
          // Aggiungi una nuova riga sotto il link
          editor.commands.insertContent('<p><br></p>'); // Usa un paragrafo vuoto per forzare il nuovo rigo
        });
  
        listItem.appendChild(link);
        listItem.appendChild(copyButton);
        linksDiv.appendChild(listItem);
  
        return listItem;
      });
  
      // Funzione per filtrare i risultati in base alla barra di ricerca
      function filterResults() {
        const query = searchBar.value.toLowerCase();
        listItems.forEach(item => {
          const title = item.querySelector('a').textContent.toLowerCase();
          if (title.includes(query)) {
            item.style.display = 'flex'; // Mostra l'elemento
          } else {
            item.style.display = 'none'; // Nascondi l'elemento
          }
        });
      }
  
      // Aggiungi gli elementi alla finestra modale
      modalContent.appendChild(searchBar);
      modalContent.appendChild(linksDiv);
      modal.appendChild(modalContent);
      modalContainer.appendChild(modal);
  
      // Aggiungi la finestra modale al corpo del documento
      document.body.appendChild(modalContainer);
  
      // Aggiungi l'evento di chiusura del modal se si fa clic fuori dal contenitore
      modalContainer.addEventListener('click', (event) => {
        // Verifica se il clic è fuori dal modal (non sul contenuto)
        if (event.target === modalContainer) {
          modalContainer.remove(); // Rimuovi il modal se il clic è fuori
        }
      });
  
    } catch (error) {
      console.error('Errore nel caricare i dati:', error);
    }
  }
  
  


  const selectionControls = toolbar.querySelectorAll(".editor-toolbar-control[data-editor-selection-type]");
  const headingSelect = toolbar.querySelector(".editor-toolbar-control[data-editor-type='heading']");
  const selectionUpdated = () => {
    if (editor.isActive("heading")) {
      const { level } = editor.getAttributes("heading");
      headingSelect.value = `${level}`;
    } else if (headingSelect) {
      headingSelect.value = "normal";
    }

    selectionControls.forEach((ctrl) => {
      if (editor.isActive(ctrl.dataset.editorSelectionType)) {
        ctrl.classList.add("active");
      } else {
        ctrl.classList.remove("active");
      }
    });
  }
  editor.on("update", selectionUpdated);
  editor.on("selectionUpdate", selectionUpdated);

  return toolbar;
};
