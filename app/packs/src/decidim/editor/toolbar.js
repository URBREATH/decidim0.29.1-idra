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
  
  async function openModal(editor) {
    try {
      await fetchData(); // Assicurati che i dati siano stati recuperati
    
      // Crea il markup HTML per il modale usando gli stili del _datasets_list.html.erb
      const modalHtml = `
        <div class="modal-overlay" style="
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%; 
          background-color: rgba(0, 0, 0, 0.5); 
          z-index: 1000; 
          display: flex; 
          justify-content: center; 
          align-items: center;">
            
          <div class="modal" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
            z-index: 1001;
            width: 60%;
            height: 80%;
            border-radius: 15px;
            overflow: hidden;">
            
            <h2 style="text-align: center; padding: 5px 0 20px 0;">Saved Datasets</h2>
            
            <input type="text" id="searchBar" placeholder="Search Datasets" style="
              width: 100%; 
              padding: 10px; 
              box-sizing: border-box; 
              border: 1px solid #ccc; 
              border-radius: 5px; 
              margin-bottom: 10px;">
              
            <div id="linksContainer" style="
              height: 60vh;
              overflow-y: auto;
              margin-top: 1em;
              border: 1px solid lightgray;
              border-radius: 5px;
              padding: 5px;">
              
              ${modalData.map(element => `
                <div class="dataset-item" style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin: 5px 0;
                  padding: 0 5px;
                  transition: background-color 0.2s;">
                  
                  <a href="${element.url}" target="_blank" style="flex-grow: 1;">${element.title}</a>
                  
                  <button class="button button__secondary outline-none" data-url="${element.url}" data-title="${element.title}" 
                    style="
                      margin-left: auto;
                      border-radius: 5px;
                      padding: 0 10px;
                      color: white;
                      cursor: pointer;
                      background-color: #2B2347;">Add</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    
      // Inserisci il modale nel DOM
      const modalWrapper = document.createElement('div');
      modalWrapper.innerHTML = modalHtml;
      const modalElement = modalWrapper.firstElementChild;
      document.body.appendChild(modalElement);
    
      // Aggiungi hover effect ai dataset items
      const datasetItems = document.querySelectorAll('.dataset-item');
      datasetItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = 'lightgray';
        });
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = '';
        });
      });
    
      // Aggiungi gli event listener
      const searchBar = document.getElementById('searchBar');
      searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        const listItems = document.querySelectorAll('.dataset-item');
        listItems.forEach(item => {
          const title = item.querySelector('a').textContent.toLowerCase();
          item.style.display = title.includes(query) ? 'flex' : 'none';
        });
      });
    
      // Event delegation per i pulsanti di copia
      document.getElementById('linksContainer').addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-button')) {
          const button = event.target;
          const url = button.dataset.url;
          const title = button.dataset.title;
          
          // Aggiorna lo stile del pulsante
          button.textContent = 'Done';
          button.disabled = true;
          button.style.color = 'grey';
          button.style.cursor = 'not-allowed';
          button.style.opacity = '0.6';
          button.style.border = '1px solid grey';
          button.style.backgroundColor = 'transparent';
          
          // Inserisci il link nell'editor
          const linkHTML = `<a href="${url}" target="_blank">${title}</a>`;
          editor.commands.insertContent(linkHTML);
          editor.commands.insertContent('<p><br></p>');
        }
      });
    
      // Chiusura del modale cliccando all'esterno
      modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
          modalElement.remove();
        }
      });
    
      return modalElement;
    } catch (error) {
      console.error('Errore nel caricare i dati:', error);
      return null;
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
