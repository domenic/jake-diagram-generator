import createDiagram from "./create-diagram.mjs";

const textarea = document.querySelector("textarea");
const preview = document.querySelector("#preview");
const code = document.querySelector("#code");
const permalink = document.querySelector("#permalink");

if (location.hash) {
  textarea.value = atob(location.hash.substring(1));
}

textarea.oninput = () => {
  const input = textarea.value;

  try {
    const table = createDiagram(input);
    const comment = `<!--${getPermalink(input)} -->`;

    preview.replaceChildren(table);
    code.replaceChildren(comment + "\n" + table.outerHTML);
  } catch (e) {
    preview.innerHTML = `<p class="error">${e.message}</p><p class="stack">${e.stack}</p>`;
    code.replaceChildren();
  }
};
textarea.oninput();

permalink.onclick = () => {
  location.href = getPermalink(textarea.value);
};

function getPermalink(input) {
  const url = new URL(location.href);
  url.hash = btoa(input);
  return url.href;
}
