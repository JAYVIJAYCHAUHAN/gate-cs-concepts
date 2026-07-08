// Detect current subject

const page = window.location.pathname.split("/").pop();

const fileName = page.replace(".html", ".txt");

const notesContainer = document.getElementById("notes");

if (notesContainer) {

    fetch("../notes/" + fileName)

        .then(response => response.text())

        .then(text => {

            const concepts = text.split("==================================================");

            let html = "";

            concepts.forEach(concept => {

                concept = concept.trim();

                if (!concept) return;

                const lines = concept.split("\n");

                const title = lines[0].replace("#", "").trim();

                const body = lines.slice(1).join("\n");

html += `
<section class="note">
    <h2>${title}</h2>

    <pre class="note-content">${body}</pre>

</section>
`;

            });

            notesContainer.innerHTML = html;

        });

}
