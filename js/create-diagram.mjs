export default input => {
  const lines = splitInputIntoLines(input);

  const table = document.createElement("table");
  table.className = "jake-diagram";

  const tHead = table.appendChild(document.createElement("thead"));
  const headRow = tHead.appendChild(document.createElement("tr"));
  headRow.appendChild(document.createElement("td"));

  const tBody = table.appendChild(document.createElement("tbody"));

  let maxStep = 0;
  let currentDoc = 0;
  let docSignifiersToDocIndices = new Map();

  let i = 0;
  let currentStep = null;
  while (i < lines.length) {
    const currentLine = /^!current\s*=\s*(\d+)$/.exec(lines[i]);
    if (currentLine) {
      currentStep = Number(currentLine[1]);
      ++i;
      continue;
    }

    const frameName = lines[i];
    const tr = tBody.appendChild(document.createElement("tr"));
    const th = tr.appendChild(document.createElement("th"));
    th.appendChild(document.createElement("code")).textContent = frameName;

    ++i;
    while (lines[i]?.startsWith(" ")) {
      const [, steps, url, docSignifier] = /^\s+([\d-]+): (.+?)(?: | (.+))?$/.exec(lines[i]);

      let docIndex = currentDoc;
      if (docSignifier) {
        if (docSignifiersToDocIndices.has(docSignifier)) {
          docIndex = docSignifiersToDocIndices.get(docSignifier);
        } else {
          docSignifiersToDocIndices.set(docSignifier, docIndex);
          ++currentDoc;
        }
      } else {
        ++currentDoc;
      }

      let startingStep = steps;
      let endingStep = steps;
      if (steps.includes("-")) {
        [, startingStep, endingStep] = /^(\d+)-(\d+)$/.exec(steps);
      }
      maxStep = Math.max(maxStep, endingStep);

      const td = tr.appendChild(document.createElement("td"));
      td.colSpan = endingStep - startingStep  + 1;
      td.className = `doc-${docIndex}`;
      td.docIndex = docIndex;
      td.textContent = url;

      if (startingStep <= currentStep && currentStep <= endingStep) {
        td.classList.add("current");
      }

      ++i;
    }

    // Now that we have all the columns for this navigable, go mark up same-document relationships.
    for (const td of tr.querySelectorAll("td")) {
      if (td.docIndex === td.previousElementSibling?.docIndex) {
        td.classList.add("prev-is-same-doc");
      }
      if (td.docIndex === td.nextElementSibling?.docIndex) {
        td.classList.add("next-is-same-doc");
      }
    }
  }

  for (let i = 0; i <= maxStep; ++i) {
    const th = headRow.appendChild(document.createElement("th"));
    th.className = "step";
    th.textContent = i;

    if (i === currentStep) {
      th.classList.add("current");
    }
  }

  return table;
};

function splitInputIntoLines(input) {
  const [, leadingWhitespace] = /^(\s*)/.exec(input);
  return input
    .split("\n")
    .map(l => l.substring(leadingWhitespace.length))
    .filter(l => l.length > 0);
}
