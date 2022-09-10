// What documents we have CSS classes for. Expand this if you edit jake-diagrams.css.
const docs = [0, 1, 2, 3, 4, 5];

export default input => {
  const lines = splitInputIntoLines(input);

  const table = document.createElement("table");
  table.className = "jake-diagram";

  const tHead = table.appendChild(document.createElement("thead"));
  const headRow = tHead.appendChild(document.createElement("tr"));
  headRow.appendChild(document.createElement("td"));

  const tBody = table.appendChild(document.createElement("tbody"));

  let maxStep = 0;
  let nextDocIndexToUse = 0;
  let docSignifiersToDocIndices = new Map();

  let i = 0;
  let currentStep = null;
  let docsToUse = docs;
  while (i < lines.length) {
    const currentLine = /^!current\s*=\s*(\d+)$/.exec(lines[i]);
    if (currentLine) {
      currentStep = Number(currentLine[1]);
      ++i;
      continue;
    }

    const skipDocsLine = /^!skipDocColors\s*=\s*([\d, ]+)$/.exec(lines[i]);
    if (skipDocsLine) {
      const skipDocs = skipDocsLine[1].split(",").map(s => Number(s.trim()));
      docsToUse = docsToUse.filter(doc => !skipDocs.includes(doc));
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

      let docIndex = nextDocIndexToUse;
      if (docSignifier) {
        if (docSignifiersToDocIndices.has(docSignifier)) {
          docIndex = docSignifiersToDocIndices.get(docSignifier);
        } else {
          docSignifiersToDocIndices.set(docSignifier, docIndex);
          ++nextDocIndexToUse;
        }
      } else {
        ++nextDocIndexToUse;
      }
      if (docIndex >= docs.length) {
        throw new Error(
          `This diagram has more than ${docs.length} documents, which is the maximum we have colors for right now.`
        );
      }

      let startingStep = steps;
      let endingStep = steps;
      if (steps.includes("-")) {
        [, startingStep, endingStep] = /^(\d+)-(\d+)$/.exec(steps);
      }
      maxStep = Math.max(maxStep, endingStep);

      // We may have to create up to two <td> elements:
      //   1.) Definitely we'll create a <td> representing the session history entry that spans
      //       `endingStep - startingStep + 1` "steps".
      //   2.) If the <td> from above represents an <iframe> that was dynamically created sometime
      //       after step 0, then we create a "filler" <td> to fill the gap between step 0 and
      //       `startingStep`.
      if (startingStep > 0 && Array.from(tr.children).length == 1) {
        const filler_td = tr.appendChild(document.createElement("td"));
        filler_td.colSpan = startingStep;
        filler_td.className = `doc-${docsToUse[docIndex]}`;
        filler_td.textContent = url;
        filler_td.docIndex = docIndex;
        filler_td.classList.add("filler");
      }

      const td = tr.appendChild(document.createElement("td"));
      td.colSpan = endingStep - startingStep + 1;
      td.className = `doc-${docsToUse[docIndex]}`;
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
