import createDiagram from "./create-diagram.mjs";

const textarea = document.querySelector("textarea");
const preview = document.querySelector("#preview");
const code = document.querySelector("#code");
const permalink = document.querySelector("#permalink");

if (location.hash) {
  textarea.value = atob(location.hash.substring(1));
}

textarea.oninput = () => {
  const input = getInput();

  try {
    const table = createDiagram(input);
    const comment = `<!--\n${getPermalink(input)}\n\n${input}\n-->`;

    preview.replaceChildren(table);
    code.replaceChildren(table.outerHTML + "\n\n" + comment);
  } catch (e) {
    preview.innerHTML = `<p class="error">${e.message}</p><p class="stack">${e.stack}</p>`;
    code.replaceChildren();
  }
};
textarea.oninput();

permalink.onclick = () => {
  location.href = getPermalink(getInput());
};

function getPermalink(input) {
  const url = new URL(location.href);
  url.hash = btoa(input);
  return url.href;
}

function getInput() {
  let input = textarea.value;
  if (input.endsWith("\n")) {
    // Makes it a bit prettier in the HTML comment we output.
    input = input.substring(0, input.length - 1);
  }
  return input;
}
