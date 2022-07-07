import createDiagram from "./create-diagram.mjs";

const textarea = document.querySelector("textarea");
const preview = document.querySelector("#preview");
const code = document.querySelector("#code");

textarea.oninput = () => {
  let input = textarea.value;
  if (input.endsWith("\n")) {
    // Makes it a bit prettier in the HTML comment we output.
    input = input.substring(0, input.length - 1);
  }

  try {
    const table = createDiagram(input);
    const comment = `<!--\nhttps://domenic.github.io/jake-diagram-generator\n\n${input}\n-->`;

    preview.replaceChildren(table);
    code.replaceChildren(table.outerHTML + "\n\n" + comment);
  } catch (e) {
    preview.innerHTML = `<p class="error">${e.message}</p><p class="stack">${e.stack}</p>`;
    code.replaceChildren();
  }
};
textarea.oninput();
