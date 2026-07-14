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

            // Convert Markdown to HTML
            notesContainer.innerHTML = marked.parse(markdown);

            // Render LaTeX equations
            renderMathInElement(notesContainer, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ],
                throwOnError: false
            });

        })
        .catch(() => {
            notesContainer.innerHTML = "<h2>Notes Coming Soon...</h2>";
        });

}
