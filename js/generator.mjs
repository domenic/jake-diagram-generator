import createDiagram from "./create-diagram.mjs";

const textarea = document.querySelector("textarea");
const htmlSpecMode = document.querySelector("#html-spec-mode");
const preview = document.querySelector("#preview");
const code = document.querySelector("#code");
const permalink = document.querySelector("#permalink");

if (location.hash) {
  textarea.value = atob(location.hash.substring(1));
}

textarea.oninput = htmlSpecMode.oninput = update;
update();

permalink.onclick = () => {
  location.href = getPermalink(textarea.value);
};


function update() {
  const input = textarea.value;

  try {
    const table = createDiagram(input);
    if (htmlSpecMode.checked) {
      addDataX(table);
    }
    const comment = `<!--${getPermalink(input)} -->`;

    preview.replaceChildren(table);
    code.replaceChildren(comment + "\n" + table.outerHTML);
  } catch (e) {
    preview.innerHTML = `<p class="error">${e.message}</p><p class="stack">${e.stack}</p>`;
    code.replaceChildren();
  }
}

function getPermalink(input) {
  const url = new URL(location.href);
  url.hash = btoa(input);
  return url.href;
}

function addDataX(rootElement) {
  for (const code of rootElement.querySelectorAll("code")) {
    code.setAttribute("data-x", "");
  }
}
