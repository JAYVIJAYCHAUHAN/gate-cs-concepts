// Detect current subject
const page = window.location.pathname.split("/").pop();
const fileName = page.replace(".html", ".md");
const subjectName = page.replace(".html", "");

const notesContainer = document.getElementById("notes");

if (notesContainer) {

    fetch("../notes/" + fileName)
        .then(response => response.text())
        .then(markdown => {

            // Automatically fix image paths
            markdown = markdown.replace(
                /!\[(.*?)\]\((.*?)\)/g,
                (match, alt, src) =>
                    `![${alt}](../images/${subjectName}/${src})`
            );

            notesContainer.innerHTML = marked.parse(markdown);

        })
        .catch(() => {
            notesContainer.innerHTML = "<h2>Notes Coming Soon...</h2>";
        });

}
